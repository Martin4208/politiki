from urllib.request import urlopen
from bs4 import BeautifulSoup
import json
import os
from datetime import datetime
import re

BASE_URL ='https://www.sangiin.go.jp/japanese/joho1/kousei/giin/221/giin.htm'


def kanji_to_int(kanji_str):
    """漢数字や全角数字を半角数字に変換して数値で返す補助関数"""
    # 衆議院のサイトは「令和６年」のように全角数字が混じることが多いため
    trans_table = str.maketrans('０１２３４５６７８９', '0123456789')
    num_str = kanji_str.translate(trans_table)
    return int(num_str)

def convert_wareki_to_seireki(wareki_text):
    """「令和6年10月1日」のような文字列を「20241001」形式に変換する"""
    try:
        # 正規表現で数字を抽出
        match = re.search(r'令和\s*([０-９\d]+)年\s*([０-９\d]+)月\s*([０-９\d]+)日', wareki_text)
        if match:
            year = kanji_to_int(match.group(1))
            month = kanji_to_int(match.group(2))
            day = kanji_to_int(match.group(3))
            
            # 令和1年は2019年
            seireki_year = year + 2018
            return f"{seireki_year}{month:02d}{day:02d}"
    except Exception as e:
        print(f"日付変換エラー: {e}")
    
    # 変換失敗時は実行時の日付を返す
    return datetime.now().strftime("%Y%m%d")


def fetch_html(url: str) -> str:
    try:
        with urlopen(url) as res:
            return res.read().decode('cp932', errors='ignore')
    except Exception as e:
        print(f"Fetch error: {e}")
        return None


def create_url_list(count=10):
    return [f"{BASE_URL}/{i}giin.htm" for i in range(1, count + 1)]


def soup_to_json(soup):
    json_data = []
    
    # the table with the date
    date_table = soup.find_all('table')[0]
    date_text = date_table.find('td').get_text(strip=True).replace('現在', '')
    
    # the table which includes the content
    content_table = None
    for table in soup.find_all('table'):
        if table.find('td', class_='sh1td5'):
            content_table = table
            break
        
    if not content_table:
        return json_data
    
    for row in content_table.find_all('tr'):
        cells = row.find_all('td')
        
        # remove header
        if len(cells) != 5:
            continue
        
        if "氏名" in cells[0].get_text():
            continue
        
        json_data.append({
            "name": cells[0].get_text(strip=True).replace('君', '').replace('\u3000', ' '),
            "furigana": cells[1].get_text(strip=True).replace('\u3000', ' ').replace('\n', ''), 
            "party": cells[2].get_text(strip=True),
            "district": cells[3].get_text(strip=True),
            "num_elections_won": cells[4].get_text(strip=True)
        })
    
    return json_data, date_text


def download_and_process(url_list):
    all_politicians = []
    for url in url_list:
        print(f"Fetching: {url}")
        html = fetch_html(url)
        if not html:
            continue

        soup = BeautifulSoup(html, 'html.parser')
        
        json_data, date_text = soup_to_json(soup)
        all_politicians.extend(json_data)
    
    return all_politicians, date_text


def get_sangiin_politicians():
    url_list = create_url_list()
    all_politicians, date_text = download_and_process(url_list)
    
    formatted_date = convert_wareki_to_seireki(date_text)
    
    output_path = f'../data/politicians_{formatted_date}.json'
    
    final_output = {
        "last_updated_wareki": date_text,
        "last_updated_seireki": formatted_date,
        "count": len(all_politicians),
        "politicians": all_politicians
    }
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(final_output, f, ensure_ascii=False, indent=2)
    
    print(f"=== 完了！ {len(all_politicians)} 件を {output_path} に保存しました。 ===")


if __name__ == "__main__":
    get_sangiin_politicians()