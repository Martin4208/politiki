import requests
import json
import os
from datetime import date, timedelta
from concurrent.futures import ThreadPoolExecutor
import politica.backend.not_now.clean_data as clean_data  # 自作のクレンジング用スクリプト

def fetch_and_save(params, output_path):
    base_url = 'https://kokkai.ndl.go.jp/api/1.0/speech'
    try:
        response = requests.get(base_url, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        data_important = []
        for speech in data.get('speechRecord', []):
            data_important.append({
                "date": speech.get('date'),
                "nameOfHouse": speech.get('nameOfHouse'),
                "nameOfMeeting": speech.get('nameOfMeeting'),
                "speechOrder": speech.get('speechOrder'),
                "speaker": speech.get('speaker'),
                "speakerYomi": speech.get('speakerYomi'),
                "speakerGroup": speech.get('speakerGroup'),
                "speech": speech.get('speech'),
            })
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data_important, f, ensure_ascii=False, indent=2)
        # ログが多すぎると重くなるため、ドット等で進捗を表示するのも手です
    except Exception as e:
        print(f"\nFailed: {output_path} - {e}")

def main():
    years = range(2023, 2025) # 2020年から2024年まで
    max_records = 100
    max_workers = 7
    all_tasks = []

    print(f"=== タスク作成開始 ({years.start} - {years.stop - 1}年) ===")

    for year in years:
        for month in range(1, 13):
            # 保存先を年ごとに分ける
            output_dir = f'./{year}/raw/data_{month:02}'
            os.makedirs(output_dir, exist_ok=True)

            q_from = date(year, month, 1)
            if month == 12:
                q_until = date(year + 1, 1, 1) - timedelta(days=1)
            else:
                q_until = date(year, month + 1, 1) - timedelta(days=1)

            check_params = {
                'from': str(q_from), 'until': str(q_until),
                'maximumRecords': 1, 'recordPacking': 'json'
            }
            
            try:
                res = requests.get('https://kokkai.ndl.go.jp/api/1.0/speech', params=check_params, timeout=10)
                total_hits = res.json().get('numberOfRecords', 0)
                print(f"Planning: {year}/{month:02} -> {total_hits} records")
                
                for start in range(1, total_hits + 1, max_records):
                    params = {
                        'from': str(q_from), 'until': str(q_until),
                        'maximumRecords': max_records, 'startRecord': start,
                        'recordPacking': 'json'
                    }
                    path = f"{output_dir}/start_{start}.json"
                    all_tasks.append((params, path))
            except Exception as e:
                print(f"Error checking {year}/{month}: {e}")

    # 4. 並列実行
    print(f"\n--- 並列ダウンロード開始 (合計タスク数: {len(all_tasks)}) ---")
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # submitの戻り値をリスト化して終了を待機
        futures = [executor.submit(fetch_and_save, p, path) for p, path in all_tasks]
        # 全てのダウンロードが終わるまで待機
        for i, future in enumerate(futures):
            if i % 100 == 0:
                print(f"Progress: {i}/{len(all_tasks)} tasks completed...")

    print("\n--- 全データの取得完了。クレンジング処理に移行します ---")
    
    # 5. クレンジングの実行
    clean_data.main() 

if __name__ == "__main__":
    main()