"""
全政党公約データ処理:
  各政党の公約テキストを 大項目 / 中項目 / (小項目) / 本文 にパースし、
  「。」区切りでチャンク化、Gemini API で埋め込みベクトルを付与し、
  JSON 出力する。

対応政党:
  ldp        : 自民党       (既存パーサ流用)
  dpfp    : 国民民主党   政策各論N. → (N) → ❶❷ → ・本文
  cdp        : 立憲民主党   (TODO: フォーマット判明次第追加)
  komei      : 公明党       (TODO)
  ishin      : 日本維新の会  ＃＃＃ → ー → 本文
  jcp        : 日本共産党   N. → ＃＃＃ → ――/・本文
  reiwa      : れいわ新選組  N → ＃＃＃ → ・本文
  sansei     : 参政党       N → ー → ・本文
  hoshu      : 日本保守党   N. → ・本文
  sdp        : 社民党       N. → ・本文

実行:
  python embed_party_pledges.py                          # 全政党
  python embed_party_pledges.py --parties dpfp ishin  # 指定政党のみ
  python embed_party_pledges.py --no-embed               # 埋め込みスキップ

"""
from __future__ import annotations

import json
import re
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, Dict, List, Optional
import os
from dotenv import load_dotenv

import requests

# ============================================================
# 設定
# ============================================================
load_dotenv()

GEMINI_API_KEY         = os.getenv("GEMINI_API_KEY")
GEMINI_EMBEDDING_MODEL = "gemini-embedding-001"
EMBEDDING_DIMENSIONS   = 768

GEMINI_EMBEDDING_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/"
    f"models/{GEMINI_EMBEDDING_MODEL}:embedContent?key={GEMINI_API_KEY}"
)

# 埋め込みレート制御
EMBED_BATCH_SIZE = 5
EMBED_DELAY_SEC  = 0.7
EMBED_MAX_RETRY  = 5

# チャンク化
DEFAULT_MIN_CHUNK_LENGTH = 0


# ============================================================
# 政党設定
# ============================================================
@dataclass
class PartyConfig:
    """政党ごとの設定"""
    party_id: str           # 英字ID (ファイル名にも使用)
    party_label: str        # 日本語ラベル (埋め込みテキストに使用)
    year: int               # 公約の年
    administration_id: Optional[int] = None  # 内閣テーブルとの対応 (自民以外はNone可)
    min_chunk_length: int = DEFAULT_MIN_CHUNK_LENGTH
    source_filename: str = "manifesto.txt"  # デフォルトは manifesto.txt


# 2026年参院選の政党設定例
PARTY_CONFIGS: Dict[str, PartyConfig] = {
    "cra": PartyConfig(
        party_id="cra",
        party_label="中道改革連合",
        year=2026,
    ),
    "dpfp": PartyConfig(
        party_id="dpfp",
        party_label="国民民主党公約",
        year=2026,
    ),
    "jcp": PartyConfig(
        party_id="jcp",
        party_label="日本共産党公約",
        year=2026,
    ),
    "reiwa": PartyConfig(
        party_id="reiwa",
        party_label="れいわ新選組公約",
        year=2026,
    ),
    "sansei": PartyConfig(
        party_id="sansei",
        party_label="参政党公約",
        year=2026,
    ),
    "hoshu": PartyConfig(
        party_id="hoshu",
        party_label="日本保守党公約",
        year=2026,
    ),
    "ishin": PartyConfig(
        party_id="ishin",
        party_label="日本維新の会公約",
        year=2026,
    ),
    "sdp": PartyConfig(
        party_id="sdp",
        party_label="社民党公約",
        year=2026,
    ),
}


# ============================================================
# データ構造 (既存と同一)
# ============================================================
@dataclass
class Leaf:
    category: str           # 大項目
    section: str            # 中項目
    subsection: str = ""    # 小項目
    body: str = ""          # 本文


@dataclass
class Chunk:
    id: str
    content: str
    embeddingContent: str
    metadata: dict
    embedding: Optional[List[float]] = None


# ============================================================
# 共通ユーティリティ
# ============================================================
def normalize(text: str) -> str:
    return text.replace("\r\n", "\n").replace("\r", "\n")


