from urllib.request import urlopen, Request
from bs4 import BeautifulSoup
import os
import time
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
import random

ORIGINAL_URL = 'https://www.shugiin.go.jp/internet/itdb_gian.nsf/html/gian/honbun/g20705003.htm'
BASE_URL = 'https://www.shugiin.go.jp/internet/itdb_gian.nsf/html/gian/keika/'
SLEEP_TIME = 0.8



def fetch_html(url: str, retries: int = 3) -> str:
    for attempt in range(retries):
        try:
            req = Request(url, headers={'User-Agent': 'Mozilla/5.0 (compatible; research-bot/1.0)'})
            with urlopen(req, timeout=30) as res:  # タイムアウトを15→30秒に延長
                raw_data = res.read()
                return raw_data.decode('cp932', errors='ignore')
        except Exception as e:
            print(f"[fetch_html] attempt {attempt+1}/{retries} failed: {e}")
            if attempt < retries - 1:
                time.sleep(2 ** attempt)  # 1秒 → 2秒 → 4秒 と待機時間を増やす
            else:
                raise


def table_to_json(soup) -> dict:
    record = {}
    
    tables = soup.find_all('table')
    
    if not tables:
        return record
        
    for table in tables:
        rows = table.find_all('tr')
        
        for row in rows:
            cells = row.find_all('td')
            
            if len(cells) < 2:
                continue

            
            key = cells[0].get_text(strip=True)
            value = cells[1].get_text(strip=True)
            
            if value == '／':
                value = ''
            
            if '議案提出者' == key:
                record['議案提出者'] = value
            elif '議案提出会派' == key:
                record['議案提出会派'] = value
            
            elif '衆議院予備審査議案受理年月日' == key:
                record['衆議院予備審査議案受理年月日'] = value
            elif '衆議院予備付託年月日／衆議院予備付託委員会' == key:
                record['衆議院予備付託年月日／衆議院予備付託委員会'] = value
            elif '衆議院議案受理年月日' == key:
                record['衆議院議案受理年月日'] = value
            elif '衆議院付託年月日／衆議院付託委員会' == key:
                record['衆議院付託年月日／衆議院付託委員会'] = value
            elif '衆議院議案受理年月日' == key:
                record['衆議院議案受理年月日'] = value
            elif '衆議院審査終了年月日／衆議院審査結果' == key:
                record['衆議院審査終了年月日／衆議院審査結果'] = value
            elif '衆議院審議終了年月日／衆議院審議結果' == key:
                record['衆議院審議終了年月日／衆議院審議結果'] = value
            
            elif '参議院予備審査議案受理年月日' == key:
                record['参議院予備審査議案受理年月日'] = value
            elif '参議院予備付託年月日／参議院予備付託委員会' == key:
                record['参議院予備付託年月日／参議院予備付託委員会'] = value
            elif '参議院議案受理年月日' == key:
                record['参議院議案受理年月日'] = value
            elif '参議院付託年月日／参議院付託委員会' == key:
                record['参議院付託年月日／参議院付託委員会'] = value
            elif '参議院審査終了年月日／参議院審査結果' == key:
                record['参議院審査終了年月日／参議院審査結果'] = value
            elif '参議院審議終了年月日／参議院審議結果' == key:
                record['参議院審議終了年月日／参議院審議結果'] = value
            
            elif '公布年月日／法律番号' == key:
                record['公布年月日／法律番号'] = value
            
            elif '議案提出者一覧' == key:
                record['議案提出者一覧'] = [name.strip() for name in value.split(';') if name.strip()]
            elif '議案提出の賛成者' == key:
                record['議案提出の賛成者'] = [name.strip() for name in value.split(';') if name.strip()]
            else:
                continue

    return record


def get_progress_url_list(INPUT_FILE) -> list:
    with open(INPUT_FILE, encoding='utf-8') as f:
        bills_list = json.load(f)
    return [bill.get('progress_url') for bill in bills_list]


