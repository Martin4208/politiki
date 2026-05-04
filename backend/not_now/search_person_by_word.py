import os
import json
import glob
from collections import defaultdict

def main():
    year = 2024
    kenkin_map = defaultdict(int)
    word_to_find = '無農薬'
    
    for month in range(1, 13):
        dir_path = f'./{year}/cleaned/data_{month:02}/*.json'
        files = glob.glob(dir_path)
        
        for file_path in files:
            with open(file_path, 'r', encoding='utf-8') as f:
                speeches = json.load(f)
                
            for s in speeches:
                speaker = s.get('speaker')
                content = s.get('content')
                
                if content and word_to_find in content:
                    kenkin_map[speaker] += 1
                
    # 修正ポイント3: 出現回数が多い順にソート
    sorted_items = sorted(kenkin_map.items(), key=lambda x: x[1], reverse=True)
    
    # 上位10名を表示
    first_10_dict = dict(sorted_items[:10])
    
    print(f"--- {word_to_find}ワード出現回数（上位10名） ---")
    print(first_10_dict)
    
    
if __name__ == "__main__":
    main()