from urllib.error import URLError
from urllib.request import urlopen
from bs4 import BeautifulSoup
import json
import datetime
import re

URL = 'https://www.shugiin.go.jp/internet/itdb_annai.nsf/html/statics/shiryo/kaiki.htm'

wareki = {
    '令和': 2018,
    '平成': 1988,
    '昭和': 1925
}


def fetch_html(url: str) -> str:
    with urlopen(url) as res:
        raw_data = res.read()
        return raw_data.decode('cp932', errors='ignore')


def table_to_json(soup) -> list:
    json_data = []
    
    table = soup.find('table')
    
    rows = table.find_all('tr')[1:]
    
    for row in rows:
        cells = row.find_all('td')
        try:
            diet_session = cells[0].get_text(strip=True)
            diet_session_number = diet_session.split('第')[1].split('回')[0]
            
            convocation_date = cells[1].get_text(strip=True)
            convocation_dt = None
            match_conv = re.search(r'(令和|平成|昭和)\s*(\d+|元)\s*年\s*(\d+)\s*月\s*(\d+)\s*日', convocation_date)
            if match_conv:
                era, y, m, d = match_conv.groups()
                era = era.strip()
                year = wareki[era] + (1 if y == '元' else int(y))
                convocation_dt = datetime.date(year, int(m), int(d))
            
            unique_id = f"{diet_session_number}-session"
            
            diet_ending_date = cells[2].get_text(strip=True) or ""
            diet_ending_dt = None
            match_end = re.search(r'(令和|平成|昭和)\s*(\d+|元)\s*年\s*(\d+)\s*月\s*(\d+)\s*日', diet_ending_date)
            if match_end:
                era, y, m, d = match_end.groups()
                era = era.strip().lstrip('（(')
                year = wareki[era] + (1 if y == '元' else int(y))
                diet_ending_dt = datetime.date(year, int(m), int(d))
                
            d3 = "".join(filter(str.isdigit, cells[3].get_text(strip=True)))
            session_period = int(d3) if d3 else None

            d4 = "".join(filter(str.isdigit, cells[4].get_text(strip=True)))
            planned_session_period = int(d4) if d4 else None

            d5 = "".join(filter(str.isdigit, cells[5].get_text(strip=True)))
            extension = int(d5) if d5 else None
            
            json_data.append({
                "id": unique_id,
                "diet_session": diet_session,
                "diet_session_number": diet_session_number,
                "convocation_date": convocation_dt.isoformat() if convocation_dt else None,
                "diet_ending_date": diet_ending_dt.isoformat() if diet_ending_dt else None,
                "session_period": session_period,
                "planned_session_period": planned_session_period,
                "extension": extension,
            })
            
        except Exception as e:
            print(f"Row skip error: {e}")
            continue
        
    return json_data


def clean_text(text: str) -> str:
    text = text.replace('\xa0', ' ')
    lines = text.split('\n')
    no_blank_lines = [line.strip() for line in lines if line.strip()]
    return '\n'.join(no_blank_lines) 


def download_and_process_urls() -> list:
    json_data = []
    url = URL
    
    try:
        print(f"Processing: {url}")
        html = fetch_html(url)

        soup = BeautifulSoup(html, 'html.parser')
        
        json_data = table_to_json(soup)
        
        print(f"Finished processing url: {url}!")
        
    except URLError as e:
        print(f"URL {url} ダウンロードエラー： {e}")
    except Exception as e:
        print(f"URL {url} 処理エラー： {e}")

    return json_data


def get_diet_session(OUTPUT_FILE='', GITHUB_ACTIONS=False):
    sessions = download_and_process_urls()
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(sessions, f, ensure_ascii=False, indent=2)
    
    print('会期の記録を以下のファイルに保存しました')
    print(OUTPUT_FILE)
    
    if GITHUB_ACTIONS:
        return sessions[0]["diet_session_number"] # latest session


if __name__ == "__main__":
    get_diet_session(OUTPUT_FILE = '../../data/diet_sessions/diet_sessions.json')