def fetch_one_index(url: str) -> dict | None:
    """1つの目次URLをフェッチしてリンク一覧を返す"""
    if not url:
        return None
    try:
        print(f"[Step1] Processing: {url}")
        html = fetch_html(url)
        soup = BeautifulSoup(html, 'html.parser')
        bill_id = os.path.basename(url).split('.')[0] 
        print(f"[Step1] Done: {url})")
        time.sleep(random.uniform(SLEEP_TIME - 0.2, SLEEP_TIME + 0.2))
        return {"bill_id": bill_id, "index_url": url}
    except Exception as e:
        print(f"[Step1] Error {url}: {e}")
        return {"bill_id": os.path.basename(url).split('.')[0], "index_url": url, "error": str(e)}


def download_all_index_pages(url_list: list, max_workers: int = 4) -> list:
    """ThreadPoolExecutorを正しく使って並列フェッチ"""
    results = []
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(fetch_one_index, url): url for url in url_list if url}
        for future in as_completed(futures):
            result = future.result()
            if result:
                results.append(result)
    return results


def fetch_one_document(task: dict) -> dict:
    """1つの書類URLをフェッチして内容を返す。Step2でWorkerから呼ばれる。
    task = {"bill_id": ..., "url": ...}
    """
    bill_id = task["bill_id"]
    url = task["url"]
    try:
        print(f"[Step2] Fetching: [{bill_id}] {url}")
        html = fetch_html(url)
        soup = BeautifulSoup(html, 'html.parser')
        json_data = table_to_json(soup)
        time.sleep(random.uniform(0.3, 0.6))
        return {"bill_id": bill_id, "url": url, "content": json_data}
    except Exception as e:
        print(f"[Step2] Error [{bill_id}] {url}: {e}")
        return {"bill_id": bill_id, "url": url, "content": {}, "error": str(e)}


def get_progress(
    INPUT_FILE='./data/bills/bills.json', 
    STEP1_OUTPUT_FILE='./data/progress/progress_links.json', 
    OUTPUT_FILE='./data/progress/progress.json'
):
    progress_url_list = get_progress_url_list(INPUT_FILE)

    # ──────────────────────────────────────────
    # Step 1: 各目次ページからリンク一覧を収集
    # ──────────────────────────────────────────
    if os.path.exists(STEP1_OUTPUT_FILE):
        print(f"[Step1] {STEP1_OUTPUT_FILE} が存在するのでスキップします。読み込み中...")
        with open(STEP1_OUTPUT_FILE, encoding='utf-8') as f:
            all_bill_links = json.load(f)
    else:
        print("=== Step 1: 目次ページからリンク一覧を並列収集 ===")
        all_bill_links = download_all_index_pages(progress_url_list, max_workers=4)

        with open(STEP1_OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(all_bill_links, f, ensure_ascii=False, indent=2)
        print(f"[Step1] 完了。{len(all_bill_links)} 件を {STEP1_OUTPUT_FILE} に保存しました。")

    # ──────────────────────────────────────────
    # Step 2: 各リンクの本文を並列フェッチ
    # 法案×書類 をフラットなタスクリストに展開してすべて並列投入
    # ──────────────────────────────────────────
    print("=== Step 2: 各書類の本文を並列フェッチ ===")

    tasks = [
        {"bill_id": item["bill_id"], "url": item["index_url"]}
        for item in all_bill_links
    ]
    print(f"[Step2] 合計 {len(tasks)} 件の書類をフェッチします")

    fetched = []
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = {executor.submit(fetch_one_document, task): task for task in tasks}
        for future in as_completed(futures):
            result = future.result()
            if result:
                fetched.append(result)

    grouped = {item["bill_id"]: {"bill_id": item["bill_id"]} for item in all_bill_links}
    for doc in fetched:
        grouped[doc["bill_id"]]["url"] = doc["url"]
        grouped[doc["bill_id"]]["content"] = doc["content"]
        if "error" in doc:
            grouped[doc["bill_id"]]["error"] = doc["error"]

    final_results = list(grouped.values())

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(final_results, f, ensure_ascii=False, indent=2)

    print(f"=== 完了！{len(final_results)} 件を {OUTPUT_FILE} に保存しました。 ===")


if __name__ == "__main__":
    INPUT_FILE = '../../data/bills/bills.json'
    STEP1_OUTPUT_FILE = '../../data/progress/progress_links.json'
    OUTPUT_FILE = '../../data/bills/progress.json'
    get_progress()
    
    