def chunkify(body: str, min_len: int = DEFAULT_MIN_CHUNK_LENGTH) -> List[str]:
    """「。」で分割し、min_len 未満の文は次文と結合する。"""
    body = body.strip()
    if not body:
        return []

    if "。" not in body:
        return [body if body.endswith("。") else body + "。"]

    sentences = [s.strip() for s in body.split("。") if s.strip()]
    if not sentences:
        return []

    chunks: List[str] = []
    buf = ""
    for s in sentences:
        sent = s + "。"
        if not buf:
            buf = sent
        elif len(buf) >= min_len:
            chunks.append(buf)
            buf = sent
        else:
            buf += sent
    if buf:
        chunks.append(buf)
    return chunks


# ============================================================
# パーサ: 中道改革連合 (cra)
# ============================================================
# フォーマット:
#   1. 一人ひとりの幸福を…           ← 大項目 (半角数字+ピリオド)
#   ２．現役生代も安心できる…         ← 大項目 (全角数字+．)
#   １生活者ファーストへの…           ← サブ概要 (全角数字始まり、句点なし) → section
#   ー家計の安心へ                    ← 中項目 (ダッシュ始まり、短い)
#   ・本文                            ← 本文

CRA_CHAPTER = re.compile(r"^[０-９\d]+[．.](.+)$")
CRA_SUB_OVERVIEW = re.compile(r"^[１２３４５６７８９０]+[^．.]")

def parse_cra(text: str) -> List[Leaf]:
    leaves: List[Leaf] = []
    cur_chapter = ""
    cur_section = ""

    for raw in text.split("\n"):
        line = raw.strip()
        if not line:
            continue

        # 大項目: "1. …" or "２．…"
        m = CRA_CHAPTER.match(line)
        if m and len(line) < 80 and "。" not in line:
            cur_chapter = line
            cur_section = ""
            continue

        # サブ概要: "１生活者ファースト…" (全角数字始まり、ピリオドなし)
        if CRA_SUB_OVERVIEW.match(line) and len(line) < 100 and "。" not in line:
            cur_section = line
            continue

        # 中項目: ー/―始まり、短い、句点なし
        if (line.startswith("ー") or line.startswith("―")) and len(line) < 40 and "。" not in line:
            cur_section = line.lstrip("ーー―").strip()
            continue

        # 本文: ・で始まる
        if line.startswith("・"):
            body = line[1:].strip()
            leaves.append(Leaf(cur_chapter, cur_section, "", body))
            continue

        # それ以外 → 直前のリーフに連結
        if leaves and leaves[-1].body:
            leaves[-1].body += line

    return leaves


# ============================================================
# パーサ: 国民民主党 (dpfp)
# ============================================================
# フォーマット:
#   政策各論1.「もっと」手取りを増やす   ← 大項目
#   1 「令和の所得倍増計画」             ← セクション番号 + タイトル
#   （1）「消費」の拡大                   ← 中項目
#   ❶介護職員、看護師、保育士等の給料倍増 ← 小項目 (丸数字)
#   ・本文                                ← 本文

# 丸数字パターン (❶〜⓴ + ⑴⑵ 等)
CIRCLED_NUM = re.compile(r"^[❶❷❸❹❺❻❼❽❾❿⓫⓬⓭⓮⓯⓰⓱⓲⓳⓴⑴⑵⑶⑷⑸⑹⑺⑻⑼⑽]")
KOKUMIN_CHAPTER = re.compile(r"^政策各論\d")
KOKUMIN_SECTION_NUM = re.compile(r"^\d+\s")
KOKUMIN_SUBSECTION = re.compile(r"^（\d+）")

def parse_dpfp(text: str) -> List[Leaf]:
    leaves: List[Leaf] = []
    cur_chapter = ""
    cur_section = ""
    cur_subsection = ""

    for raw in text.split("\n"):
        line = raw.strip()
        if not line:
            continue

        # 大項目: "政策各論1.…"
        if KOKUMIN_CHAPTER.match(line):
            cur_chapter = line
            cur_section = ""
            cur_subsection = ""
            continue

        # セクション番号: "1 「令和の所得倍増計画」"
        if KOKUMIN_SECTION_NUM.match(line) and len(line) < 50:
            cur_section = line
            cur_subsection = ""
            continue

        # 中項目: "（1）「消費」の拡大"
        if KOKUMIN_SUBSECTION.match(line):
            cur_section = line
            cur_subsection = ""
            continue

        # 小項目: ❶❷❸...
        if CIRCLED_NUM.match(line):
            cur_subsection = line
            continue

        # 本文: ・で始まる行
        if line.startswith("・") or line.startswith("●"):
            body = line[1:].strip()
            leaves.append(Leaf(cur_chapter, cur_section, cur_subsection, body))
            continue

        # 上記に該当しない行 → 直前のリーフの本文に連結
        if leaves and leaves[-1].body:
            leaves[-1].body += line

    return leaves


