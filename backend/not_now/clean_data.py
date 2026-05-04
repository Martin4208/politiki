import json
import os
import re
from concurrent.futures import ThreadPoolExecutor

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

    # 官僚・行政官
    (r'内閣法制局長官',                    'official_cabinet_legislation'),
    (r'政府特別補佐人',                    'official_special_advisor'),
    (r'政府参考人',                        'official_ref'),

    # 外部有識者
    (r'参考人',                            'expert_witness'),
]


def clean_speech(speech_text: str) -> str:
    if not speech_text:
        return ""
    speech_text = re.sub(r'〔.*?〕', '', speech_text)
    speech_text = speech_text.replace('\r\n', '\n').strip()
    return speech_text


def split_speakerGroup(speakerGroup: str) -> tuple[str, str | None]:
    parts = speakerGroup.split('・', 1)
    if len(parts) == 2:
        return parts[0], parts[1]
    return parts[0], None


def extract_role_and_type(content: str) -> tuple[str | None, str]:
    """
    contentの冒頭ラベル（例: ○梶山国務大臣）から役職名とspeaker_typeを返す。

    Args:
        content (str): 発言テキスト（冒頭に ○姓+役職　の形式を含む）

    Returns:
        tuple[str, str]: (role, speaker_type)
        - role: "国務大臣", "委員長" など。抽出できない場合はNone
        - speaker_type: ROLE_PATTERNSで定義した分類文字列。不明な場合は "unknown"
    """
    match = re.match(r'○(.+?)[\u3000\n]', content)
    if match == None:
        return None, 'unknown'
    role_and_type = match.group(1)
    role_and_type = re.sub(r'（[^）]+）', '', role_and_type)
    
    for pattern, speaker_type in ROLE_PATTERNS:
        if re.search(pattern, role_and_type):
            role = re.sub(r'^.+?(大臣|委員.*|参考人.*|議長.*|理事.*)', r'\1', role_and_type)
            return role, speaker_type
    
    return None, 'unknown'


def normalize_speeches(speech: dict) -> dict:
    """
    1件の発言dictにroleとspeaker_typeフィールドを追加して返す。

    Args:
        speech: cleanedデータの1レコード

    Returns:
        role と speaker_type を追加したdict
    """
    role, speaker_type = extract_role_and_type(speech.get('content', ''))
    
    return {
        **speech,
        'role': role,
        'speaker_type': speaker_type,
    }


def process_file(input_path: str, output_path: str) -> None:
    with open(input_path, 'r', encoding='utf-8') as f:
        speeches = json.load(f)

    refined_data = []

    for s in speeches:
        if s.get('speaker') == "会議録情報":
            continue

        speech_raw = s.get('speech', '')

        if speech_raw.startswith('○議長') or speech_raw.startswith('○副議長'):
            continue

        cleaned_text = clean_speech(speech_raw)
        
        raw_group = s.get('speakerGroup') or ''
        speakerParty, speakerGroup = split_speakerGroup(raw_group)

        normalized = normalize_speeches({
            "date": s.get('date'),
            "nameOfHouse": s.get('nameOfHouse'),
            "nameOfMeeting": s.get('nameOfMeeting'),
            "speechOrder": s.get('speechOrder'),
            "speaker": s.get('speaker'),
            "speakerYomi": s.get('speakerYomi'),
            "speakerParty": speakerParty,
            "speakerGroup": speakerGroup,
            "content": cleaned_text
        })
        
        refined_data.append(normalized)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(refined_data, f, ensure_ascii=False, indent=2)

    print(f"Processed: {input_path}")


def main():
    years = range(2020, 2025)
    max_workers = 3
    
    for year in years:
        print(f"--- {year}年のデータを整理中 ---")

        tasks = []

        for month in range(1, 13):
            dir_path = f'./{year}/raw/data_{month:02}'
            output_dir = f'./{year}/cleaned/data_{month:02}'

            if not os.path.exists(dir_path):
                continue

            os.makedirs(output_dir, exist_ok=True)

            for filename in os.listdir(dir_path):
                if filename.endswith('.json'):
                    input_path = os.path.join(dir_path, filename)
                    output_path = os.path.join(output_dir, filename)
                    tasks.append((input_path, output_path))

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            for input_path, output_path in tasks:
                executor.submit(process_file, input_path, output_path)

        print("\nすべてのクレンジングが完了しました。")


if __name__ == "__main__":
    main()