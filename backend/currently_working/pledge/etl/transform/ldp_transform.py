"""
LDP公約データ処理:
  各年代の公約ファイル(ldp.txt)を 大項目 / 中項目 / (小項目) / 本文 にパースし、
  「。」区切り(ある程度の長さ)でチャンク化、Gemini API で埋め込みベクトルを付与し、
  各年フォルダに JSON 出力する。

各年のフォーマット:
  2003: 宣言N： / ー or N. / ● + 字下げサブ
  2005: テーマN： / ー / 001.xxxx + 本文
  2009: N． / ー / (本文のみ・要約版)
  2012: ## / ### / ・ (Markdown)
  2017: Ⅰ Ⅱ / 短いタイトル / ●
  2021: ## / ### ◆◆ / ○ (Markdown)
  2024: ## / ### ◆◆ / ○ (Markdown)
  2026: １． / 短いタイトル / 本文

実行:
  python embed_ldp_pledges.py              # 全年
  python embed_ldp_pledges.py 2026 2024    # 指定年のみ
  python embed_ldp_pledges.py --no-embed   # 埋め込みスキップ(チャンクJSONのみ)
"""
from __future__ import annotations

import json
import re
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, List, Optional
import os
from dotenv import load_dotenv

import requests


# ============================================================
# 設定
# ============================================================
load_dotenv()

GEMINI_API_KEY         = os.getenv("GEMINI_API_KEY")
GEMINI_EMBEDDING_MODEL = "gemini-embedding-001"
EMBEDDING_DIMENSIONS = 768

GEMINI_EMBEDDING_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/"
    f"models/{GEMINI_EMBEDDING_MODEL}:embedContent?key={GEMINI_API_KEY}"
)

PARTY_LABEL = "自民党公約"

# 年 → administration_id (内閣テーブルとの対応)
ADMIN_ID_MAP = {
    2003: 88,  # 第2次小泉内閣
    2005: 89,  # 第3次小泉内閣
    2009: None,   # 麻生内閣
    2012: 96,   # 第2次安倍内閣
    2017: 98,   # 第4次安倍内閣
    2021: 101,   # 岸田内閣
    2024: 103,   # 石破内閣
    2026: 105,   # 高市内閣
}

# チャンク化: 1文ずつを基本とするが、ある min_len 未満なら次文と結合
DEFAULT_MIN_CHUNK_LENGTH = 0
YEAR_MIN_CHUNK_LENGTH = {
    2009: 100,  # 要約版: 短い文を結合してまとめる
}

# 埋め込みレート制御
EMBED_BATCH_SIZE = 5
EMBED_DELAY_SEC = 0.7
EMBED_MAX_RETRY = 5


# ============================================================
# データ構造
# ============================================================
@dataclass
class Leaf:
    category: str           # 大項目
    section: str            # 中項目
    subsection: str = ""    # 小項目（無ければ ""）
    body: str = ""          # 本文（複数文を含むことがある）


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


def is_indented(raw: str) -> bool:
    return bool(raw) and raw[0] in (" ", "\t", "\u3000")


# ============================================================
# 文単位チャンク化
# ============================================================
def chunkify(body: str, min_len: int = DEFAULT_MIN_CHUNK_LENGTH) -> List[str]:
    """
    body を「。」で分割し、min_len 未満の文は次文と結合する。
    「。」を含まない場合は body をそのまま1チャンクとして返す(末尾に「。」を補完)。
    """
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
# パーサ: 2003 (宣言N： / ー / N. / ● + 字下げサブ)
# ============================================================
def parse_2003(text: str) -> List[Leaf]:
    leaves: List[Leaf] = []
    cur_chapter = ""
    cur_dash = ""
    cur_num = ""
    cur_sub = ""

    def section() -> str:
        if cur_dash and cur_num:
            return f"{cur_dash} / {cur_num}"
        return cur_dash or cur_num

    for raw in text.split("\n"):
        if not raw.strip():
            continue
        line = raw.strip()
        indented = is_indented(raw)

        if not indented:
            if re.match(r"^宣言(\d+)[：:]", line):
                cur_chapter = line
                cur_dash = ""
                cur_num = ""
                cur_sub = ""
            elif re.match(r"^[ーー―](.+)$", line):
                cur_dash = line
                cur_num = ""
                cur_sub = ""
            elif re.match(r"^[\d０-９]+[．.](.+)$", line):
                cur_num = line
                cur_sub = ""
            elif line.startswith("●"):
                cur_sub = line[1:].strip()
                # ● 自身を1チャンクとして登録(見出しとして残す)
                leaves.append(Leaf(cur_chapter, section(), cur_sub, cur_sub))
            else:
                if leaves:
                    leaves[-1].body += line
        else:
            sub_text = line.lstrip("・。、")
            if sub_text:
                # 字下げサブ項目は ● と同じ subsection で別リーフとして追加
                leaves.append(Leaf(cur_chapter, section(), cur_sub, sub_text))

    return leaves