# ============================================================
# パーサ: 日本共産党 (jcp)
# ============================================================
# フォーマット:
#   N．大株主・大企業応援から暮らし応援に  ← 大項目 (全角数字+．)
#   （N）賃上げと労働時間短縮で…           ← 中項目 (（N）)
#   ＃＃＃物価高騰を上回る大幅な賃上げを   ← 中項目 (### 見出し)
#   ――政治の責任で…                      ← 本文 (ダッシュ始まり)
#   ・本文                                 ← 本文 (中黒始まり)
#   ー「非正規ワーカー待遇改善法」を制定    ← 中項目 (ダッシュ始まり・短い)

JCP_CHAPTER = re.compile(r"^[０-９\d]+[．.](.+)$")
JCP_PAREN_SECTION = re.compile(r"^（\d+）(.+)$")

def parse_jcp(text: str) -> List[Leaf]:
    leaves: List[Leaf] = []
    cur_chapter = ""
    cur_section = ""

    for raw in text.split("\n"):
        line = raw.strip()
        if not line:
            continue

        # 大項目: "１．大株主・大企業応援から…"
        if JCP_CHAPTER.match(line):
            cur_chapter = line
            cur_section = ""
            continue

        # 中項目: "（1）…"
        if JCP_PAREN_SECTION.match(line):
            cur_section = line
            continue

        # 中項目: "＃＃＃…"
        if line.startswith("＃＃＃"):
            cur_section = line.lstrip("＃").strip()
            continue

        # 本文: ――で始まる行
        if line.startswith("――") or line.startswith("──"):
            body = line.lstrip("――──ー").strip()
            leaves.append(Leaf(cur_chapter, cur_section, "", body))
            continue

        # 中項目候補: ー始まり・短い行 (ただし「ー「非正規…」のようなタイトル)
        if (line.startswith("ー") or line.startswith("―")) and len(line) < 40 and "。" not in line:
            cur_section = line.lstrip("ーー―").strip()
            continue

        # 本文: ・で始まる行
        if line.startswith("・"):
            body = line[1:].strip()
            leaves.append(Leaf(cur_chapter, cur_section, "", body))
            continue

        # それ以外 → 直前のリーフに連結
        if leaves and leaves[-1].body:
            leaves[-1].body += line

    return leaves


# ============================================================
# パーサ: れいわ新選組 (reiwa)
# ============================================================
# フォーマット:
#   N増税？ダメ♡絶対！             ← 大項目 (数字+タイトル)
#   ＃＃＃消費税はさっさと廃止で…   ← 中項目
#   ・本文                          ← 本文

REIWA_CHAPTER = re.compile(r"^[０-９\d]+[．.、]?(.+)$")

def parse_reiwa(text: str) -> List[Leaf]:
    leaves: List[Leaf] = []
    cur_chapter = ""
    cur_section = ""

    for raw in text.split("\n"):
        line = raw.strip()
        if not line:
            continue

        # 中項目: "＃＃＃…"
        if line.startswith("＃＃＃"):
            cur_section = line.lstrip("＃").strip()
            continue

        # 大項目: 数字で始まる行 (＃＃＃ではない)
        # ただし "・" で始まる行や長い行は除外
        m = REIWA_CHAPTER.match(line)
        if m and not line.startswith("・") and len(line) < 50:
            cur_chapter = line
            cur_section = ""
            continue

        # 本文: ・で始まる行
        if line.startswith("・"):
            body = line[1:].strip()
            leaves.append(Leaf(cur_chapter, cur_section, "", body))
            continue

        # それ以外 → 直前に連結
        if leaves and leaves[-1].body:
            leaves[-1].body += line

    return leaves


# ============================================================
# パーサ: 参政党 (sansei)
# ============================================================
# フォーマット:
#   N国防・外交                      ← 大項目 (数字+タイトル)
#   ー総合力（防衛・政治外交…）を…   ← 中項目 (ー始まり)
#   ・本文                            ← 本文
#   ＜基本理念＞                      ← 小項目 (＜＞)
#   ・本文

