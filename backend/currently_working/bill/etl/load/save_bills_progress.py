import json
import os
import re
from dotenv import load_dotenv
from supabase import create_client, ClientOptions

db_url = os.getenv("DATABASE_URL")

if not db_url:
    load_dotenv()
    db_url = os.environ.get("DATABASE_URL")
    
if not db_url:
    raise RuntimeError("DATABASE_URL is not set in environment or .env file")


SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY,
    options=ClientOptions(schema="public", postgrest_client_timeout=60),
)


# ── 和暦→西暦変換 ──
ERA_MAP = {
    "明治": 1868,
    "大正": 1912,
    "昭和": 1926,
    "平成": 1989,
    "令和": 2019,
}

DATE_PATTERN = re.compile(
    r"(明治|大正|昭和|平成|令和)\s*(\d{1,2})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日"
)


def wareki_to_iso(text: str) -> str | None:
    """'平成10年 1月12日' → '1998-01-12'"""
    if not text or not text.strip():
        return None
    m = DATE_PATTERN.search(text)
    if not m:
        return None
    era, year, month, day = m.group(1), int(m.group(2)), int(m.group(3)), int(m.group(4))
    western_year = ERA_MAP[era] + year - 1
    return f"{western_year:04d}-{month:02d}-{day:02d}"


# ── 提出者パース ──
SUBMITTER_SUFFIX = re.compile(r"[君氏]外.*$")


def clean_name(name: str) -> str:
    """'岸本周平君' → '岸本周平'  敬称・全角スペースを除去"""
    name = name.strip()
    name = SUBMITTER_SUFFIX.sub("", name)
    name = re.sub(r"[君氏]$", "", name)
    name = name.replace("　", " ").strip()
    return name


def clean_name_list(names: list[str]) -> list[str] | None:
    """名前リストから敬称を除去"""
    result = [clean_name(n) for n in names if n.strip()]
    result = [n for n in result if n]
    return result if result else None


def parse_submitters(text: str, submitter_list: list[str] | None = None) -> list[str] | None:
    """議案提出者一覧があればそれを使い、なければテキストからパース"""
    # 議案提出者一覧（配列）があればそちらを優先
    if submitter_list:
        return clean_name_list(submitter_list)

    # フォールバック: テキストからパース
    if not text or not text.strip():
        return None
    names = re.split(r"[;；,、]", text)
    result = [clean_name(n) for n in names if n.strip()]
    result = [n for n in result if n]
    return result if result else None


def parse_factions(text: str) -> list[str] | None:
    """'新進党; 太陽党' → ['新進党', '太陽党']"""
    if not text or not text.strip():
        return None
    factions = [f.strip() for f in re.split(r"[;；]", text) if f.strip()]
    return factions if factions else None


# ── スラッシュ区切りパース ──
def split_slash(value: str) -> tuple[str | None, str | None]:
    """'平成10年 5月12日\n／\n可決' → ('1998-05-12', '可決')"""
    if not value or not value.strip():
        return None, None
    cleaned = value.replace("\n", "")
    parts = cleaned.split("／", 1)
    date_part = wareki_to_iso(parts[0])
    extra_part = parts[1].strip() if len(parts) > 1 and parts[1].strip() else None
    return date_part, extra_part


# ── bills テーブルから progress_url → id のマッピングを取得（ページネーション対応）──
def fetch_bill_id_map() -> dict[str, int]:
    """progress_url (完全URL) → bills.id のマッピングを返す"""
    print("📡 bills テーブルからマッピングを取得中...")

    url_to_id: dict[str, int] = {}
    PAGE_SIZE = 20  # Supabase の max_rows 設定に合わせる
    offset = 0
    total_fetched = 0

    while True:
        result = (
            supabase.table("bills")
            .select("id, progress_url")
            .order("id")
            .range(offset, offset + PAGE_SIZE - 1)
            .execute()
        )
        rows = result.data
        if not rows:
            break

        total_fetched += len(rows)
        for row in rows:
            url = row.get("progress_url")
            if url:
                url_to_id[url] = row["id"]

        if total_fetched % 1000 < PAGE_SIZE:
            print(f"  → {total_fetched} 件取得済み（マッピング: {len(url_to_id)} 件）")
        if len(rows) < PAGE_SIZE:
            break
        offset += PAGE_SIZE

    print(f"  → マッピング合計: {len(url_to_id)} 件")
    return url_to_id


