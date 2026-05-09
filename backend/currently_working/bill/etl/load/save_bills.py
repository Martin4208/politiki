import json
import psycopg2
from psycopg2.extras import execute_values
import os
from dotenv import load_dotenv
from supabase import create_client, ClientOptions

# ============================================================
# 設定
# ============================================================

PG_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "db",
    "user": "user",
    "password": "password"
}

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

EMBEDDING_DIMENSIONS = 768


def save_bills(INPUT_FILE='./data/bills/bills.json'):
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        bills = json.load(f)
    
    # conn = psycopg2.connect(**PG_CONFIG)
    # cur = conn.cursor()
    
    try:
        insert_data = [
            {
                "category": b.get("category"),
                "current_session_number": b.get("current_session_number"),
                "submitted_session_number": b.get("submitted_session_number"),
                "bill_number": b.get("bill_number"),
                "title": b.get("title"),
                "status": b.get("status"),
                "progress_url": b.get("progress_url"),
                "content_url": b.get("content_url"),
                "bill_code": b.get("bill_code"),
            }
            for b in bills
        ]
        
        print(f"📥 {len(insert_data)} 件の法案データをインポート中...")
        
        # Local
        # execute_values(cur, """
        #     INSERT INTO bills (category, current_session_number, submitted_session_number, bill_number, title, status, progress_url, content_url, bill_code)
        #     VALUES %s
        #     ON CONFLICT (bill_code) DO NOTHING
        # """, insert_data)
        # conn.commit()
        
        BATCH_SIZE=500
        for i in range(0, len(insert_data), BATCH_SIZE):
            batch = insert_data[i:i+BATCH_SIZE]
            supabase.table("bills").upsert(
                batch,
                on_conflict="category,submitted_session_number,bill_number"
            ).execute()
        
        print(f"✅ Saved {len(bills)} chunks to DB.")
    
    except Exception as e:
        # conn.rollback()
        print(f"❌ エラー発生: {e}")
    # finally:
        # cur.close()
        # conn.close()


if __name__ == "__main__":
    save_bills(INPUT_FILE='../../data/bills/bills.json')