SANSEI_CHAPTER = re.compile(r"^[０-９\d]+[．.]?(.+)$")
SANSEI_ANGLE_BRACKET = re.compile(r"^＜(.+)＞$")

def parse_sansei(text: str) -> List[Leaf]:
    leaves: List[Leaf] = []
    cur_chapter = ""
    cur_section = ""
    cur_subsection = ""

    for raw in text.split("\n"):
        line = raw.strip()
        if not line:
            continue

        # 小項目: ＜…＞
        m_angle = SANSEI_ANGLE_BRACKET.match(line)
        if m_angle:
            cur_subsection = m_angle.group(1)
            continue

        # 中項目: ー始まり (短め)
        if (line.startswith("ー") or line.startswith("―")) and len(line) < 60 and "。" not in line:
            cur_section = line.lstrip("ーー―").strip()
            cur_subsection = ""
            continue

        # 大項目: 数字始まりで短い
        m_ch = SANSEI_CHAPTER.match(line)
        if m_ch and not line.startswith("・") and len(line) < 40 and "。" not in line:
            cur_chapter = line
            cur_section = ""
            cur_subsection = ""
            continue

        # 本文: ・で始まる
        if line.startswith("・"):
            body = line[1:].strip()
            leaves.append(Leaf(cur_chapter, cur_section, cur_subsection, body))
            continue

        # それ以外 → 連結
        if leaves and leaves[-1].body:
            leaves[-1].body += line

    return leaves


# ============================================================
# パーサ: 日本保守党 (hoshu)
# ============================================================
# フォーマット:
#   N．日本の国体、伝統文化を守る  ← 大項目
#   ・本文                          ← 本文

HOSHU_CHAPTER = re.compile(r"^[０-９\d]+[．.](.+)$")

def parse_hoshu(text: str) -> List[Leaf]:
    leaves: List[Leaf] = []
    cur_chapter = ""

    for raw in text.split("\n"):
        line = raw.strip()
        if not line:
            continue

        # 大項目
        m = HOSHU_CHAPTER.match(line)
        if m and len(line) < 50:
            cur_chapter = line
            continue

        # 本文: ・で始まる
        if line.startswith("・"):
            body = line[1:].strip()
            leaves.append(Leaf(cur_chapter, "", "", body))
            continue

        # それ以外 → 連結
        if leaves and leaves[-1].body:
            leaves[-1].body += line

    return leaves


# ============================================================
# パーサ: 日本維新の会 (ishin)
# ============================================================
# フォーマット:
#   ～経済を動かす～               ← 最上位カテゴリ (～で囲む)
#   ＃＃＃経済財政関連施策          ← 大項目 (＃＃＃)
#   ー物価高対策                   ← 中項目 (ー始まり)
#   本文（・なし、直接文章）       ← 本文
#   【12本の矢】                   ← タグ (メタデータとして保持可)

ISHIN_TOP_CATEGORY = re.compile(r"^[～〜](.+)[～〜]$")

def parse_ishin(text: str) -> List[Leaf]:
    leaves: List[Leaf] = []
    cur_top = ""
    cur_chapter = ""
    cur_section = ""

    for raw in text.split("\n"):
        line = raw.strip()
        if not line:
            continue

        # 最上位: ～経済を動かす～
        m_top = ISHIN_TOP_CATEGORY.match(line)
        if m_top:
            cur_top = m_top.group(1).strip()
            cur_chapter = ""
            cur_section = ""
            continue

        # 大項目: ＃＃＃
        if line.startswith("＃＃＃"):
            cur_chapter = line.lstrip("＃").strip()
            cur_section = ""
            continue

        # 中項目: ー始まり・短め・句点なし
        if (line.startswith("ー") or line.startswith("―")) and len(line) < 40 and "。" not in line:
            cur_section = line.lstrip("ーー―").strip()
            continue

        # 【12本の矢】等のタグを除去
        clean_line = re.sub(r"【[^】]*】", "", line).strip()

        # タグ除去後に空になった行はスキップ
        if not clean_line:
            continue

        # 本文: それ以外の通常テキスト
        # 維新は ・ で始まらない文章が多い
        category = f"{cur_top} ＞ {cur_chapter}" if cur_top else cur_chapter

        # 短すぎる行は見出しの可能性があるが、維新は長文が多いので本文扱い
        if len(clean_line) > 10 or clean_line.startswith("・"):
            clean_body = clean_line.lstrip("・").strip()
            leaves.append(Leaf(category, cur_section, "", clean_body))
        else:
            cur_section = clean_line

    return leaves


