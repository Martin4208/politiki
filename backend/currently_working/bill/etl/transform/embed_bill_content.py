import json
import re
import time
import requests
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") 
GEMINI_EMBEDDING_MODEL = "gemini-embedding-001"
GEMINI_EMBEDDING_URL_SINGLE = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"{GEMINI_EMBEDDING_MODEL}:embedContent?key={GEMINI_API_KEY}"
)
# バッチ用URL
GEMINI_EMBEDDING_URL_BATCH = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"{GEMINI_EMBEDDING_MODEL}:batchEmbedContents?key={GEMINI_API_KEY}"
)
EMBEDDING_DIMENSIONS = 768
API_BATCH_SIZE = 40  # 400エラー回避のため100を上限とする
# DB_CONFIG = {
#     "host": "localhost",
#     "database": "db",
#     "user": "user",
#     "password": "password",
#     "port": "5432"
# }

db_url = os.getenv("DATABASE_URL")

if not db_url:
    load_dotenv()
    db_url = os.environ.get("DATABASE_URL")

if not db_url:
    raise RuntimeError("DATABASE_URL is not set in environment or .env file")


def extract_submitted_session_number(bill_id: str) -> int | None:
    digits = re.sub(r'[^0-9]', '', bill_id)
    return int(digits[:3]) if len(digits) >= 3 else None


def classify_documents(documents: list) -> tuple[str | None, str | None, list[str]]:
    bill_text       = None
    outline_text    = None
    amendment_docs: list[dict] = []

    for doc in documents:
        title   = doc.get('title', '')
        content = doc.get('content', '')
        url = doc.get('url', '')

        if '修正案' in title:
            amendment_docs.append(
                {"title": title, "url": url, "content": content}
            )
        elif '要綱' in title:
            outline_text = content
        else:
            bill_text = content

    return bill_text, outline_text, amendment_docs

def get_embeddings(texts: list[str]) -> list[list[float] | None]:
    """texts と同じ長さのベクトルリストを返す。失敗分は None。"""
    all_vectors: list[list[float] | None] = []
    if not texts:
        return all_vectors

    i = 0
    while i < len(texts):
        batch_texts = texts[i : i + API_BATCH_SIZE]

        payload = {
            "requests": [
                {
                    "model": f"models/{GEMINI_EMBEDDING_MODEL}",
                    "content": {"parts": [{"text": t}]},
                    "taskType": "RETRIEVAL_DOCUMENT",
                    "outputDimensionality": EMBEDDING_DIMENSIONS,
                }
                for t in batch_texts
            ]
        }

        try:
            # ★修正: バッチ用URLに修正 (元コードは :embedContent でバッチ非対応)
            res = requests.post(GEMINI_EMBEDDING_URL_BATCH, json=payload, timeout=120)

            if res.status_code == 200:
                data = res.json()
                vectors = [item["values"] for item in data["embeddings"]]
                all_vectors.extend(vectors)
                print(
                    f"    📡 API Batch done "
                    f"({len(batch_texts)} texts, total {len(all_vectors)})"
                )
                i += API_BATCH_SIZE
                time.sleep(1.0)

            elif res.status_code == 429:
                wait_time = 60.0
                try:
                    body = res.json()
                    for detail in body.get("error", {}).get("details", []):
                        if "retryDelay" in detail:
                            m = re.search(r"\d+\.?\d*", str(detail["retryDelay"]))
                            if m:
                                wait_time = float(m.group()) + 1
                                break
                except Exception:
                    pass
                print(
                    f"    ⚠️ Quota Exceeded (429). Waiting {wait_time}s before retry..."
                )
                time.sleep(wait_time)
                # i を進めずに再試行

            elif res.status_code == 400:
                print(f"    ❌ API Error 400: {res.text[:200]}")
                all_vectors.extend([None] * len(batch_texts))
                i += API_BATCH_SIZE

            else:
                print(f"    ❌ API Error: {res.status_code} - {res.text[:200]}")
                all_vectors.extend([None] * len(batch_texts))
                i += API_BATCH_SIZE

        except Exception as e:
            print(f"    ❌ Network Error: {e}")
            time.sleep(5)
            all_vectors.extend([None] * len(batch_texts))
            i += API_BATCH_SIZE

    return all_vectors


# def embed_text(text: str, retry_count: int = 0) -> list[float] | None:
#     if not text or not text.strip():
#         return None

#     payload = json.dumps({
#         "model": f"models/{GEMINI_EMBEDDING_MODEL}",
#         "content": {"parts": [{"text": text}]},
#         "taskType": "RETRIEVAL_DOCUMENT",
#         "outputDimensionality": EMBEDDING_DIMENSIONS,
#     }).encode("utf-8")

#     req = urllib.request.Request(
#         GEMINI_EMBEDDING_URL_SINGLE,
#         data=payload,
#         headers={"Content-Type": "application/json"},
#         method="POST"
#     )

#     try:
#         with urllib.request.urlopen(req) as res:
#             data = json.loads(res.read().decode("utf-8"))
#             return data["embedding"]["values"]

#     except urllib.error.HTTPError as e:
#         body = json.loads(e.read().decode("utf-8"))

#         if e.code == 429:
#             if retry_count >= 5:
#                 print("  ⚠️  リトライ上限。スキップします。")
#                 return None

#             retry_delay_str = None
#             for detail in body.get("error", {}).get("details", []):
#                 if "RetryInfo" in detail.get("@type", ""):
#                     retry_delay_str = detail.get("retryDelay")
#                     break

