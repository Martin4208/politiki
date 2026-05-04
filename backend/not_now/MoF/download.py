import requests
import os

BASE_URL = "https://www.mof.go.jp/policy/budget/reference/statistics/"

FILES = {
    "歳入歳出総額-明治初年度以降": "01",
    "歳入科目別決算-昭和57年度以降": "04",
    "歳出所管別決算-明治初年度以降": "06",
    "主要経費別歳出決算額-昭和24年度-昭和59年度": "19a",
    "主要経費別歳出決算額-昭和60年度-令和6年度": "19b",
    "主要経費別歳出当初予算-明治初年度以降": "20"
}

# ---------------------------------
# Download Excel File
# ---------------------------------
def download(name, filename) -> bytes:
    url = BASE_URL + filename + '.xlsx'
    
    print(f"ダウンロード中: {url}")
    
    r = requests.get(url, timeout=60)
    r.raise_for_status()
    
    print(f" -> {len(r.content):,} bytes 取得完了")

    output_dir = "./data"
    os.makedirs(output_dir, exist_ok=True)

    output_path = f"{output_dir}/{filename}-{name}.xlsx"
    with open(output_path, 'wb') as f:   # 'wb' = バイナリ書き込み
        f.write(r.content)

    print(f" -> {output_path} に保存しました")
    return r.content


def main():
    for name, filename in FILES.items():
        download(name, filename)
        
        
if __name__ == "__main__":
    main()