# ============================================================
# パーサ: 社民党 (sdp)
# ============================================================
# フォーマット:
#   N. 消費税率ゼロ！防衛増税NO！   ← 大項目
#   ・本文                           ← 本文

SDP_CHAPTER = re.compile(r"^[０-９\d]+[．.](.+)$")

def parse_sdp(text: str) -> List[Leaf]:
    leaves: List[Leaf] = []
    cur_chapter = ""

    for raw in text.split("\n"):
        line = raw.strip()
        if not line:
            continue

        # 大項目
        m = SDP_CHAPTER.match(line)
        if m and len(line) < 60:
            cur_chapter = line
            continue

        # 本文
        if line.startswith("・"):
            body = line[1:].strip()
            leaves.append(Leaf(cur_chapter, "", "", body))
            continue

        # それ以外 → 連結
        if leaves and leaves[-1].body:
            leaves[-1].body += line

    return leaves


# ============================================================
# パーサ辞書
# ============================================================
PARSERS: Dict[str, Callable[[str], List[Leaf]]] = {
    "cra": parse_cra,
    "dpfp": parse_dpfp,
    "jcp":     parse_jcp,
    "reiwa":   parse_reiwa,
    "sansei":  parse_sansei,
    "hoshu":   parse_hoshu,
    "ishin":   parse_ishin,
    "sdp":     parse_sdp,
}


# ============================================================
# Leaf → Chunk 構築
# ============================================================
def build_chunks(config: PartyConfig, leaves: List[Leaf]) -> List[Chunk]:
    chunks: List[Chunk] = []
    global_idx = 0

    for leaf in leaves:
        content = leaf.body.strip()
        if not content:
            continue

        header_parts = [leaf.category, leaf.section]
        if leaf.subsection:
            header_parts.append(leaf.subsection)
        header = " ＞ ".join(p for p in header_parts if p)

        embed_text_str = f"【{config.party_label} ＞ {header}】\n{content}"
        chunks.append(Chunk(
            id=f"{config.party_id}_{config.year}_{global_idx}",
            content=content,
            embeddingContent=embed_text_str,
            metadata={
                "party_id": config.party_id,
                "party_label": config.party_label,
                "administration_id": config.administration_id,
                "year": config.year,
                "category": leaf.category,
                "section": leaf.section,
                "subsection": leaf.subsection,
            },
        ))
        global_idx += 1

    return chunks


# ============================================================
# Gemini Embedding
# ============================================================
def embed_text(text: str, retry_count: int = 0) -> List[float]:
    payload = {
        "model": f"models/{GEMINI_EMBEDDING_MODEL}",
        "content": {"parts": [{"text": text}]},
        "taskType": "RETRIEVAL_DOCUMENT",
        "outputDimensionality": EMBEDDING_DIMENSIONS,
    }
    res = requests.post(GEMINI_EMBEDDING_URL, json=payload, timeout=60)
 
    if res.status_code == 429:
        if retry_count >= EMBED_MAX_RETRY:
            raise RuntimeError("Gemini API: リトライ上限に達しました")
        body = res.json()
        retry_delay = None
        for d in body.get("error", {}).get("details", []):
            if "RetryInfo" in d.get("@type", ""):
                rd = d.get("retryDelay", "")
                m = re.match(r"(\d+)s", rd)
                if m:
                    retry_delay = int(m.group(1))
        wait = (retry_delay or 60) + 1
        print(f"  Rate limit (429). {wait}秒後にリトライ ({retry_count + 1}/{EMBED_MAX_RETRY})")
        time.sleep(wait)
        return embed_text(text, retry_count + 1)
 
    if not res.ok:
        raise RuntimeError(f"Gemini Embedding API error: {res.status_code} {res.text}")
 
    return res.json()["embedding"]["values"]


def embed_chunks(chunks: List[Chunk]) -> None:
    total = len(chunks)
    for i in range(0, total, EMBED_BATCH_SIZE):
        batch = chunks[i:i + EMBED_BATCH_SIZE]
        for chunk in batch:
            chunk.embedding = embed_text(chunk.embeddingContent)
        done = min(i + EMBED_BATCH_SIZE, total)
        print(f"  Embedded {done} / {total}")
        if i + EMBED_BATCH_SIZE < total:
            time.sleep(EMBED_DELAY_SEC)