#             wait_sec = int(retry_delay_str.replace("s", "")) + 1 if retry_delay_str else 60
#             print(f"  ⚠️  Rate limit。{wait_sec}秒待機中... (retry {retry_count + 1}/5)")
#             time.sleep(wait_sec)
#             return embed_text(text, retry_count + 1)

#         print(f"  ❌ Gemini APIエラー: {e.code} {body}")
#         return None


# def embed_texts_with_batch(texts: list):
#     all_vectors = []
#     i = 0
#     while i < len(texts):
#         batch_texts = texts[i : i + API_BATCH_SIZE]
        
#         payload = {
#             "requests": [
#                 {
#                     "model": f"models/{GEMINI_EMBEDDING_MODEL}",
#                     "content": {"parts": [{"text": t}]},
#                     "taskType": "RETRIEVAL_DOCUMENT",
#                     "outputDimensionality": EMBEDDING_DIMENSIONS 
#                 } for t in batch_texts
#             ]
#         }
        
#         try:
#             res = requests.post(GEMINI_EMBEDDING_URL_BATCH, json=payload)
            
#             if res.status_code == 200:
#                 data = res.json()
#                 vectors = [item['values'] for item in data['embeddings']]
#                 all_vectors.extend(vectors)
#                 print(f"    📡 API Batch {len(all_vectors)//API_BATCH_SIZE + 1} Done ({len(batch_texts)} texts)")
#                 i += API_BATCH_SIZE  # 成功したので次のスライスへ
#                 time.sleep(1.0)      # 連続リクエストによる負荷軽減

#             elif res.status_code == 429:
#                 # 429エラー時は待機して再試行
#                 retry_info = res.json().get("details", [{}])[0].get("retryDelay", "25s")
#                 # "24.0615s" のような文字列から数字だけ抽出
#                 wait_time = float(re.search(r"\d+\.?\d*", str(retry_info)).group()) + 1
#                 print(f"    ⚠️ Quota Exceeded (429). Waiting {wait_time}s before retry...")
#                 time.sleep(wait_time)
#                 # i を進めずに再試行する

#             elif res.status_code == 400:
#                 print(f"    ❌ API Error 400: Batch size may be too large. Reducing...")
#                 # 万が一100でもエラーが出る場合はここを通る
#                 all_vectors.extend([None] * len(batch_texts))
#                 i += API_BATCH_SIZE

#             else:
#                 print(f"    ❌ API Error: {res.status_code} - {res.text}")
#                 all_vectors.extend([None] * len(batch_texts))
#                 i += API_BATCH_SIZE

#         except Exception as e:
#             print(f"    ❌ Network Error: {e}")
#             time.sleep(5) # ネットワークエラー時は少し待機
#             all_vectors.extend([None] * len(batch_texts))
#             i += API_BATCH_SIZE
            
#     return all_vectors


def process_and_embed_bill_content(
    INPUT_FILE = './data/content/content_c_s.json', 
    OUTPUT_FILE = './data/content/content_c_s_e.json'
):
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        bills_content = json.load(f)
        
    conn = psycopg2.connect(db_url)
    cur  = conn.cursor()

    results = []
    success_count      = 0
    
    for bill in bills_content:
        bill_id = bill.get("bill_id")
        documents = bill.get('documents', [])
        
        if not bill_id or not documents:
            continue
        
        cur.execute("""
            SELECT bill_code
            FROM bills
            WHERE bill_code = %s
        """, (bill_id,))
        row = cur.fetchone()
        if row is None:
            continue
        bill_code = row[0]
        
        bill_text, outline_text, amendment_docs = classify_documents(documents)
        
        print(f"  [{bill_id}] エンベディング中... "
            f"bill={'✓' if bill_text else '✗'}, "
            f"outline={'✓' if outline_text else '✗'}, "
            f"amendment={len(amendment_docs)}")
        
        keys: list[str] = []
        texts: list[str] = []
        if bill_text:
            keys.append("bill")
            texts.append(bill_text)
        if outline_text:
            keys.append("outline")
            texts.append(outline_text)

        vectors_dict: dict[str, list[float] | None] = {}
        if texts:
            vec_list = get_embeddings(texts)
            for k, v in zip(keys, vec_list):
                vectors_dict[k] = v

        amendment_results = []
        if amendment_docs:
            amendment_texts   = [d["content"] for d in amendment_docs]
            amendment_vectors = get_embeddings(amendment_texts)
            for doc, vec in zip(amendment_docs, amendment_vectors):
                amendment_results.append({
                    "title":           doc["title"],
                    "url":             doc["url"],
                    "amendment_text":  doc["content"],
                    "amendment_vector": vec,
                })

        results.append({
            "bill_id":        bill_code,
            "bill_text":      bill_text,
            "outline_text":   outline_text,
            "bill_vector":    vectors_dict.get("bill"),
            "outline_vector": vectors_dict.get("outline"),
            "amendments":     amendment_results,
        })

        success_count += 1

        if success_count % 100 == 0:
            conn.commit()
            print(f"💾 {success_count} 件コミット済み")
    cur.close()
    conn.close()

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 完了: {success_count} 件 → {OUTPUT_FILE}")


if __name__ == "__main__":
    process_and_embed_bill_content(INPUT_FILE = '../../data/content/content_c_s.json', OUTPUT_FILE = '../../data/content/content_c_s_e.json')
