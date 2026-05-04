import { pledge } from "../../data/parties/policies/ldp/ldp";
import * as fs from "fs";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_EMBEDDING_MODEL = 'gemini-embedding-001';
const GEMINI_EMBEDDING_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_EMBEDDING_MODEL}:embedContent?key=${GEMINI_API_KEY}`;
const EMBEDDING_DIMENSIONS = 768;

// ★ 高市政権のadministration_idを指定
const ADMINISTRATION_ID = 1;

const PG_CONNECTION = {
    host: "localhost",
    port: "5432",
    database: "db",
    user: "user",
    password: "password",
};

interface StructuredChunk {
    id: string;
    content: string; // DBに入れる本文（プレフィックスなし）
    embeddingContent: string; // Geminiに渡す用（プレフィックスあり）
    metadata: {
        administration_id: number;
        category: string; // 大項目（chapter）
        section: string;  // 中項目（検索用、DBには入れない）
        chunk_index: number;
    };
    embedding?: number[];
}

// ============================================================
// テキスト前処理
// ============================================================
function normalizeLineEndings(text: string): string {
    return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

// ============================================================
// 章(大項目) → 節(中項目) → 文 の分割（既存ロジックそのまま）
// ============================================================
function splitIntoChapters(text: string): { title: string; body: string }[] {
    const body = text.replace(/^政策BANK\s*\n/, "");
    const chapterRegex = /^([\uFF10-\uFF19]+\uFF0E.+)$/gm;
    const matches = [...body.matchAll(chapterRegex)];

    if (matches.length === 0) {
        return [{ title: "全体", body }];
    }

    const chapters: { title: string; body: string }[] = [];
    for (let i = 0; i < matches.length; i++) {
        const start = matches[i].index!;
        const end = i + 1 < matches.length ? matches[i + 1].index! : body.length;
        const chapterText = body.slice(start, end).trim();
        const title = matches[i][1].trim();
        const chapterBody = chapterText.slice(title.length).trim();
        chapters.push({ title, body: chapterBody });
    }
    return chapters;
}

function splitIntoSections(chapterBody: string): { title: string; body: string }[] {
    const blocks = chapterBody.split(/\n{2,}/);
    const sections: { title: string; body: string }[] = [];

    for (const block of blocks) {
        const trimmed = block.trim();
        if (!trimmed) continue;

        const lines = trimmed.split("\n");
        const firstLine = lines[0].trim();
        const isFirstLineHeading =
            firstLine.length <= 40 &&
            !firstLine.includes("\u3002") &&
            !firstLine.match(/^[\uFF10-\uFF19]+\uFF0E/);

        if (isFirstLineHeading && lines.length > 1) {
            sections.push({ title: firstLine, body: lines.slice(1).join("\n").trim() });
        } else if (isFirstLineHeading && lines.length === 1) {
            sections.push({ title: firstLine, body: "" });
        } else {
            if (sections.length > 0 && !sections[sections.length - 1].body) {
                sections[sections.length - 1].body = trimmed;
            } else {
                sections.push({ title: "(その他)", body: trimmed });
            }
        }
    }

    return sections.filter((s) => s.body.trim().length > 0);
}

// ============================================================
// チャンキング
// ============================================================
async function buildStructuredChunks(): Promise<StructuredChunk[]> {
    const normalizedPledge = normalizeLineEndings(pledge);
    const chapters = splitIntoChapters(normalizedPledge);
    const allChunks: StructuredChunk[] = [];
    let globalIndex = 0;

    for (const chapter of chapters) {
        const sections = splitIntoSections(chapter.body);

        for (const section of sections) {
            if (!section.body.trim()) continue;

            const sentences = section.body
                .split("\u3002")
                .map((s) => s.trim())
                .filter((s) => s.length > 0);

            let sentenceIndex = 0;
            for (const sentence of sentences) {
                const fullSentence = `${sentence}\u3002`;

                // DBに入れるcontent: 本文のみ（カテゴリ情報はcategoryカラムで管理）
                const content = fullSentence;

                // Gemini埋め込み用: 文脈プレフィックスあり
                const embeddingContent = `【自民党公約 ＞ ${chapter.title} ＞ ${section.title}】\n${fullSentence}`;

                allChunks.push({
                    id: `ldp_s_${globalIndex}`,
                    content,
                    embeddingContent,
                    metadata: {
                        administration_id: ADMINISTRATION_ID,
                        category: chapter.title,
                        section: section.title,
                        chunk_index: sentenceIndex,
                    },
                });

                globalIndex++;
                sentenceIndex++;
            }
        }
    }

    return allChunks;
}

// ============================================================
// Gemini Embedding（embeddingContentを使う）
// ============================================================
// ============================================================
// Gemini Embedding（リトライ対応版）
// ============================================================
async function embedText(text: string, retryCount = 0): Promise<number[]> {
    const res = await fetch(GEMINI_EMBEDDING_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: `models/${GEMINI_EMBEDDING_MODEL}`,
            content: { parts: [{ text }] },
            taskType: "RETRIEVAL_DOCUMENT",
            outputDimensionality: EMBEDDING_DIMENSIONS,
        }),
    });

    if (res.status === 429) {
        if (retryCount >= 5) throw new Error("Gemini API: リトライ上限に達しました");

        // retryDelayをレスポンスから読み取る（例: "47s" → 47000ms）
        const errBody = await res.json();
        const retryDelayStr = errBody?.error?.details
            ?.find((d: any) => d["@type"]?.includes("RetryInfo"))
            ?.retryDelay as string | undefined;

        const waitMs = retryDelayStr
            ? parseInt(retryDelayStr) * 1000 + 1000 // 指定秒 + 余裕1秒
            : 60000; // フォールバック: 60秒待機

        console.warn(`  ⚠️ Rate limit (429)。${waitMs / 1000}秒後にリトライ... (${retryCount + 1}/5)`);
        await new Promise((r) => setTimeout(r, waitMs));
        return embedText(text, retryCount + 1);
    }

    if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Gemini Embedding API error: ${res.status} ${errBody}`);
    }

    const data = await res.json();
    return data.embedding.values as number[];
}

