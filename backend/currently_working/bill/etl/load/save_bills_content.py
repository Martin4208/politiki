import json
import psycopg2
from dotenv import load_dotenv
import os
from supabase import create_client, ClientOptions

INPUT_FILE = '../../data/content/content_embeded.json'
DB_CONFIG = {
    "host": "localhost",
    "database": "db",
    "user": "user",
    "password": "password",
    "port": "5432"
}

load_dotenv()

SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY,
    options=ClientOptions(schema="public", postgrest_client_timeout=60),
)

def vector_to_pg(vec: list[float] | None) -> str | None:
    if vec is None:
        return None
    return f"[{','.join(str(v) for v in vec)}]"


def save_bills_content(INPUT_FILE):
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        bills = json.load(f)

    # conn = psycopg2.connect(**DB_CONFIG)
    # cur  = conn.cursor()
    
    success_count = 0
    skip_count    = 0

    try:
        bill_codes_res = supabase.table("bills").select("bill_code").execute()
        existing_codes = set(row["bill_code"] for row in bill_codes_res.data)
            
        for bill in bills:
            bill_id = bill.get("bill_id")
            if not bill_id:
                continue

            # billsテーブルに存在するか確認
            
                
            if bill_id not in existing_codes:
                print(f"  [{bill_id}] billsテーブルに未存在。スキップ")
                skip_count += 1
                continue
            
            # local
            # cur.execute("SELECT bill_code  FROM bills WHERE bill_code = %s", (bill_id,))
            # if not cur.fetchone():
            #     print(f"  [{bill_id}] billsテーブルに未存在。スキップ")
            #     skip_count += 1
            #     continue

            # bill_content に INSERT
            content_payload = {
                "bill_id": bill_id,
                "bill_text": bill.get("bill_text"),
                "outline_text": bill.get("outline_text"),
                "bill_vector": bill.get("bill_vector"),
                "outline_vector": bill.get("outline_vector"),
            }

            content_res = supabase.table("bill_content") \
                .upsert(content_payload, on_conflict="bill_id") \
                .execute()

            # id取得（SupabaseはRETURNINGの代わりにdataで返る）
            if not content_res.data:
                print(f"❌ bill_content upsert失敗: {bill_id}")
                continue

            bill_content_id = content_res.data[0]["id"]
            
            
            # cur.execute("""
            #     INSERT INTO bill_content (
            #         bill_id,
            #         bill_text,
            #         outline_text,
            #         bill_vector,
            #         outline_vector
            #     )
            #     VALUES (%s, %s, %s, %s::vector, %s::vector)
            #     ON CONFLICT (bill_id) DO UPDATE SET
            #         bill_text      = EXCLUDED.bill_text,
            #         outline_text   = EXCLUDED.outline_text,
            #         bill_vector    = EXCLUDED.bill_vector,
            #         outline_vector = EXCLUDED.outline_vector
            #     RETURNING id
            # """, (
            #     bill_id,
            #     bill.get("bill_text"),
            #     bill.get("outline_text"),
            #     vector_to_pg(bill.get("bill_vector")),
            #     vector_to_pg(bill.get("outline_vector")),
            # ))
            # bill_content_id = cur.fetchone()[0]

            # bill_amendments に INSERT
            amendments_payload = []
            for amendment in bill.get("amendments", []):
                amendments_payload.append({
                    "bill_content_id": bill_content_id,
                    "title": amendment["title"],
                    "amendment_text": amendment["amendment_text"],
                    "amendment_vector": amendment.get("amendment_vector"),
                    "url": amendment["url"],
                })

            if amendments_payload:
                supabase.table("bill_amendments") \
                    .upsert(amendments_payload, on_conflict="bill_content_id,url") \
                    .execute()
            
            
            # for amendment in bill.get("amendments", []):
                # cur.execute("""
                #     INSERT INTO bill_amendments (
                #         bill_content_id,
                #         title,
                #         amendment_text,
                #         amendment_vector,
                #         url
                #     )
                #     VALUES (%s, %s, %s, %s::vector, %s)
                # """, (
                #     bill_content_id,
                #     amendment["title"],
                #     amendment["amendment_text"],
                #     vector_to_pg(amendment.get("amendment_vector")),
                #     amendment["url"],
                # ))

            success_count += 1
            if success_count % 100 == 0:
                # conn.commit()
                print(f"💾 {success_count} 件処理コミット済み")
                
        # conn.commit()
        print(f"\n✅ 完了: {success_count} 件保存, {skip_count} 件スキップ")

    except Exception as e:
        # conn.rollback()
        print(f"❌ エラー: {e}")
        raise
    # finally:
    #     cur.close()
    #     conn.close()
    
if __name__ == "__main__":
    save_bills_content(INPUT_FILE)