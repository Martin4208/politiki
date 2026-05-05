from urllib.error import URLError
from urllib.request import urlopen
from bs4 import BeautifulSoup
import time
import json
import zlib
import os

ORIGINAL_URL='https://www.shugiin.go.jp/internet/itdb_gian.nsf/html/gian/kaiji187.htm'
BASE_URL = 'https://www.shugiin.go.jp/internet/itdb_gian.nsf/html/gian'

CATEGORY_MAP = {
    "衆法":     "HAS_CONTENT_COL",
    "閣法":     "HAS_CONTENT_COL",
    "参法":     "HAS_CONTENT_COL",
    "決議":     "HAS_CONTENT_COL",
    "予算":     "DONT_HAVE_CONTENT_COL",
    "条約":     "DONT_HAVE_CONTENT_COL",
    "承認":     "DONT_HAVE_CONTENT_COL",
    "規則":     "DONT_HAVE_CONTENT_COL",
    "規程":     "DONT_HAVE_CONTENT_COL",
    "議決":     "DONT_HAVE_CONTENT_COL",   
    "承諾":     "SHODAKU",
    "決算その他": "KESSAN",
}


def fetch_html(url: str) -> str:
    with urlopen(url) as res:
        raw_data = res.read()
        return raw_data.decode('cp932', errors='ignore')


def parse_row(cells, en_category, category, current_session_number):
    if en_category == "KESSAN":
        # 種類 | 提出回次 | 議案件名 | 審議状況 | 経過情報
        if len(cells) < 5:
            return None
        bill_type = cells[0].get_text(strip=True)
        submitted = int(cells[1].get_text(strip=True))
        title     = f"[{bill_type}] {cells[2].get_text(strip=True)}"
        status    = cells[3].get_text(strip=True)
        p_href    = _extract_href(cells[4].find('a'))
        c_href    = _extract_href(cells[5].find('a'))
        return _build(category, current_session_number, submitted,
                      None, title, status,
                      _to_url(p_href), "", _to_bill_code(c_href))

    elif en_category == "SHODAKU":
        # 提出回次 | 議案件名 | 審議状況 | 経過情報  (番号列なし)
        if len(cells) < 4:
            return None
        submitted = int(cells[0].get_text(strip=True))
        title     = cells[1].get_text(strip=True)
        status    = cells[2].get_text(strip=True)
        p_href    = _extract_href(cells[3].find('a'))
        c_href    = _extract_href(cells[5].find('a'))
        return _build(category, current_session_number, submitted,
                      None, title, status,
                      _to_url(p_href), "", _to_bill_code(c_href))

    elif en_category == "DONT_HAVE_CONTENT_COL":
        # 提出回次 | 番号 | 議案件名 | 審議状況 | 経過情報  (本文列なし)
        if len(cells) < 5:
            return None
        submitted = int(cells[0].get_text(strip=True))
        bill_num  = cells[1].get_text(strip=True)
        title     = cells[2].get_text(strip=True)
        status    = cells[3].get_text(strip=True)
        p_href    = _extract_href(cells[4].find('a'))
        c_href    = _extract_href(cells[5].find('a'))
        return _build(category, current_session_number, submitted,
                      bill_num, title, status,
                      _to_url(p_href), "", _to_bill_code(c_href))

    else:  # HAS_CONTENT_COL
        # 提出回次 | 番号 | 議案件名 | 審議状況 | 経過情報 | 本文情報
        if len(cells) < 6:
            return None
        submitted = int(cells[0].get_text(strip=True))
        bill_num  = cells[1].get_text(strip=True)
        title     = cells[2].get_text(strip=True)
        status    = cells[3].get_text(strip=True)
        p_href    = _extract_href(cells[4].find('a'))
        c_href    = _extract_href(cells[5].find('a'))
        return _build(category, current_session_number, submitted,
                      bill_num, title, status,
                      _to_url(p_href), _to_url(c_href), _to_bill_code(c_href))
        
        
def _build(category, current_session, submitted, bill_num_raw, title, status, p_url, c_url, bill_code):
    """bill_num の正規化と辞書組み立て"""
    if bill_num_raw is None or not str(bill_num_raw).strip().isdigit():
        seed = p_url if p_url else f"{title}_{status}"
        bill_num = -(zlib.adler32(seed.encode()) & 0x7fffffff)
    else:
        bill_num = int(bill_num_raw)

    return {
        "category": category,
        "current_session_number": current_session,
        "submitted_session_number": submitted,
        "bill_number": bill_num,
        "title": title,
        "status": status,
        "progress_url": p_url,
        "content_url": c_url,
        "bill_code": bill_code
    }
    
def _extract_href(a_tag) -> str:
    """<a> タグから href を取得。なければ空文字"""
    if not a_tag:
        return ""
    href = a_tag.get('href', '')
    return href[1:] if href.startswith('.') else href   # './keika/...' → 'keika/...'

def _to_bill_code(progress_href: str) -> str:
    """progress_href から bill_code を取得。honbun/ を含まない場合は空文字"""
    if 'honbun/' not in progress_href:
        return ""
    return progress_href.split('honbun/')[1].split('.htm')[0]

def _to_url(href: str) -> str:
    return (BASE_URL + href) if href else ""
    

def table_to_json(soup) -> list:
    json_data = []

    cur_s = soup.find('h2').get_text(strip=True)
    current_session_number = int(cur_s.split('第')[1].split('回')[0])

    for table in soup.find_all('table'):
        caption = table.find('caption')
        category = caption.get_text(strip=True).replace('の一覧', '') if caption else "不明"
        en_category = CATEGORY_MAP.get(category, "HAS_CONTENT_COL")

        for row in table.find_all('tr'):
            cells = row.find_all('td')
            if not cells:
                continue
            try:
                record = parse_row(cells, en_category, category, current_session_number)
                if record:
                    json_data.append(record)
            except Exception as e:
                cell_texts = [c.get_text(strip=True) for c in cells]
                print(f"[SKIP] {type(e).__name__}: {e}")
                print(f"  category={category}, セル数={len(cells)}")
                print(f"  セル内容={cell_texts}")
                print()

    return json_data


def download_from_urls(url_list: list) -> tuple:
    all_bills = []
    for url in url_list:
        try:
            print(f"Processing: {url}")
            html = fetch_html(url)

            soup = BeautifulSoup(html, 'html.parser')
            
            json_data = table_to_json(soup)
            
            all_bills.extend(json_data)
            
            print(f"Finished processing url: {url}!")
            print("Wait 0.5 second to not disrupt server")
            time.sleep(0.5)
            
        except URLError as e:
            print(f"URL {url} ダウンロードエラー： {e}")
        except Exception as e:
            print(f"URL {url} 処理エラー： {e}")
    
    return all_bills


def get_bills(START, END=None, OUTPUT_FILE='./data/bills/bills.json'):
    if END is None:
        END = START
    
    if os.path.exists(OUTPUT_FILE):
        print(f"{OUTPUT_FILE} exists!")
        print("Moving to the next step!\n\n")
    else:
        url_list = [f"{BASE_URL}/kaiji{diet}.htm" for diet in range(START, END + 1)]
        all_bills = download_from_urls(url_list)
        
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(all_bills, f, ensure_ascii=False, indent=2)

        print(f"=== 完了！{len(all_bills)} 件を {OUTPUT_FILE} に保存しました。 ===")

if __name__ == "__main__":
    OUTPUT_FILE = '../../data/bills/bills.json'
    get_bills(START = 142, END = 221, OUTPUT_FILE=OUTPUT_FILE)