# ── メイン処理 ──
def save_bills_progress(INPUT_FILE):
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        progress = json.load(f)

    url_to_bill_id = fetch_bill_id_map()

    rows = []
    skipped = 0

    for p in progress:
        progress_url = p.get("url")  # progress.json の url フィールド
        bill_id = url_to_bill_id.get(progress_url)

        if bill_id is None:
            skipped += 1
            continue

        c = p.get("content", {})

        # 衆議院
        hr_pre_date, hr_pre_committee = split_slash(
            c.get("衆議院予備付託年月日／衆議院予備付託委員会", ""))
        hr_assigned_date, hr_committee = split_slash(
            c.get("衆議院付託年月日／衆議院付託委員会", ""))
        hr_decision_date, hr_decision_result = split_slash(
            c.get("衆議院審査終了年月日／衆議院審査結果", ""))
        hr_plenary_date, hr_plenary_result = split_slash(
            c.get("衆議院審議終了年月日／衆議院審議結果", ""))

        # 参議院
        sr_pre_date, sr_pre_committee = split_slash(
            c.get("参議院予備付託年月日／参議院予備付託委員会", ""))
        sr_assigned_date, sr_committee = split_slash(
            c.get("参議院付託年月日／参議院付託委員会", ""))
        sr_decision_date, sr_decision_result = split_slash(
            c.get("参議院審査終了年月日／参議院審査結果", ""))
        sr_plenary_date, sr_plenary_result = split_slash(
            c.get("参議院審議終了年月日／参議院審議結果", ""))

        # 公布
        promulgated_date, law_number = split_slash(
            c.get("公布年月日／法律番号", ""))

        # 賛成者リスト（君を除去）
        supporters_raw = c.get("議案提出の賛成者", [])
        supporters = clean_name_list(supporters_raw) if supporters_raw else None

        row = {
            "id": str(bill_id),
            "bill_id": bill_id,
            "submitters": parse_submitters(
                c.get("議案提出者", ""),
                c.get("議案提出者一覧")
            ),
            "submitter_faction": c.get("議案提出会派") or None,
            "supporters": supporters,
            "hr_pre_received_date": wareki_to_iso(c.get("衆議院予備審査議案受理年月日", "")),
            "hr_pre_committee_assigned_date": hr_pre_date,
            "hr_pre_committee": hr_pre_committee,
            "hr_received_date": wareki_to_iso(c.get("衆議院議案受理年月日", "")),
            "hr_committee_assigned_date": hr_assigned_date,
            "hr_committee": hr_committee,
            "hr_committee_decision_date": hr_decision_date,
            "hr_committee_result": hr_decision_result,
            "hr_plenary_decision_date": hr_plenary_date,
            "hr_plenary_result": hr_plenary_result,
            "hr_vote_factions_for": None,
            "hr_vote_factions_against": None,
            "sr_pre_received_date": wareki_to_iso(c.get("参議院予備審査議案受理年月日", "")),
            "sr_pre_committee_assigned_date": sr_pre_date,
            "sr_pre_committee": sr_pre_committee,
            "sr_received_date": wareki_to_iso(c.get("参議院議案受理年月日", "")),
            "sr_committee_assigned_date": sr_assigned_date,
            "sr_committee": sr_committee,
            "sr_committee_decision_date": sr_decision_date,
            "sr_committee_result": sr_decision_result,
            "sr_plenary_decision_date": sr_plenary_date,
            "sr_plenary_result": sr_plenary_result,
            "sr_vote_factions_for": None,
            "sr_vote_factions_against": None,
            "promulgated_date": promulgated_date,
            "law_number": law_number,
        }

        rows.append(row)

    print(f"📥 {len(rows)} 件をインサート予定（スキップ: {skipped} 件）")

    # バッチ upsert
    BATCH_SIZE = 500
    inserted = 0
    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i : i + BATCH_SIZE]
        supabase.table("bill_progress").upsert(batch, on_conflict="id").execute()
        inserted += len(batch)
        print(f"  → {inserted} / {len(rows)} 件完了")

    print(f"✅ 合計 {inserted} 件を保存しました。")


if __name__ == "__main__":
    save_bills_progress(INPUT_FILE="../../data/progress/progress.json")