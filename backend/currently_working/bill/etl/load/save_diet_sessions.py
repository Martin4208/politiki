import json
import os
import re
from dotenv import load_dotenv
from supabase import create_client, ClientOptions

load_dotenv()

SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY,
    options=ClientOptions(schema="public", postgrest_client_timeout=60),
)

def save_diet_sessions(INPUT_FILE='./data/diet_session/diet_session.json'):
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        diet_sessions = json.load(f)
        
    try:
        rows = [
            {
                "session_number": ds.get("session_number"),
                "name": ds.get("name"),
                "start_date": ds.get("start_date"),
                "end_date": ds.get("end_date"),
                "session_period": ds.get("session_period"),
                "planned_session_period": ds.get("planned_session_period"),
                "extended_days": ds.get("extended_days"),
            }
            for ds in diet_sessions
        ]
        
        print(f"📥 {len(rows)} 件の国会会期データをアップサート中...")
        
        BATCH_SIZE = 500
        for i in range(0, len(rows), BATCH_SIZE):
            batch = rows[i:i+BATCH_SIZE]

            supabase.table("diet_sessions").upsert(
                batch,
                on_conflict="session_number"
            ).execute()

            print(f"  → {min(i+BATCH_SIZE, len(rows))} / {len(rows)} 件")

        print("✅ Supabaseに保存完了")

    except Exception as e:
        print(f"❌ エラー発生: {e}")
        raise


if __name__ == "__main__":
    save_diet_sessions(INPUT_FILE='../../data/diet_session/diet_session.json')