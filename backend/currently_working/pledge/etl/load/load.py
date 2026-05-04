"""
公約ローダー: *_pledge_embedded.json → pledges テーブル

使い方:
  python load.py                           # 全政党（2026年分）
  python load.py --parties ishin dpfp      # 指定政党のみ
  python load.py --parties ldp --year 2024 # 自民党2024年分
  python load.py --dry-run                 # DB書き込みなし（件数確認のみ）
"""
from __future__ import annotations

import json
import sys
import os
from pathlib import Path
from typing import Dict, List, Optional

import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL が .env に設定されていません")

# ============================================================
# マッピング
# ============================================================

# en_shortname → DB party_id
PARTY_NAME_TO_ID: Dict[str, int] = {
    "ldp": 1,
    "cra": 2,
    "ishin": 3,
    "dpfp": 4,
    "jcp": 5,
    "reiwa": 6,
    "sansei": 7,
    "hoshu": 8,
    "komei": 9,
    "mirai": 10,
    "sdp": 11,
    "rikken": 12,
    "genyu": 13,
    "minshu": 14,
}

# year → election_id
YEAR_TO_ELECTION_ID: Dict[int, int] = {
    2026: 1,
    2024: 2,
    2021: 3,
    2017: 4,
    2014: 5,
    2012: 6,
    2009: 7,
    2005: 8,
    2003: 9,
}

# (party_shortname, year) → administration_id（与党のみ）
PARTY_YEAR_TO_ADMIN: Dict[tuple, int] = {
    ("ldp", 2026): 105,
    ("ldp", 2024): 103,
    ("ldp", 2021): 101,
    ("ldp", 2017): 98,
    ("ldp", 2014): 97,
    ("ldp", 2012): 96,
    ("ldp", 2009): None,  # 2009は自民が野党になった
    ("ldp", 2005): 88,
    ("ldp", 2003): 87,
    ("ishin", 2026): 105,  # 連立与党
    ("minshu", 2009): 93,  # 鳩山内閣
}

# データディレクトリ（このスクリプトからの相対パス）
DATA_DIR = Path(__file__).parent.parent.parent / "data"


# ============================================================
# ユーティリティ
# ============================================================

def vector_to_pg(vec: List[float] | None) -> str | None:
    if vec is None:
        return None
    return f"[{','.join(str(v) for v in vec)}]"


def find_embedded_file(party: str, year: int) -> Optional[Path]:
    """embeddedファイルを探す"""
    candidates = [
        DATA_DIR / party / str(year) / f"{party}_pledge_embedded.json",
    ]
    for c in candidates:
        if c.exists():
            return c
    return None


# ============================================================
# ローダー
# ============================================================

def load_party(
    conn,
    party: str,
    year: int,
    dry_run: bool = False,
) -> int:
    """1政党・1年分のembeddedデータをpledgesテーブルに投入"""

    party_id = PARTY_NAME_TO_ID.get(party)
    if party_id is None:
        print(f"  ⚠ 未知の政党: {party}")
        return 0

    election_id = YEAR_TO_ELECTION_ID.get(year)
    if election_id is None:
        print(f"  ⚠ 未知の年: {year}")
        return 0

    administration_id = PARTY_YEAR_TO_ADMIN.get((party, year))

    embedded_file = find_embedded_file(party, year)
    if embedded_file is None:
        print(f"  ⚠ ファイルなし: {party}/{year}")
        return 0

    with open(embedded_file, "r", encoding="utf-8") as f:
        chunks = json.load(f)

    if not chunks:
        print(f"  ⚠ 空ファイル: {embedded_file}")
        return 0

    rows = []
    for chunk in chunks:
        meta = chunk.get("metadata", {})
        source_id = chunk.get("id")
        content = chunk.get("content", "")
        embedding = chunk.get("embedding")

        if not content:
            continue

        rows.append((
            source_id,
            administration_id,
            party_id,
            election_id,
            meta.get("category"),
            meta.get("section"),
            meta.get("year") or year,
            meta.get("chunk_index"),
            content,
            vector_to_pg(embedding),
        ))

    if dry_run:
        print(f"  [DRY RUN] {party}/{year}: {len(rows)} 件")
        return len(rows)

    cur = conn.cursor()
    try:
        execute_values(
            cur,
            """
            INSERT INTO pledges (
                source_id, administration_id, party_id, election_id,
                category, section, year, chunk_index,
                content, content_vector
            ) VALUES %s
            ON CONFLICT (source_id) DO UPDATE SET
                administration_id = EXCLUDED.administration_id,
                party_id          = EXCLUDED.party_id,
                election_id       = EXCLUDED.election_id,
                category          = EXCLUDED.category,
                section           = EXCLUDED.section,
                year              = EXCLUDED.year,
                chunk_index       = EXCLUDED.chunk_index,
                content           = EXCLUDED.content,
                content_vector    = EXCLUDED.content_vector
            """,
            rows,
            template=(
                "(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s::vector)"
            ),
        )
        conn.commit()
        print(f"  ✅ {party}/{year}: {len(rows)} 件保存")
        return len(rows)
    except Exception as e:
        conn.rollback()
        print(f"  ❌ {party}/{year}: {e}")
        return 0
    finally:
        cur.close()


# ============================================================
# メイン
# ============================================================

# 2026年のデフォルト対象政党
DEFAULT_PARTIES_2026 = [
    "cra", "ishin", "dpfp", "jcp", "reiwa", "sansei", "hoshu", "sdp",
]


def main():
    args = sys.argv[1:]

    dry_run = "--dry-run" in args
    args = [a for a in args if a != "--dry-run"]

    # --year 指定
    year = 2026
    if "--year" in args:
        idx = args.index("--year")
        year = int(args[idx + 1])
        args = args[:idx] + args[idx + 2:]

    # --parties 指定
    if "--parties" in args:
        idx = args.index("--parties")
        parties = args[idx + 1:]
        args = args[:idx]
    else:
        parties = DEFAULT_PARTIES_2026

    print(f"=== 公約ローダー ===")
    print(f"  対象: {', '.join(parties)}")
    print(f"  年: {year}")
    print(f"  データ: {DATA_DIR}")
    if dry_run:
        print(f"  モード: DRY RUN")
    print()

    conn = psycopg2.connect(DATABASE_URL)
    total = 0

    try:
        for party in parties:
            total += load_party(conn, party, year, dry_run=dry_run)
    finally:
        conn.close()

    print(f"\n=== 完了: 合計 {total} 件 ===")


if __name__ == "__main__":
    main()