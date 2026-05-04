import json
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime, timezone


JSON_FILE = 'llm_eval.json'
DB_CONFIG = {
    "host": "localhost",
    "database": "db",
    "user": "user",
    "password": "password",
    "port": "5432"
}

# 1. Open JSON file
with open(JSON_FILE, 'r', encoding='utf-8') as f:
    json_data = json.load(f)
    

# 2. Connect to DB 
conn = psycopg2.connect(**DB_CONFIG)
cur = conn.cursor()

# pledges マスターを取得
cur.execute("SELECT id, administration_id, category, content FROM pledges;")
pledges_master = {str(row[0]): row for row in cur.fetchall()}

# pledge_id ごとに集約
pledge_map = {}

for bill in json_data:
    if not isinstance(bill, dict):
        continue

    bill_id = str(bill.get('bill_id'))
    evaluations = bill.get('evaluations')

    if not evaluations:
        continue

    for ev in evaluations:
        pledge_id = str(ev.get('pledge_id'))
        score = ev.get('alignment_score', 0)

        # pledges マスターに存在しない pledge_id はスキップ
        if pledge_id not in pledges_master:
            print(f"⚠️  pledge_id {pledge_id} が pledges テーブルに存在しません。スキップします。")
            continue

        if pledge_id not in pledge_map:
            pledge_map[pledge_id] = {
                'best_score': score,
                'best_bill_id': bill_id,
                'all_bill_ids': [bill_id],
                'achieved_elements': ev.get('achieved_elements', []),
                'missing_elements': ev.get('missing_elements', []),
                'reasoning': ev.get('reasoning', ''),
                'needs_review': ev.get('flag_for_review', False),
            }
        else:
            entry = pledge_map[pledge_id]

            if bill_id not in entry['all_bill_ids']:
                entry['all_bill_ids'].append(bill_id)

            if score > entry['best_score']:
                entry['best_score'] = score
                entry['best_bill_id'] = bill_id
                entry['achieved_elements'] = ev.get('achieved_elements', [])
                entry['missing_elements'] = ev.get('missing_elements', [])
                entry['reasoning'] = ev.get('reasoning', '')

            if ev.get('flag_for_review', False):
                entry['needs_review'] = True


def score_to_status(score: int) -> str:
    if score >= 80:
        return 'achieved'
    elif score >= 60:
        return 'in_progress'
    elif score >= 30:
        return 'partial'
    else:
        return 'unstarted'


insert_data = []
now = datetime.now(timezone.utc)

for pledge_id, entry in pledge_map.items():
    master = pledges_master[pledge_id]
    _, administration_id, category, content = master

    insert_data.append((
        pledge_id,
        content,           # pledge_text
        administration_id, # party_id
        category,
        score_to_status(entry['best_score']),
        entry['best_score'],
        entry['best_bill_id'],
        json.dumps(entry['all_bill_ids'], ensure_ascii=False),
        json.dumps(entry['achieved_elements'], ensure_ascii=False),
        json.dumps(entry['missing_elements'], ensure_ascii=False),
        entry['reasoning'],
        entry['needs_review'],
        None,
        now,
    ))


# 3. Clean the data
# unique_data = {}
# for item in json_data:
    # diet_sessions
    # insert_data.append((
    #     item.get('diet_session_number'),
    #     item.get('diet_session'),
    #     item.get('convocation_date'),
    #     item.get('diet_ending_date'),
    #     item.get('session_period'),
    #     item.get('planned_session_period'),
    #     item.get('extension') or None
    # ))
    
    
    # bills
#     key = (item.get('diet_number'), item.get('bill_number'), item.get('category'))
    
#     # 挿入用データ
#     val = (
#         item.get('category'),
#         item.get('deliberated_session'),
#         item.get('diet_number'),
#         item.get('bill_number'),
#         item.get('title'),
#         item.get('status'),
#         item.get('progress_url'),
#         item.get('text_url') or None
#     )
    
#     # 同じキーがあれば上書き（1つのINSERT文の中に重複行が含まれないようにする）
#     unique_data[key] = val
    
# insert_data = list(unique_data.values())

try:
    # diet_sessions
    # execute_values(cur, """
    #     INSERT INTO diet_sessions (
    #         session_number, name, start_date, end_date, 
    #         session_period, planned_session_period, extended_days
    #     )
    #     VALUES %s
    #     ON CONFLICT (session_number) DO UPDATE SET
    #         name = EXCLUDED.name,
    #         start_date = EXCLUDED.start_date,
    #         end_date = EXCLUDED.end_date,
    #         session_period = EXCLUDED.session_period,
    #         planned_session_period = EXCLUDED.planned_session_period,
    #         extended_days = EXCLUDED.extended_days;
    # """, insert_data)
    
    # bills
    # query = """
    #     INSERT INTO bills (
    #         category, deliberated_session, diet_number, bill_number, title, status, 
    #         progress_url, text_url, session_id
    #     )
    #     SELECT 
    #         v.category, 
    #         v.deliberated_session::integer, 
    #         v.diet_number::integer, 
    #         v.bill_number::integer, 
    #         v.title, 
    #         v.status, 
    #         v.progress_url, 
    #         v.text_url, 
    #         s.id
    #     FROM (VALUES %s) AS v(
    #         category, deliberated_session, diet_number, bill_number, title, status, progress_url, text_url
    #     )
    #     LEFT JOIN diet_sessions s ON s.session_number = v.diet_number::integer
    #     ON CONFLICT (diet_number, bill_number, category) -- ここは「衝突を検知する列」の定義
    #     DO UPDATE SET
    #         status = EXCLUDED.status,
    #         progress_url = EXCLUDED.progress_url,
    #         text_url = EXCLUDED.text_url,
    #         deliberated_session = EXCLUDED.deliberated_session,
    #         session_id = EXCLUDED.session_id; -- SELECT句で取得した s.id を反映
    # """
    
    # progress
    
    # llm_eval.json
    query = """
    INSERT INTO pledge_tracker (
        pledge_id,
        pledge_text,
        party_id,
        category,
        final_status,
        best_score,
        best_bill_id,
        all_bill_ids,
        achieved_elements,
        missing_elements,
        reasoning,
        needs_review,
        review_reason,
        updated_at
    )
    VALUES %s
    ON CONFLICT (pledge_id) DO UPDATE SET
        pledge_text       = EXCLUDED.pledge_text,
        party_id          = EXCLUDED.party_id,
        category          = EXCLUDED.category,
        final_status      = EXCLUDED.final_status,
        best_score        = EXCLUDED.best_score,
        best_bill_id      = EXCLUDED.best_bill_id,
        all_bill_ids      = EXCLUDED.all_bill_ids,
        achieved_elements = EXCLUDED.achieved_elements,
        missing_elements  = EXCLUDED.missing_elements,
        reasoning         = EXCLUDED.reasoning,
        needs_review      = EXCLUDED.needs_review,
        review_reason     = EXCLUDED.review_reason,
        updated_at        = EXCLUDED.updated_at;
"""


    
    execute_values(cur, query, insert_data)
    
    conn.commit()
    print(f"✅ {len(insert_data)}件のデータを同期しました。")
except Exception as e:
    print(f"❌ エラーが発生しました: {e}")
    conn.rollback()
finally:
    cur.close()
    conn.close()
    