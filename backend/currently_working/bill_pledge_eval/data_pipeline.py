from __future__ import annotations

import json
import logging
import sys
import time
import threading
from  threading import Semaphore
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed
from enum import Enum
from typing import Dict, List, Optional, Set
import os
from dotenv import load_dotenv
import hashlib
from psycopg2.pool import SimpleConnectionPool

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

load_dotenv()

# -- Config --
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL が .env に設定されていません")

GEMINI_API_KEY    = os.getenv("GEMINI_API_KEY")
GEMINI_CHAT_MODEL = "gemini-2.5-flash-lite"
GEMINI_CHAT_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"{GEMINI_CHAT_MODEL}:generateContent?key={GEMINI_API_KEY}"
)

SIMILARITY_THRESHOLD = 0.50
TOP_K = 5
LLM_RETRY_MAX = 8
MAX_WORKERS = 4   # 並列数（Gemini APIレート制限対策）
LLM_INTERVAL = 4  # リクエスト間の最低間隔（秒）
LLM_MAX_CONCURRENT  = 3 # 同時リクエスト数

llm_semaphore = Semaphore(LLM_MAX_CONCURRENT) 
pool = SimpleConnectionPool(
        minconn=1, 
        maxconn=5, 
        dsn=DATABASE_URL
    )

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Enums
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class FinalStatus(str, Enum):
    ACHIEVED    = "achieved"
    PARTIAL     = "partial"
    IN_PROGRESS = "in_progress"
    REGRESSIVE  = "regressive"
    UNSTARTED   = "unstarted"


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# bill_status 判定ヘルパー
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def is_enacted(status: str) -> bool:
    return status == "成立"

def is_deliberating(status: str) -> bool:
    return "審議中" in status or status == "本院議了"



# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Prompt
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMBINED_SYSTEM_PROMPT = """あなたは日本の政策分析の専門家です。
与えられた「公約」に対して、複数の「法案候補」それぞれについて以下の評価を行います。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【ステップ0：公約の要素分解と重みづけ】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

公約を具体的な政策要素に分解し、各要素に重みを付与する。

■ 検証不能要素とは：
法案テキストの有無だけでは達成・未達を判断できない要素。以下に該当するものは必ず検証不能とする：
  - 効果・成果・アウトカムに関する記述（例：「予見可能性を高める」「経済成長を実現する」「安心できる社会」）
  - 運用・執行の質に関する記述（例：「強力に推進する」「徹底する」「加速する」）
  - 主観的・定性的な状態の実現（例：「笑顔あふれる」「持続可能な」「世界一の」）
  - 数値目標のない方向性のみの記述（例：「抜本的に見直す」「大幅に拡充する」）

■ 検証可能要素とは：
法案テキストに制度・措置・数値が明記されているか否かで判断できる要素。以下に該当するもの：
  - 具体的な制度の創設・廃止（例：「インボイス制度を廃止」「給付付き税額控除を創設」）
  - 具体的な数値目標（例：「消費税率を5%に」「最低賃金1500円」）
  - 具体的な法改正・予算措置（例：「複数年度の予算措置」「財源確保の枠組みの検討」）
  - 具体的な対象の拡大・縮小（例：「対象を全世帯に拡大」）
  
重みの基準:
    core（重み3）: 公約の主語・目的そのもの。これなしでは公約を達成したと言えない。
    major（重み2）: 公約に明記された具体的手段・数値目標。
    minor（重み1）: 付随的な条件・補足的な施策。

制約:
    - core は公約1つにつき必ず1つ、最大2つまで。
    - 要素の総数は2〜5個に収める（粒度を統一するため）。
    - 検証不能要素は重みづけの対象外。

例：
    公約「消費税を5%に減税し、インボイス制度を廃止する」
    → 要素1「消費税率の引き下げ」→ core（重み3）、検証可能
    → 要素2「税率5%の実現」→ major（重み2）、検証可能
    → 要素3「インボイス制度の廃止」→ major（重み2）、検証可能

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【ステップ1：関連性判定】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
各法案候補について、公約との関連性を判定する。
- トピックが似ているだけでは「関連あり」としない
- 法案が公約の「検証可能な要素」の少なくとも1つに対して具体的な効果をもたらすか否かで判断する
- 「推測」や「意図の読み取り」は行わない。法案テキストに明記された事実のみで判定する
 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【ステップ2：要素ごとの達成度評価（関連ありの法案のみ）】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
検証可能な各要素のみについて、法案がどの程度達成しているかを以下の4段階で評価する。
検証不能要素は評価対象外であり、この段階では一切扱わない。

  "achieved"   : 法案が当該要素を直接的に実現している（制度創設、数値の明記等）
  "partial"    : 方向性は合うが、範囲・水準・手段が公約の要求に足りていない
  "mentioned"  : 附則の検討規定・期限延長・予算継続のみで実質的な措置がない
  "not_covered": 法案に当該要素に関する記述がない

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【ステップ3：スコア算出（加重平均）】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
検証可能要素のみを対象とする。検証不能要素はΣに含めない。

各要素の得点:
    "achieved"      = 100点  （法案が要素を完全に実現）
    "mostly"        = 70点   （要求の7割以上を満たす。例: 5%目標に対し8%）
    "partial"       = 40点   （方向性は合うが半分以下。例: 5%目標に対し軽減税率のみ）
    "mentioned"     = 15点   （検討規定・附則のみ）
    "not_covered"   = 0点    （記述なし）

alignment_score =Σ(検証可能要素の得点 × 重み) / Σ(検証可能要素の重み)

例：上記の公約の場合
  検証可能要素: 「複数年度予算」achieved(100) × 3 + 「財源確保」achieved(100) × 2
  検証不能要素: 「予見可能性を高める」→ スコアに含めない
  → (100×3 + 100×2) / (3+2) = 500/5 = 100点
  
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【ステップ4：方向性チェック（補正）】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
法案が公約の方向性と逆行している要素がある場合：
- 当該要素の得点を -50点 とする（0点ではなくマイナス）
- impact_typeを "negative" とする
- alignment_scoreの下限は0とする（マイナスにはしない）
 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【ステップ5：impact_typeの決定】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
alignment_scoreに基づいて機械的に決定する。
 
  score >= 60 かつ 逆行要素なし → "positive"
  score 30〜59                  → "partial"
  score 1〜29                   → "minimal"
  score = 0                     → "neutral"
  逆行要素あり                  → "negative"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【ステップ6：複数法案の統合（final_score算出）】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
各検証可能要素について、全法案の中で最も高い評価を採用する。

例：
  要素1: 法案Aで achieved、法案Bで not_covered → achieved を採用
  要素2: 法案Aで not_covered、法案Bで partial → partial を採用

final_score = 統合後の加重平均
 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【絶対ルール】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 法案テキストに明記されている事実のみに基づく。推測・補完・善意の解釈は禁止。
2. 「〜に繋がる可能性がある」「〜に寄与しうる」という間接的な効果は評価に含めない。
3. 公約の要素Aに対応する法案の記述がなければ、その要素は "not_covered" とする。曖昧に "partial" にしない。
4. 検証不能要素は achieved_elements にも missing_elements にも含めない。別枠（unverifiable_elements）で出力する。
5. 公約全体が効果・アウトカム・方向性のみで構成され、検証可能な要素が1つもない場合は、verifiable_elementsを空にし、alignment_scoreを null とする。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【出力形式】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
必ず以下のJSON配列のみを返してください。前置き・後書き・コードブロック記号は不要です。
関連なしの法案は配列に含めないでください。
関連ある法案が0件の場合は空配列 [] を返してください。
 
[
  {
    "bill_id": "法案ID",
    "bill_title": "法案名",
    "relevance": "related",
    "impact_type": "positive | partial | minimal | neutral | negative",
    "status": "achieved | in_progress | minimal_progress | not_started",
    "alignment_score": 0〜100の整数,
    "verifiable_elements": [
      {
        "element": "要素の説明",
        "degree": "achieved | partial | mentioned | not_covered",
        "evidence": "法案テキストに基づく根拠（1〜2文）"
      }
    ],
    "unverifiable_elements": [
      "法案では検証できない要素の説明"
    ],
    "summary": "評価の要約（3文以内。スコアの算出根拠を含める）"
  }
]"""



# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 選挙情報の取得
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def resolve_election(cur, election_id: int, party_id: int) -> Dict:
    """election_id + party_id から administration_id, min_session を取得"""
    cur.execute(
        """
        SELECT
            ep.party_id,
            ep.administration_id,
            ds.session_number,
            e.label
        FROM election_parties ep
        JOIN elections e       ON e.id = ep.election_id
        JOIN diet_sessions ds  ON ds.id = e.session_id
        WHERE ep.election_id = %s
          AND ep.party_id = %s
        """,
        (election_id, party_id),
    )
    row = cur.fetchone()
    if not row:
        raise RuntimeError(
            f"election_id={election_id}, party_id={party_id} に該当するデータがありません。"
            f" election_parties を確認してください。"
        )
    return {
        "party_id":          row[0],
        "administration_id": row[1],   # 野党の場合 None
        "min_session":       row[2],
        "election_label":    row[3],
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Pipeline
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class DataPipeline:
    def __init__(
        self,
        party_id: int,
        administration_id: int | None,
        min_session: int,
        max_session: int | None = None,
        force: bool = False,
        election_id: int | None = None,
    ):
        self.party_id = party_id
        self.administration_id = administration_id  # None = 野党（party_idで全公約取得）
        self.min_session = min_session
        self.max_session = max_session
        self.force = force
        # 処理済みカウンター
        self._done_count = 0
        self._total_count = 0
        self._count_lock = threading.Lock()
        # LLM レート制限用
        self._llm_lock = threading.Lock()
        self._last_llm_call = 0.0
        self._conn = None
        self._cache_lock = threading.Lock()
        self._local_cache = {}
        self.election_id = election_id

    # ─────────────────────────────────────────────────────────
    # DB helper
    # ─────────────────────────────────────────────────────────
    def _get_conn(self):
        return pool.getconn()
    
    def _release_conn(self, conn):
        if conn:
            pool.putconn(conn)

    @staticmethod
    def get_completed_pledge_ids(cur, party_id: int, administration_id: int | None) -> Set[int]:
        """この政党（・政権）の処理済み pledge_id を取得"""
        if administration_id is not None:
            cur.execute(
                "SELECT pledge_id FROM pledge_tracker WHERE party_id = %s AND administration_id = %s",
                (party_id, administration_id),
            )
        else:
            cur.execute(
                "SELECT pledge_id FROM pledge_tracker WHERE party_id = %s",
                (party_id,),
            )
        return {row[0] for row in cur.fetchall()}

    def fetch_pledges(self, cur) -> List[Dict]:
        """公約を取得する。
        - administration_id あり（与党）→ その政権の公約のみ
        - administration_id なし（野党）→ party_id の全公約
        """
        if self.administration_id is not None:
            cur.execute(
                """
                SELECT p.id, p.content, p.content_vector, p.category,
                    p.administration_id,
                    p.party_id
                FROM pledges p
                WHERE p.party_id = %s
                AND p.administration_id = %s
                """,
                (self.party_id, self.administration_id),
            )
        else:
            cur.execute(
                """
                SELECT p.id, p.content, p.content_vector, p.category,
                    p.administration_id,
                    p.party_id
                FROM pledges p
                WHERE p.party_id = %s
                AND p.election_id = %s
                """,
                (self.party_id, self.election_id),
            )
        return [
            {
                "pledge_id": row[0],
                "pledge_text": row[1],
                "pledge_vector": row[2],
                "category": row[3],
                "administration_id": row[4],
                "party_id": row[5],
            }
            for row in cur.fetchall()
        ]
    
    
    def _cache_key(self, pledge_text, bills):
        bill_ids = sorted(b["bill_id"] for b in bills)
        raw = pledge_text + "|" + "|".join(bill_ids)
        return hashlib.md5(raw.encode()).hexdigest()
    
    def _get_cache(self, key):
        with self._cache_lock:
            return self._local_cache.get(key)

    def _set_cache(self, key, value):
        with self._cache_lock:
            self._local_cache[key] = value

    # ─────────────────────────────────────────────────────────
    # Step 2: コサイン類似度検索（閣法/衆法・参法フィルタ付き）
    # ─────────────────────────────────────────────────────────
    def search_similar_bills(
        self,
        cur,
        pledge_vector,
        party_id: int,
        limit: int = TOP_K,
    ) -> List[Dict]:
        cur.execute(
            """
            SELECT
                bc.id           AS bill_content_id,
                bc.bill_id,
                bc.bill_text,
                bc.outline_text,
                b.title         AS bill_title,
                b.status        AS bill_status,
                1 - (COALESCE(bc.outline_vector, bc.bill_vector) <=> %s::vector) AS similarity
            FROM bill_content bc
            JOIN bills b ON b.bill_code = bc.bill_id
            LEFT JOIN bill_progress bp ON bp.bill_id = b.id
            WHERE b.submitted_session_number >= %s
            AND (%s IS NULL OR b.submitted_session_number <= %s)
            AND COALESCE(bc.outline_vector, bc.bill_vector) IS NOT NULL
            AND 1 - (COALESCE(bc.outline_vector, bc.bill_vector) <=> %s::vector) >= %s
            AND (
                CASE
                    WHEN %s IS TRUE THEN
                        b.category = '閣法'
                        OR (
                            b.category IN ('衆法', '参法')
                            AND bp.submitter_faction ILIKE '%%' || (
                                SELECT name FROM parties WHERE id = %s
                            ) || '%%'
                        )
                    ELSE
                        b.category IN ('衆法', '参法')
                        AND bp.submitter_faction ILIKE '%%' || (
                            SELECT name FROM parties WHERE id = %s
                        ) || '%%'
                END
            )
            ORDER BY COALESCE(bc.outline_vector, bc.bill_vector) <=> %s::vector
            LIMIT %s
            """,
            (
                pledge_vector,
                self.min_session,
                self.max_session, self.max_session,
                pledge_vector, SIMILARITY_THRESHOLD,
                self.administration_id is not None,
                party_id,
                party_id,
                pledge_vector,
                limit,
            ),
        )
        cols = [desc[0] for desc in cur.description]
        return [dict(zip(cols, row)) for row in cur.fetchall()]


    # ─────────────────────────────────────────────────────────
    # LLM 呼び出し（スレッドセーフ、レート制限付き）
    # ─────────────────────────────────────────────────────────
    def _call_llm(self, system_prompt: str, user_prompt: str) -> Optional[str]:
        payload = json.dumps({
            "system_instruction": {"parts": [{"text": system_prompt}]},
            "contents":           [{"parts": [{"text": user_prompt}]}],
            "generationConfig": {
                "temperature": 0,
                "responseMimeType": "application/json",
            },
        }).encode("utf-8")

        for attempt in range(1, LLM_RETRY_MAX + 1):
            with llm_semaphore:
                try:
                    req = urllib.request.Request(
                        GEMINI_CHAT_URL,
                        data=payload,
                        headers={"Content-Type": "application/json"},
                        method="POST",
                    )
                    with urllib.request.urlopen(req) as res:
                        data = json.loads(res.read())
                    
                    return data["candidates"][0]["content"]["parts"][0]["text"]
                
                except urllib.error.HTTPError as e:
                    body = e.read().decode("utf-8", errors="replace")
                    
                    if e.code == 400:
                        logger.error(
                            f"LLM HTTP 400 (リトライ不可): {body[:300]}"
                        )
                        return None
                    elif e.code in (429, 503):
                        wait = min(2 ** attempt, 60)
                        logger.warning(f"LLM {e.code} → {wait}s retry")
                        time.sleep(wait)
                        continue
                    else:
                        logger.warning(
                            f"LLM HTTP {e.code} (attempt {attempt}/{LLM_RETRY_MAX})"
                            f" body={body[:300]}"
                        )
                        if attempt == LLM_RETRY_MAX:
                            logger.error(
                                f"LLM failed after {LLM_RETRY_MAX} attempts"
                                f" (last HTTP {e.code})"
                            )
                            return None
                        time.sleep(2 * attempt)
                except Exception as e:
                    logger.warning(
                        f"LLM error: {e} (attempt {attempt}/{LLM_RETRY_MAX})"
                    )
                    if attempt == LLM_RETRY_MAX:
                        logger.error(
                            f"LLM failed after {LLM_RETRY_MAX} attempts: {e}"
                        )
                        return None
                    time.sleep(5)
        return None

    # ─────────────────────────────────────────────────────────
    # Step 3: LLM 1回で評価
    # ─────────────────────────────────────────────────────────
    def evaluate_pledge(
        self,
        pledge: Dict,
        bills: List[Dict],
    ) -> List[Dict]:
        key = self._cache_key(pledge["pledge_text"], bills)
        
        cached = self._get_cache(key)
        if cached:
            return cached
        
        bills_section = ""
        for i, bill in enumerate(bills, 1):
            bills_section += f"""
### 法案候補 {i}（bill_id: {bill['bill_id']}）
- 法案名: {bill.get('bill_title', '') or ''}
- ステータス: {bill.get('bill_status', '') or ''}
- 概要: {bill.get('outline_text', '') or ''}
- 法案テキスト（抜粋）: {(bill.get('bill_text', '') or '')[:2000]}
"""

        user_prompt = f"""## 公約
{pledge['pledge_text']}

## 法案候補一覧
{bills_section}

---
関連ありと判定した法案のみ、以下のJSON配列で出力してください。
関連なしの法案は含めないでください。関連ある法案が0件なら [] を返してください。

[
  {{
    "bill_id": "法案のbill_id文字列",
    "relevance_reason": "関連ありと判定した理由（50字以内）",
    "alignment_score": 0から100の整数,
    "impact_type": "positive" または "partial" または "minimal" または "negative" または "neutral",
    "achieved_elements": ["公約のうち法案がカバーしている要素"],
    "missing_elements": ["公約に含まれるが法案にない要素"],
    "reasoning": "200字以内で記述"
  }}
]"""

        raw = self._call_llm(COMBINED_SYSTEM_PROMPT, user_prompt)

        if raw is None:
            return [
                {
                    "pledge_id":        pledge["pledge_id"],
                    "pledge_text":      pledge["pledge_text"],
                    "category":         pledge.get("category", ""),
                    "party_id":         pledge.get("party_id"),
                    "administration_id": pledge.get("administration_id"),
                    "bill_id":          bill["bill_id"],
                    "bill_status":      bill.get("bill_status", ""),
                    "cosine_similarity": bill.get("similarity", 0),
                    "alignment_score":  None,
                    "impact_type":      None,
                    "achieved_elements": [],
                    "missing_elements": [],
                    "reasoning":        "",
                    "confidence":       "low",
                    "flag_for_review":  True,
                }
                for bill in bills
            ]

        try:
            evaluations = json.loads(raw)
        except json.JSONDecodeError:
            logger.warning("LLM応答のJSONパース失敗")
            return []

        if not isinstance(evaluations, list):
            logger.warning("LLM応答がリストではない")
            return []

        bills_by_id = {b["bill_id"]: b for b in bills}
        results = []
        for ev in evaluations:
            bid = ev.get("bill_id", "")
            bill = bills_by_id.get(bid, {})

            score = ev.get("alignment_score")
            impact = ev.get("impact_type")
            reasoning = ev.get("summary", "") or ev.get("reasoning", "")
            flag = False
            
            verifiable = ev.get("verifiable_elements", [])

            achieved = [
                e.get("element")
                for e in verifiable
                if e.get("degree") in ("achieved", "mostly", "partial")
            ] or ev.get("achieved_elements", [])

            missing = [
                e.get("element")
                for e in verifiable
                if e.get("degree") == "not_covered"
            ] or ev.get("missing_elements", [])

            unverifiable = ev.get("unverifiable_elements", [])

            if reasoning and len(reasoning) < 30:
                flag = True
            if impact == "negative" and score is not None and score > 40:
                flag = True
            if impact == "minimal" and score is not None and score > 50:
                flag = True

            results.append({
                "pledge_id":        pledge["pledge_id"],
                "pledge_text":      pledge["pledge_text"],
                "category":         pledge.get("category", ""),
                "party_id":         pledge.get("party_id"),
                "administration_id": pledge.get("administration_id"),
                "bill_id":          bid,
                "bill_status":      bill.get("bill_status", ""),
                "cosine_similarity": bill.get("similarity", 0),
                "alignment_score":  score,
                "impact_type":      impact,
                "achieved_elements": achieved,
                "missing_elements":  missing,
                "unverifiable_elements": unverifiable,
                "reasoning":        reasoning,
                "relevance_reason": ev.get("relevance_reason", ""),
                "confidence":       "high" if not flag else "low",
                "flag_for_review":  flag,
            })

        self._set_cache(key, results)
        return results

    # ─────────────────────────────────────────────────────────
    # Step 4: ステータス決定
    # ─────────────────────────────────────────────────────────
    @staticmethod
    def is_enacted(status: str) -> bool:
        return status == "成立"

    @staticmethod
    def is_active(status: str) -> bool:
        """審議中・回付案など、まだ生きている法案か"""
        if not status:
            return False
        return (
            "審議中" in status
            or status == "参議院回付案（同意）"
        )
    
    
    @staticmethod
    def is_dead(status: str) -> bool:
        """撤回・廃案など、もう進まない法案か"""
        return status in ("撤回", "廃案", "否決", "本院議了", "未了")

    
    @staticmethod
    def determine_status(items: List[Dict]) -> Dict:
        if not items:
            return None
    
        pledge = items[0]
    
        for it in items:
            if (it.get("impact_type") == "negative"
                    and (it.get("alignment_score") or 0) >= 70):
                it["alignment_score"] = 30
                it["flag_for_review"] = True
    
        meaningful = [it for it in items if (it.get("alignment_score") or 0) > 0]
    
        if not meaningful:
            # 全法案スコア0 → 未着手
            best = max(items, key=lambda x: x.get("alignment_score") or 0)
            score = 0
            final = FinalStatus.UNSTARTED
        else:
            best = max(meaningful, key=lambda x: x.get("alignment_score") or 0)
            score = best.get("alignment_score") or 0
            
            bill_status = best.get("bill_status", "").strip()
    
            has_negative_enacted = any(
                it.get("impact_type") == "negative"
                and DataPipeline.is_enacted(it.get("bill_status", ""))
                for it in meaningful
            )
    
            if has_negative_enacted:
                final = FinalStatus.REGRESSIVE
            elif DataPipeline.is_enacted(bill_status):
                final = (FinalStatus.ACHIEVED if score >= 60    
                        else FinalStatus.PARTIAL)
            elif DataPipeline.is_active(bill_status):                        
                final = FinalStatus.IN_PROGRESS
            elif DataPipeline.is_dead(bill_status):                          
                final = FinalStatus.UNSTARTED
            else:
                final = FinalStatus.IN_PROGRESS

        # review_reasons（変更なし）
        review_reasons = []
        for it in items:
            if it.get("flag_for_review"):
                review_reasons.append(f"bill_id={it['bill_id']}")
        if best.get("reasoning") and len(best["reasoning"]) < 50:
            review_reasons.append("reasoning短すぎ")

        return {
            "pledge_id":             pledge["pledge_id"],
            "pledge_text":           pledge["pledge_text"],
            "category":              pledge.get("category", ""),
            "party_id":              pledge.get("party_id"),
            "administration_id":     pledge.get("administration_id"),
            "final_status":          final.value,
            "best_score":            score,
            "best_bill_id":          best.get("bill_id"),
            "all_bill_ids":          [it["bill_id"] for it in meaningful] if meaningful else [],
            "achieved_elements":     best.get("achieved_elements", []),
            "missing_elements":      best.get("missing_elements", []),
            "unverifiable_elements": best.get("unverifiable_elements", []), 
            "reasoning":             best.get("reasoning", ""),
            "needs_review":          bool(review_reasons),
            "review_reason":         ("; ".join(review_reasons) if review_reasons else None),
        }


    # ─────────────────────────────────────────────────────────
    # Step 5: DB 保存
    # ─────────────────────────────────────────────────────────
    @staticmethod
    def save_one_to_tracker(conn, result: Dict) -> None:
        achieved = result.get("achieved_elements", [])
        missing = result.get("missing_elements", [])
        if not isinstance(achieved, list):
            achieved = []
        if not isinstance(missing, list):
            missing = []
        unverifiable = result.get("unverifiable_elements", [])
        if not isinstance(unverifiable, list):
            unverifiable = []

        row = (
            int(result["pledge_id"]),
            result.get("pledge_text", ""),
            result.get("party_id"),
            result.get("administration_id"),
            result.get("category", ""),
            result["final_status"],
            result.get("best_score") or 0,
            result.get("best_bill_id"),
            json.dumps(result.get("all_bill_ids", []), ensure_ascii=False),
            json.dumps(achieved, ensure_ascii=False),
            json.dumps(missing, ensure_ascii=False),
            json.dumps(unverifiable, ensure_ascii=False),
            result.get("reasoning", ""),
            result.get("needs_review", False),
            result.get("review_reason"),
            json.dumps(result.get("sources", []), ensure_ascii=False),
        )

        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO pledge_tracker (
                        pledge_id, pledge_text, party_id,
                        administration_id, category,
                        final_status, best_score, best_bill_id,
                        all_bill_ids, achieved_elements, missing_elements,
                        unverifiable_elements,
                        reasoning, needs_review, review_reason,
                        sources, updated_at
                    ) VALUES (
                        %s, %s, %s,
                        %s, %s,
                        %s, %s, %s,
                        %s::jsonb, %s::jsonb, %s::jsonb,
                        %s::jsonb,
                        %s, %s, %s,
                        %s::jsonb, NOW()
                    )
                    ON CONFLICT (pledge_id) DO UPDATE SET
                        pledge_text       = EXCLUDED.pledge_text,
                        party_id          = EXCLUDED.party_id,
                        administration_id = EXCLUDED.administration_id,
                        category          = EXCLUDED.category,
                        final_status      = EXCLUDED.final_status,
                        best_score        = EXCLUDED.best_score,
                        best_bill_id      = EXCLUDED.best_bill_id,
                        all_bill_ids      = EXCLUDED.all_bill_ids,
                        achieved_elements = EXCLUDED.achieved_elements,
                        missing_elements  = EXCLUDED.missing_elements,
                        unverifiable_elements = EXCLUDED.unverifiable_elements,
                        reasoning         = EXCLUDED.reasoning,
                        needs_review      = EXCLUDED.needs_review,
                        review_reason     = EXCLUDED.review_reason,
                        sources           = EXCLUDED.sources,
                        updated_at        = NOW()
                    """,
                    row,
                )
            conn.commit()
        except Exception as e:
            conn.rollback()
            logger.error(f"DB保存エラー (pledge_id={result.get('pledge_id')}): {e}")
            raise

    # ─────────────────────────────────────────────────────────
    # 1公約の処理
    # ─────────────────────────────────────────────────────────
    def _process_one_pledge(self, pledge: Dict) -> Optional[Dict]:
        pid = pledge["pledge_id"]
        
        conn = self._get_conn()

        try:
            with conn.cursor() as cur:
                similar_bills = self.search_similar_bills(
                    cur, pledge["pledge_vector"], pledge["party_id"], TOP_K
                )

            if not similar_bills:
                result = self._make_unstarted(pledge)
                self.save_one_to_tracker(conn, result)
                self._log_progress(pid, "unstarted（類似法案なし）")
                return result

            evaluated = self.evaluate_pledge(pledge, similar_bills)

            if not evaluated:
                result = self._make_unstarted(pledge)
                self.save_one_to_tracker(conn, result)
                self._log_progress(pid, "unstarted（関連法案なし）")
                return result

            result = self.determine_status(evaluated)
            if result is None:
                return None

            bill_ids = result.get("all_bill_ids", [])
            
            if bill_ids:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        SELECT bill_code, title, progress_url, content_url
                        FROM bills
                        WHERE bill_code = ANY(%s)
                        """,
                        (bill_ids,),
                    )
                    sources = []
                    for row in cur.fetchall():
                        bill_code, title, progress_url, content_url = row
                        url = content_url or progress_url  
                        if url:
                            sources.append({
                                "label": title or bill_code,
                                "url": url,
                            })
                    result["sources"] = sources
            else:
                result["sources"] = []

            self.save_one_to_tracker(conn, result)
            self._log_progress(
                pid,
                f"{result['final_status']} (score={result['best_score']})"
            )
            return result

        except Exception as e:
            logger.error(f"pledge_id={pid} でエラー: {e}")
            return None
        finally:
            if conn:
                self._release_conn(conn)

    @staticmethod
    def _make_unstarted(pledge: Dict) -> Dict:
        return {
            "pledge_id":        pledge["pledge_id"],
            "pledge_text":      pledge["pledge_text"],
            "category":         pledge.get("category", ""),
            "party_id":         pledge.get("party_id"),
            "administration_id": pledge.get("administration_id"),
            "final_status":     FinalStatus.UNSTARTED.value,
            "best_score":       0,
            "best_bill_id":     None,
            "all_bill_ids":     [],
            "achieved_elements": [],
            "missing_elements":  [],
            "reasoning":        "",
            "needs_review":     False,
            "review_reason":    None,
            "sources":          [],
        }

    def _log_progress(self, pledge_id: int, status_msg: str) -> None:
        with self._count_lock:
            self._done_count += 1
            done = self._done_count
            total = self._total_count
        logger.info(f"  [{done}/{total}] pledge_id={pledge_id} → {status_msg}")

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # run
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    def run(self) -> Dict:
        conn = self._get_conn()
        try:
            cur = conn.cursor()

            # Step 1: 指定政権の公約を取得
            pledges = self.fetch_pledges(cur)

            logger.info(
                f"Step1: party_id={self.party_id}, "
                f"administration_id={self.administration_id} の公約 {len(pledges)} 件取得"
                f" (会期: 第{self.min_session}回〜"
                f"{f'第{self.max_session}回' if self.max_session else '現在'})"
                f" 使用モデル：{GEMINI_CHAT_MODEL}"
            )
            if not pledges:
                logger.warning("公約が0件です。終了します。")
                return {"results": [], "report": {}}

            # 途中再開
            if not self.force:
                completed = self.get_completed_pledge_ids(
                    cur, self.party_id, self.administration_id
                )
                before = len(pledges)
                pledges = [p for p in pledges if p["pledge_id"] not in completed]
                skipped = before - len(pledges)
                if skipped > 0:
                    logger.info(
                        f"  途中再開: {skipped} 件スキップ, 残り {len(pledges)} 件"
                    )

            cur.close()

            if not pledges:
                logger.info("全件処理済みです。")
                cur2 = conn.cursor()
                report = self._build_report(cur2, self.party_id, self.administration_id)
                cur2.close()
                return {"results": [], "report": report}

            self._total_count = len(pledges)
            self._done_count = 0

            logger.info(f"  {MAX_WORKERS} 並列で処理開始...")
            start_time = time.time()

            all_results: List[Dict] = []

            with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
                futures = {
                    executor.submit(self._process_one_pledge, pledge): pledge
                    for pledge in pledges
                }

                for future in as_completed(futures):
                    result = future.result()
                    if result is not None:
                        all_results.append(result)

            elapsed = time.time() - start_time
            logger.info(
                f"\n処理完了: {len(all_results)} 件, "
                f"所要時間: {elapsed:.0f}秒 ({elapsed/60:.1f}分)"
            )

            cur2 = conn.cursor()
            report = self._build_report(cur2, self.party_id, self.administration_id)
            cur2.close()

            return {
                "results": all_results,
                "report": report,
            }

        finally:
            if conn:
                self._release_conn(conn)

    # ─────────────────────────────────────────────────────────
    # レポート
    # ─────────────────────────────────────────────────────────
    @staticmethod
    def _build_report(cur, party_id: int, administration_id: int | None) -> Dict:
        if administration_id is not None:
            cur.execute(
                """
                SELECT final_status, COUNT(*)
                FROM pledge_tracker
                WHERE party_id = %s AND administration_id = %s
                GROUP BY final_status
                """,
                (party_id, administration_id),
            )
        else:
            cur.execute(
                """
                SELECT final_status, COUNT(*)
                FROM pledge_tracker
                WHERE party_id = %s
                GROUP BY final_status
                """,
                (party_id,),
            )
        counts = {row[0]: row[1] for row in cur.fetchall()}
        total = sum(counts.values())
        achieved = counts.get(FinalStatus.ACHIEVED.value, 0)
        return {
            "total": total,
            "achievement_rate": (
                round(achieved / total * 100, 1) if total else 0.0
            ),
            "counts": counts,
        }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CLI
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def main():
    args = sys.argv[1:]

    force = "--force" in args
    args = [a for a in args if a != "--force"]

    # 新しい使い方: --election <election_id> <party_id>
    if "--election" in args:
        idx = args.index("--election")
        if idx + 2 >= len(args):
            print("Error: --election <election_id> <party_id> を指定してください")
            sys.exit(1)
        election_id = int(args[idx + 1])
        party_id    = int(args[idx + 2])
        
        # DBから選挙情報を取得
        conn = pool.getconn()
        try:
            cur = conn.cursor()
            info = resolve_election(cur, election_id, party_id)
            cur.close()
        finally:
            pool.putconn(conn)
        
        administration_id = info["administration_id"]  # 野党なら None
        min_session        = info["min_session"]
        max_session        = None
        election_label     = info["election_label"]
        
        admin_msg = f"administration_id={administration_id}" if administration_id else "野党（全公約対象）"
        logger.info(
            f"選挙「{election_label}」(election_id={election_id}) → "
            f"party_id={party_id}, {admin_msg}, "
            f"min_session={min_session}"
        )
    
    # 旧来の使い方: <party_id> <administration_id> <min_session> [max_session]
    elif len(args) >= 3:
        party_id          = int(args[0])
        administration_id = int(args[1])
        min_session        = int(args[2])
        max_session        = int(args[3]) if len(args) >= 4 else None
        election_label     = None
    
    else:
        print(
            "Usage:\n"
            "  python data_pipeline.py --election <election_id> <party_id> [--force]\n"
            "  python data_pipeline.py <party_id> <administration_id> <min_session> [max_session] [--force]\n"
            "\n"
            "Examples:\n"
            "  python data_pipeline.py --election 1 1             # 選挙1, 自民党（与党→administration_idで絞る）\n"
            "  python data_pipeline.py --election 1 7             # 選挙1, 野党（party_idで全公約）\n"
            "  python data_pipeline.py --election 1 1 --force     # 全件再評価\n"
            "  python data_pipeline.py 1 105 221                  # 手動指定\n"
        )
        sys.exit(1)

    pipeline = DataPipeline(
        party_id, administration_id, min_session, max_session, force=force, election_id=election_id
    )
    output = pipeline.run()

    report = output["report"]
    label = f" ({election_label})" if election_label else ""
    print(f"\n{'='*60}")
    print(f"  公約達成度レポート{label}")
    print(f"  party_id={party_id}, administration_id={administration_id}")
    print(f"  対象国会: 第{min_session}回〜"
          f"{f'第{max_session}回' if max_session else '現在'}")
    print(f"{'='*60}")
    print(f"  公約総数:    {report.get('total', 0)}")
    print(f"  達成率:      {report.get('achievement_rate', 0)}%")
    for status, count in report.get("counts", {}).items():
        if count > 0:
            print(f"    {status}: {count} 件")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()