# ============================================================
# JSON出力
# ============================================================
def chunk_to_dict(chunk: Chunk) -> dict:
    d = {
        "id": chunk.id,
        "content": chunk.content,
        "embeddingContent": chunk.embeddingContent,
        "metadata": chunk.metadata,
        "embedding": chunk.embedding,
    }
    if chunk.embedding is not None:
        d["embedding"] = chunk.embedding
    return d


def save_json(path: Path, chunks: List[Chunk]) -> None:
    data = [chunk_to_dict(c) for c in chunks]
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


# ============================================================
# 政党単位処理
# ============================================================
def process_party(party_id: str, data_dir: Path, do_embed: bool = True) -> None:
    config = PARTY_CONFIGS[party_id]
    parser = PARSERS[party_id]

    filename = config.source_filename
    # ディレクトリ構成: data_dir / {party_id} / {year} / manifesto.txt
    candidates = [
        data_dir / party_id / str(config.year) / filename,
        data_dir / party_id / filename,
        data_dir / filename,
    ]
    src_path = None
    for c in candidates:
        if c.exists():
            src_path = c
            break

    if src_path is None:
        print(f"\n=== {config.party_label} ({party_id}) スキップ: ファイルが見つかりません ===")
        print(f"  探索パス: {[str(c) for c in candidates]}")
        return

    print(f"\n=== {config.party_label} ({party_id}) 処理開始 ===")
    print(f"  ソース: {src_path}")
    raw = normalize(src_path.read_text(encoding="utf-8"))

    leaves = parser(raw)
    print(f"  リーフ数: {len(leaves)}")

    chunks = build_chunks(config, leaves)
    print(f"  チャンク数: {len(chunks)}")

    # 出力先: ソースファイルと同じディレクトリ
    out_dir = src_path.parent
    chunks_path = out_dir / f"{party_id}_pledge_chunks.json"
    save_json(chunks_path, chunks)
    print(f"  -> {chunks_path}")

    if do_embed:
        print("  Gemini API 埋め込み中...")
        embed_chunks(chunks)
        embedded_path = out_dir / f"{party_id}_pledge_embedded.json"
        save_json(embedded_path, chunks)
        print(f"  -> {embedded_path}")


# ============================================================
# テスト用: テキストを直接パースしてチャンクを表示
# ============================================================
def test_parse(party_id: str, text: str, max_display: int = 20) -> List[Chunk]:
    """テスト用: テキストを直接渡してパース結果を確認"""
    config = PARTY_CONFIGS[party_id]
    parser = PARSERS[party_id]

    raw = normalize(text)
    leaves = parser(raw)
    print(f"\n=== {config.party_label} テスト ===")
    print(f"  リーフ数: {len(leaves)}")

    chunks = build_chunks(config, leaves)
    print(f"  チャンク数: {len(chunks)}")

    for i, chunk in enumerate(chunks[:max_display]):
        print(f"\n  [{chunk.id}]")
        print(f"    category:   {chunk.metadata['category']}")
        print(f"    section:    {chunk.metadata['section']}")
        print(f"    subsection: {chunk.metadata['subsection']}")
        print(f"    content:    {chunk.content[:80]}...")

    if len(chunks) > max_display:
        print(f"\n  ... 他 {len(chunks) - max_display} チャンク")

    return chunks


# ============================================================
# メイン
# ============================================================
RUN_CONFIG = {
    # 処理対象の政党ID。空リスト [] にすると全政党を処理。
    "target_parties": ["cra"],
    # データディレクトリ (各政党のテキストファイルの親ディレクトリ)
    "data_dir": "../../data",
    # True にすると Gemini API での埋め込みも実行する。
    "do_embed": True,
}


def main():
    target = RUN_CONFIG["target_parties"] or list(PARTY_CONFIGS.keys())
    data_dir = Path(RUN_CONFIG["data_dir"])
    do_embed = RUN_CONFIG["do_embed"]

    for party_id in target:
        if party_id not in PARSERS:
            print(f"パーサ未定義: {party_id}")
            continue
        process_party(party_id, data_dir, do_embed=do_embed)

    print("\n=== 完了 ===")


if __name__ == "__main__":
    main()
    
    
    