# ============================================================
# パーサ: 2005 (テーマN： / ー / 001.xxxx + 本文)
# ============================================================
def parse_2005(text: str) -> List[Leaf]:
    leaves: List[Leaf] = []
    cur_chapter = ""
    cur_section = ""
    cur_sub = ""
    cur_body: List[str] = []

    def flush():
        nonlocal cur_sub, cur_body
        body = "\n".join(cur_body).strip()
        if cur_sub or body:
            leaves.append(Leaf(cur_chapter, cur_section, cur_sub, body))
        cur_sub = ""
        cur_body = []

    for raw in text.split("\n"):
        if not raw.strip():
            continue
        line = raw.strip()

        if re.match(r"^テーマ(\d+)[：:]", line):
            flush()
            cur_chapter = line
            cur_section = ""
        elif re.match(r"^[ーー―](.+)$", line):
            flush()
            cur_section = line
        elif re.match(r"^\d{3}[.日口](.+)$", line):
            # 例: "001.郵政民営化に再挑戦"  "002日規制改革の強力な推進"(OCRゆれ)
            flush()
            cur_sub = line
        else:
            cur_body.append(line)

    flush()
    return leaves


# ============================================================
# パーサ: 2009 (N． / ー / 本文)
# ============================================================
def parse_2009(text: str) -> List[Leaf]:
    leaves: List[Leaf] = []
    cur_chapter = ""
    cur_section = ""
    cur_body: List[str] = []

    def flush():
        nonlocal cur_body
        body = "\n".join(cur_body).strip()
        if body:
            leaves.append(Leaf(cur_chapter, cur_section, "", body))
        cur_body = []

    for raw in text.split("\n"):
        if not raw.strip():
            continue
        line = raw.strip()

        if re.match(r"^[\d０-９]+[．.](.+)$", line):
            flush()
            cur_chapter = line
            cur_section = ""
        elif re.match(r"^[ーー―](.+)$", line):
            flush()
            cur_section = line
        else:
            cur_body.append(line)

    flush()
    return leaves


# ============================================================
# パーサ: 2012 (## / ### / ・)
# ============================================================
def parse_2012(text: str) -> List[Leaf]:
    leaves: List[Leaf] = []
    cur_chapter = ""
    cur_section = ""

    for raw in text.split("\n"):
        line = raw.strip()
        if not line or line.startswith("---"):
            continue
        if line.startswith("## "):
            cur_chapter = line[3:].strip()
            cur_section = ""
        elif line.startswith("### "):
            cur_section = line[4:].strip()
        elif line.startswith("# "):
            continue
        elif line.startswith("・"):
            body = line[1:].strip()
            leaves.append(Leaf(cur_chapter, cur_section, "", body))
        else:
            # 直前の弾丸の続行行として連結
            if leaves:
                leaves[-1].body += line

    return leaves


# ============================================================
# パーサ: 2017 (Ⅰ Ⅱ / 短いタイトル / ●)
# ============================================================
ROMAN_CHAPTER = re.compile(r"^[ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩⅪⅫ]\s+(.+)$")

def parse_2017(text: str) -> List[Leaf]:
    leaves: List[Leaf] = []
    cur_chapter = ""
    cur_section = ""
    skip_titles = {"自民党政策BANK", "未来に責任を持つ確かな政策で、さらなるステージへ。"}

    for raw in text.split("\n"):
        line = raw.strip()
        if not line or line in skip_titles:
            continue

        if ROMAN_CHAPTER.match(line):
            cur_chapter = line
            cur_section = ""
            continue

        if line.startswith("●"):
            body = line[1:].strip()
            leaves.append(Leaf(cur_chapter, cur_section, "", body))
            continue

        # 中項目候補: 短く、句点で終わらない
        if len(line) <= 40 and not line.endswith("。"):
            cur_section = line
        else:
            if leaves:
                leaves[-1].body += line

    return leaves


# ============================================================
# パーサ: 2021 / 2024 (## / ### ◆◆ / ○)
# ============================================================
def parse_md_circle(text: str) -> List[Leaf]:
    leaves: List[Leaf] = []
    cur_chapter = ""
    cur_section = ""
    started = False

    for raw in text.split("\n"):
        line = raw.strip()
        if not line or line.startswith("---"):
            continue

        if line.startswith("## "):
            cur_chapter = line[3:].strip()
            # 先頭に "1 " や "2 " といった番号があれば残す
            cur_section = ""
            started = True
            continue

        if not started:
            continue

        if line.startswith("### "):
            sec = line[4:].strip().strip("◆")
            cur_section = sec
        elif line.startswith("# "):
            continue
        elif line.startswith("○"):
            body = line[1:].strip()
            leaves.append(Leaf(cur_chapter, cur_section, "", body))
        else:
            if leaves:
                leaves[-1].body += line

    return leaves


