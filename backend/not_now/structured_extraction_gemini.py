import os
import json
import time
from pathlib import Path
from google import genai
from google.genai.errors import ClientError
from pydantic import BaseModel, Field
from typing import List, Optional, Dict

from politica.backend.not_now.models import Party

# ===== 設定 =====
CHUNK_SIZE = 1000          # 文字数ベース
SLEEP_SECONDS = 2          # レート制限対策
MODEL_NAME = "gemini-3.1-flash-lite-preview"
base_dir = Path("../lib/parties/policies")
ts_files = list(base_dir.rglob("*.ts"))

client = genai.Client(api_key="AIzaSyDo8VHlNXsnKGnh-QhKixiRYHBfx2xBmjk")


def extract_party_policies(party_name: str, party_id: str, raw_text: str) -> Party:
    prompt = f"""
あなたは日本の政党マニフェストを構造化するアナリストです。
以下の政党の政策文書を読み、指定されたJSONスキーマに従って構造化してください。

## 対象政党
- party_id: {party_id}
- party_name: {party_name}

## 政策文書
{raw_text}

## 抽出ルール

### philosophy（思想軸）のスコアリング基準
各軸は -1.0 〜 +1.0 の float で表現する。
文書に記述がない・判断できない場合は null。

**economics（経済政策層）**
- fiscal_stance: 財政スタンスを一言で（例: "積極財政", "財政健全化重視"）
- fiscal_axis: -1=財政緊縮・PB重視 ←→ +1=積極財政・国債増発
- market_intervention_axis: -1=市場重視・規制緩和 ←→ +1=国家介入・規制強化
- redistribution_axis: -1=成長・競争重視 ←→ +1=再分配・格差是正重視

**governance（国家と個人）**
- state_intervention: -1=国家最小限（リバタリアン）←→ +1=国家が積極介入（パターナリズム）
- individual_vs_community: -1=個人の自由最優先 ←→ +1=共同体・伝統を優先

**international（国際政治・国防）**
- security_approach: -1=外交・対話重視 ←→ +1=軍事力・抑止力重視
- alliance_dependency: -1=自主外交・独立路線 ←→ +1=日米同盟・覇権国との緊密同盟重視

**economics_justice（社会正義の哲学）**
- justice_basis: -1=社会全体の効率・総和を最優先（功利主義）←→ +1=最も不遇な人への配慮最優先（ロールズ）
- market_vs_state: -1=市場の自己調節を信頼（新自由主義）←→ +1=国家による再分配・規制を支持

**civilization（文明と環境）**
- growth_vs_sustainability: -1=経済成長・技術革新で課題解決 ←→ +1=脱成長・持続可能性優先
- tech_regulation: -1=技術開発・投資優先、規制最小限 ←→ +1=技術リスクへの規制・予防原則重視

**keywords**: この政党の思想を端的に表すキーワードを3〜6個

### policies（個別政策）のスコアリング基準
- stance: -2〜+2 の int（-2=強く反対/削減, 0=中立/言及なし, +2=強く推進/拡大）
- target_value: 具体的な数値目標があれば（例: 最低賃金1150円 → 1150）
- target_rate: パーセンテージがあれば（例: 消費税5% → 5.0）
- notes: 政策の要点を一言で
- source_text: 根拠となる原文を抜粋（30字以内）

JSON以外は一切出力しないこと。
"""
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_json_schema": Party.model_json_schema(),
        },
    )
    
    return Party.model_validate_json(response.text)



def chunk_text(text: str, size: int):
    return [text[i:i+size] for i in range(0, len(text), size)]


def main():
    # for file_path in ts_files:
    file_path = Path("../lib/parties/policies/hoshu/core_policies.ts")
    raw_text = file_path.read_text(encoding="utf-8")
    
    party = extract_party_policies(
        party_name="日本保守党",
        party_id="hoshu",
        raw_text=raw_text,
    )
    
    out_path = Path("../lib/parties/policies/hoshu/structured.json")
    out_path.write_text(party.model_dump_json(indent=2, exclude_none=True), encoding="utf-8")
    print(f"Finished structuring {file_path}")

if __name__ == "__main__":
    main()
