import json
import os

def add_status(
    INPUT_FILE_1='./data/bills/bills.json', 
    INPUT_FILE_2='./data/content/content_c.json', 
    OUTPUT_FILE='./data/content/content_c_s.json'
):
    
    with open(INPUT_FILE_1, 'r', encoding='utf-8') as f:
        bills_data = json.load(f)

    
    with open(INPUT_FILE_2, 'r', encoding='utf-8') as f:
        content_data = json.load(f)
        

    # bills_database の text_url からbill_idを抽出してstatusをマップ
    # text_url例: "https://...honbun/g20705003.htm" → bill_id = "g20705003"
    status_map = {}
    for bill in bills_data:
        content_url = bill.get('content_url', '')
        if content_url:
            bill_id = os.path.basename(content_url).split('.')[0]
            diet_num = int(bill.get('diet_number', '0'))

            if bill_id not in status_map or diet_num > status_map[bill_id]['diet_number']:
                status_map[bill_id] = {
                    'status': bill.get('status', ''),
                    'diet_number': diet_num
                }
    
    print("=== status_map サンプル ===")
    for k, v in list(status_map.items())[:5]:
        print(f"  key: '{k}' → {v}")

    print("=== content_data bill_id サンプル ===")
    for entry in content_data[:5]:
        print(f"  bill_id: '{entry.get('bill_id')}'")

    updated = 0
    for content in content_data:
        bill_id = content.get('bill_id', '')
        if bill_id in status_map:
            content['status'] = status_map[bill_id]['status']
            updated += 1
        else:
            content['status'] = ''

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(content_data, f, ensure_ascii=False, indent=2)

    print(f"完了。{updated}/{len(content_data)} 件にstatusを追加しました。")


if __name__ == "__main__":
    add_status(INPUT_FILE_1 = '../../data/bills/bills.json', INPUT_FILE_2 = '../../data/content/content_c.json', OUTPUT_FILE = '../../data/content/content_c_s.json')