# ============================================================
# パーサ: 2026 (１． / 短いタイトル / 本文)
# ============================================================
FULLWIDTH_CHAPTER = re.compile(r"^[０-９0-9]+[．.](.+)$")

def parse_2026(text: str) -> List[Leaf]:
    leaves: List[Leaf] = []
    cur_chapter = ""
    cur_section = ""
    cur_body: List[str] = []

    def flush():
        nonlocal cur_body
        body = "\n".join(cur_body).strip()
        if body:
            leaves.append(Leaf(cur_chapter, cur_section, "", body))
        cur_body = []

    for raw in text.split("\n"):
        line = raw.strip()
        if not line:
            continue

        if FULLWIDTH_CHAPTER.match(line):
            flush()
            cur_chapter = line
            cur_section = ""
            continue

        # 中項目候補: 短く、句読点で終わらない
        if len(line) <= 30 and not line.endswith("。") and not line.endswith("、"):
            flush()
            cur_section = line
            continue

        cur_body.append(line)

    flush()
    return leaves


# ============================================================
# 年代別パーサ振り分け
# ============================================================
PARSERS: dict[int, Callable[[str], List[Leaf]]] = {
    2003: parse_2003,
    2005: parse_2005,
    2009: parse_2009,
    2012: parse_2012,
    2017: parse_2017,
    2021: parse_md_circle,
    2024: parse_md_circle,
    2026: parse_2026,
}


# ============================================================
# Leaf → Chunk 構築
# ============================================================
def build_chunks(year: int, leaves: List[Leaf]) -> List[Chunk]:
    chunks: List[Chunk] = []
    admin_id = ADMIN_ID_MAP[year]
    min_len = YEAR_MIN_CHUNK_LENGTH.get(year, DEFAULT_MIN_CHUNK_LENGTH)
    global_idx = 0

    for leaf in leaves:
        if not leaf.body.strip():
            continue

        sentences = chunkify(leaf.body, min_len=min_len)

        header_parts = [leaf.category, leaf.section]
        if leaf.subsection:
            header_parts.append(leaf.subsection)
        header = " ＞ ".join(p for p in header_parts if p)

        for sub_idx, content in enumerate(sentences):
            embed_text_str = f"【{PARTY_LABEL} ＞ {header}】\n{content}"
            chunks.append(Chunk(
                id=f"ldp_{year}_{global_idx}",
                content=content,
                embeddingContent=embed_text_str,
                metadata={
                    "administration_id": admin_id,
                    "year": year,
                    "category": leaf.category,
                    "section": leaf.section,
                    "subsection": leaf.subsection,
                    "chunk_index": sub_idx,
                },
            ))
            global_idx += 1

    return chunks


# ============================================================
# Gemini Embedding (リトライ対応)
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
# 年単位処理
# ============================================================
def process_year(year: int, do_embed: bool = True) -> None:
    DATA_DIR = Path('../../data/ldp')
    year_dir = DATA_DIR / str(year)
    src_path = year_dir / "ldp.txt"

    print(f"\n=== {year}年 処理開始 ===")
    raw = normalize(src_path.read_text(encoding="utf-8"))

    parser = PARSERS[year]
    leaves = parser(raw)
    print(f"  リーフ数: {len(leaves)}")

    chunks = build_chunks(year, leaves)
    print(f"  チャンク数: {len(chunks)}")

    chunks_path = year_dir / "ldp_pledge_chunks.json"
    save_json(chunks_path, chunks)
    print(f"  -> {chunks_path.name}")

    if do_embed:
        print("  Gemini API 埋め込み中...")
        embed_chunks(chunks)
        embedded_path = year_dir / "ldp_pledge_embedded.json"
        save_json(embedded_path, chunks)
        print(f"  -> {embedded_path.name}")


# ============================================================
# 実行設定 (コマンドライン引数は受け取らない。ここを書き換えて使う)
# ============================================================
RUN_CONFIG = {
    # 処理対象の年。空リスト [] にすると ADMIN_ID_MAP の全年を処理。
    "target_years": [2009, 2012, 2017, 2021, 2024],
    # True にすると Gemini API での埋め込みも実行する。
    # False ならチャンク JSON (ldp_pledge_chunks.json) のみ出力。
    "do_embed": True,
}


def main():
    target_years = RUN_CONFIG["target_years"] or sorted(ADMIN_ID_MAP.keys())
    do_embed = RUN_CONFIG["do_embed"]

    for year in target_years:
        process_year(year, do_embed=do_embed)

    print("\n=== 完了 ===")


if __name__ == "__main__":
    main()
