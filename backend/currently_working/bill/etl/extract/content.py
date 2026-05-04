from urllib.parse import urljoin
from urllib.request import urlopen, Request
from bs4 import BeautifulSoup
import os
import time
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
import random

ORIGINAL_URL = 'https://www.shugiin.go.jp/internet/itdb_gian.nsf/html/gian/honbun/g20705003.htm'
BASE_URL = 'https://www.shugiin.go.jp/internet/itdb_gian.nsf/html/gian/honbun/'
SLEEP_TIME = 0.7

DOC_TYPE = ["houan", "youkou", "syuuseian"]


def fetch_html(url: str) -> str:
    req = Request(url, headers={'User-Agent': 'Mozilla/5.0 (compatible; research-bot/1.0)'})
    with urlopen(req, timeout=15) as res:
        raw_data = res.read()
        return raw_data.decode('cp932', errors='ignore')


def html_to_text(soup, doc_type) -> str:
    if doc_type == "houan" or doc_type == "syuuseian":
        paragraphs = soup.find_all('p')
        text_data = "\n".join([p.get_text(strip=True) for p in paragraphs])
        return text_data
    elif doc_type == "youkou":
        title = soup.find('p').get_text(strip=True)
        paragraphs = soup.select('#mainlayout')
        text_data = "\n".join([p.get_text(strip=True) for p in paragraphs])
        return title + text_data


def clean_text(text: str) -> str:
    text = text.replace('\xa0', ' ')
    lines = text.split('\n')
    no_blank_lines = [line.strip() for line in lines if line.strip()]
    return '\n'.join(no_blank_lines)


def get_honbun_url_list(INPUT_FILE) -> list:
    with open(INPUT_FILE, encoding='utf-8') as f:
        bills_list = json.load(f)
    return [bill.get('content_url') for bill in bills_list]


def extract_bill_links(soup, page_url: str) -> list:
    links = []
    container = soup.find('span', class_='txt03ul')
    if not container:
        return links

    for a_tag in container.find_all('a'):
        href = a_tag.get('href')
        if not href:
            continue
        text = a_tag.get_text(strip=True)
        full_url = urljoin(page_url, href)
        links.append({
            "title": text,
            "url": full_url
        })
    return links


def fetch_one_index(url: str) -> dict | None:
    """1つの目次URLをフェッチしてリンク一覧を返す"""
    if not url:
        return None
    try:
        print(f"[Step1] Processing: {url}")
        html = fetch_html(url)
        soup = BeautifulSoup(html, 'html.parser')
        bill_id = os.path.basename(url).split('.')[0]
        links = extract_bill_links(soup, url)  
        print(f"[Step1] Done: {url} ({len(links)} links)")
        time.sleep(random.uniform(SLEEP_TIME - 0.2, SLEEP_TIME + 0.2))
        return {"bill_id": bill_id, "index_url": url, "links": links}
    except Exception as e:
        print(f"[Step1] Error {url}: {e}")
        return {"bill_id": os.path.basename(url).split('.')[0], "index_url": url, "links": [], "error": str(e)}


def download_all_index_pages(url_list: list, max_workers: int = 4) -> list:
    """★ 修正5: ThreadPoolExecutorを正しく使って並列フェッチ"""
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
    task = {"bill_id": ..., "title": ..., "url": ...}
    """
    bill_id = task["bill_id"]
    url = task["url"]
    title = task["title"]
    try:
        print(f"[Step2] Fetching: [{bill_id}] {url}")
        html = fetch_html(url)
        soup = BeautifulSoup(html, 'html.parser')
        doc_type = next(type for type in DOC_TYPE if type in url)
        text_data = clean_text(html_to_text(soup, doc_type))
        time.sleep(random.uniform(0.3, 0.6))
        return {"bill_id": bill_id, "title": title, "url": url, "content": text_data}
    except Exception as e:
        print(f"[Step2] Error [{bill_id}] {url}: {e}")
        return {"bill_id": bill_id, "title": title, "url": url, "content": "", "error": str(e)}


def get_content(
    INPUT_FILE='./data/bills/bills.json', 
    STEP1_OUTPUT_FILE='./data/content/content_links.json', 
    OUTPUT_FILE='./data/content/content.json'
):
    honbun_url_list = get_honbun_url_list(INPUT_FILE)

    # ──────────────────────────────────────────
    # Step 1: 各目次ページからリンク一覧を収集
    # ──────────────────────────────────────────
    if os.path.exists(STEP1_OUTPUT_FILE):
        print(f"[Step1] {STEP1_OUTPUT_FILE} が存在するのでスキップします。読み込み中...")
        with open(STEP1_OUTPUT_FILE, encoding='utf-8') as f:
            all_bill_links = json.load(f)
    else:
        print("=== Step 1: 目次ページからリンク一覧を並列収集 ===")
        all_bill_links = download_all_index_pages(honbun_url_list, max_workers=4)

        with open(STEP1_OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(all_bill_links, f, ensure_ascii=False, indent=2)
        print(f"[Step1] 完了。{len(all_bill_links)} 件を {STEP1_OUTPUT_FILE} に保存しました。")

    # ──────────────────────────────────────────
    # Step 2: 各リンクの本文を並列フェッチ
    # 法案×書類 をフラットなタスクリストに展開してすべて並列投入
    # ──────────────────────────────────────────
    print("=== Step 2: 各書類の本文を並列フェッチ ===")

    tasks = [
        {"bill_id": item["bill_id"], "title": link["title"], "url": link["url"]}
        for item in all_bill_links
        for link in item.get("links", [])
    ]
    print(f"[Step2] 合計 {len(tasks)} 件の書類をフェッチします")

    fetched = []
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = {executor.submit(fetch_one_document, task): task for task in tasks}
        for future in as_completed(futures):
            result = future.result()
            if result:
                fetched.append(result)

    grouped = {item["bill_id"]: {"bill_id": item["bill_id"], "documents": []} for item in all_bill_links}
    for doc in fetched:
        grouped[doc["bill_id"]]["documents"].append({
            "title": doc["title"],
            "url": doc["url"],
            "content": doc["content"],
            **({"error": doc["error"]} if "error" in doc else {})
        })
    final_results = list(grouped.values())

    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(final_results, f, ensure_ascii=False, indent=2)

    print(f"=== 完了！{len(final_results)} 件を {OUTPUT_FILE} に保存しました。 ===")


if __name__ == "__main__":
    INPUT_FILE = '../../data/bills/bills.json'
    STEP1_OUTPUT_FILE = '../../data/bills/content_links.json'
    OUTPUT_FILE = '../../data/bills/content.json'
    get_content(INPUT_FILE, STEP1_OUTPUT_FILE, OUTPUT_FILE)