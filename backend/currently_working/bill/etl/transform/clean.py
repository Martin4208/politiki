import json
import re


def clean_data(content):
    if not content:
        return content
    
    header_pattern = r'メインへスキップ.*?衆法\s*(第\d+回国会\s*\d+\s*)?'
    content = re.sub(header_pattern, '', content, flags=re.DOTALL)

    content = content.replace('メインへスキップ', '')
    
    footer_pattern = r"Copyright © Shugiin All Rights Reserved\."
    content = re.sub(footer_pattern, '', content)

    return content.strip()


def clean_content(
    INPUT_FILE='./data/content/content.json', 
    OUTPUT_FILE='./data/content/content_c.json'
):
    
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        json_data = json.load(f)
    
    # Remove duplicates
    for bill in json_data:
        unique_bills = {page['url']: page for page in bill['documents']}
        bill['documents'] = list(unique_bills.values())
        
    # Clean data
    for item in json_data:
        for doc in item.get('documents', []):
            doc['content'] = clean_data(doc.get('content', ''))
    
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(json_data, f, ensure_ascii=False, indent=2)
    
    print("Finished removing duplicates!")

if __name__ == "__main__":
    clean_content(INPUT_FILE = '../../data/content/content.json', OUTPUT_FILE = '../../data/content/content_c.json')
    
    
    