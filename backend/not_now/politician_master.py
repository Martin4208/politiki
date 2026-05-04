import json 
import re
import os
from collections import defaultdict
from datetime import timedelta

ROLE_PATTERNS: list[tuple[str, str]] = [
    # 行政府
    (r'内閣総理大臣|総理大臣',              'executive_pm'),
    (r'国務大臣|.+大臣',                   'executive_minister'),
    (r'副大臣',                            'executive_vice_minister'),
    (r'大臣政務官',                        'executive_parliamentary_secretary'),

    # 議長・副議長
    (r'衆議院議長|参議院議長',             'speaker_of_house'),
    (r'副議長',                            'deputy_speaker'),

    # 立法府
    (r'委員長',                            'legislator_chair'),
    (r'理事',                              'legislator_steering'),
    (r'委員$',                             'legislator_member'),
]

VALID_SPEAKER_TYPES = {
    'executive_pm',
    'executive_minister',
    'executive_vice_minister',
    'executive_parliamentary_secretary',
    'speaker_of_house',
    'deputy_speaker',
    'legislator_chair',
    'legislator_steering',
    'legislator_member'
}

all_records = []

def build_masters(records):
    politicians = defaultdict(list)
    
    for r in records:
        if r.get('speaker_type') in VALID_SPEAKER_TYPES:
            politicians[r.get('speaker')].append(r)
            
    masters = []
    for i, name in enumerate(sorted(politicians.keys())):
        record_list = politicians[name]
        sorted_record_list = sorted(record_list, key=lambda r: r['date'])
        
        party_history = []
        prev_party = None
        
        for r in sorted_record_list:
            current_party = r.get('speakerParty')
            if current_party != prev_party:
                if party_history:
                    party_history[-1]['to'] = r.get('date')

                party_history.append({
                    "party": current_party,
                    "from": r.get('date'),
                    "to": None,
                })

                prev_party = current_party

        masters.append({
            "id": i,
            "name": name,
            "yomi": next((r['speakerYomi'] for r in sorted_record_list if r.get('speakerYomi')), None),
            "party_history": party_history,
        })

    output_dir = f'./{years[0]}-{years[-1]}/masters'
    os.makedirs(output_dir, exist_ok=True)
    output_path = f'./{years[0]}-{years[-1]}/masters/politicians.json'
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(masters, f, indent=4, ensure_ascii=False)

def process_file(input_path):
    with open(input_path, 'r', encoding='utf-8') as f:
        records = json.load(f)
    all_records.extend(records)


def main():
    for year in years:
        print(f"--- {year}年の政治家マスタ作成中 ---")

        tasks = []

        for month in range(1, 13):
            dir_path = f'./{year}/cleaned/data_{month:02}'
            
            if not os.path.exists(dir_path):
                continue
            
            for filename in os.listdir(dir_path):
                if filename.endswith('.json'):
                    input_path = os.path.join(dir_path, filename)
                    tasks.append(input_path)

        for input_path in tasks:
            process_file(input_path)

    build_masters(all_records)
    print("\nマスタファイルが作成されました")


if __name__ == "__main__":
    years = range(2020, 2025)
    
    main()