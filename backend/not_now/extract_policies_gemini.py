import os
import json
import time
from pathlib import Path
from google import genai
from google.genai.errors import ClientError

# ===== 設定 =====
CHUNK_SIZE = 1000          # 文字数ベース
SLEEP_SECONDS = 2          # レート制限対策
MODEL_NAME = "gemini-embedding-001"

# ===== Gemini client =====
client = genai.Client(api_key="AIzaSyBP5zNU7P-DkSnh28cE8A2q4b_VVvbJ5eE")

# ===== チャンク関数 =====
def chunk_text(text: str, size: int):
    return [text[i:i+size] for i in range(0, len(text), size)]

# ===== 対象ディレクトリ =====
base_dir = Path("../lib/parties/policies")

# ts_files = list(base_dir.rglob("*.ts"))

file_path = (Path("../lib/parties/policies/jcp/policies.ts"))

#for file_path in ts_files:
print(f"Processing: {file_path}")

content = file_path.read_text(encoding="utf-8")
chunks = chunk_text(content, CHUNK_SIZE)

chunk_results = []

for idx, chunk in enumerate(chunks):
    while True:
        try:
            result = client.models.embed_content(
                model=MODEL_NAME,
                contents=chunk
            )
            embedding = result.embeddings[0].values

            chunk_results.append({
                "chunk_index": idx,
                "text": chunk,
                "embedding": embedding
            })

            break

        except ClientError as e:
            if e.status_code == 429:
                print("Rate limit hit. Sleeping 60 seconds...")
                time.sleep(60)
            else:
                raise

    time.sleep(SLEEP_SECONDS)

# ===== 保存 =====
output_data = {
    "file": str(file_path),
    "num_chunks": len(chunk_results),
    "chunks": chunk_results
}

json_path = file_path.with_suffix(".json")

with open(json_path, "w", encoding="utf-8") as f:
    json.dump(output_data, f, ensure_ascii=False)

print(f"Saved: {json_path}")