async function embedChunks(
    chunks: StructuredChunk[],
    batchSize = 5,
    delayMs = 700  // 100req/min = 1件あたり600ms以上必要、余裕を持って700ms
): Promise<StructuredChunk[]> {
    const results: StructuredChunk[] = [];

    for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const embeddings = await Promise.all(
            batch.map((chunk) => embedText(chunk.embeddingContent))
        );

        for (let j = 0; j < batch.length; j++) {
            results.push({ ...batch[j], embedding: embeddings[j] });
        }

        console.log(`  Embedded ${Math.min(i + batchSize, chunks.length)} / ${chunks.length}`);

        if (i + batchSize < chunks.length) {
            await new Promise((r) => setTimeout(r, delayMs));
        }
    }

    return results;
}

// ============================================================
// pledgesテーブルへの保存
// ============================================================
async function insertChunks(pool: any, chunks: StructuredChunk[]): Promise<void> {
    const client = await pool.connect();
    try {
        // 冪等性: 同じadministration_idの既存データを削除
        await client.query(
            "DELETE FROM pledges WHERE administration_id = $1",
            [ADMINISTRATION_ID]
        );

        const insertQuery = `
            INSERT INTO pledges (administration_id, category, content, content_vector)
            VALUES ($1, $2, $3, $4)
        `;

        for (const chunk of chunks) {
            await client.query(insertQuery, [
                chunk.metadata.administration_id,
                chunk.metadata.category,
                chunk.content,
                `[${chunk.embedding!.join(",")}]`,
            ]);
        }

        console.log(`pledgesテーブルに ${chunks.length} 件を保存しました。`);
    } finally {
        client.release();
    }
}

// ============================================================
// メイン処理
// ============================================================
async function main() {
    console.log("=== LDP 公約データ処理開始 ===\n");

    console.log("Step 1: チャンキング...");
    const chunks = await buildStructuredChunks();
    console.log(`  生成チャンク数: ${chunks.length}`);

    const jsonPath = "./ldp_pledge_chunks.json";
    fs.writeFileSync(jsonPath, JSON.stringify(chunks, null, 2), "utf-8");
    console.log(`Step 2: JSONバックアップ → ${jsonPath}`);

    console.log("\nStep 3: Gemini APIでエンベディング...");
    const embeddedChunks = await embedChunks(chunks);
    console.log(`  完了: ${embeddedChunks.length} チャンク`);

    console.log("\nStep 4: pledgesテーブルに保存...");
    const { Pool } = await import("pg");
    const pool = new Pool(PG_CONNECTION);
    await insertChunks(pool, embeddedChunks);
    await pool.end();

    console.log("\n=== 処理完了 ===");
}

main().catch(console.error);