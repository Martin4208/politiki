# models/philosophy.py

from pydantic import BaseModel, Field
from typing import List, Optional


class EconomicsPolicyAxes(BaseModel):
    """経済政策層（表層）— 財政・市場介入・再分配"""
    fiscal_stance: Optional[str] = Field(
        default=None,
        description="財政スタンスの説明（例: 積極財政、財政健全化重視）"
    )
    fiscal_axis: Optional[float] = Field(
        default=None,
        description="-1: 財政緊縮・PB重視 ←→ +1: 積極財政・国債増発も辞さない",
        ge=-1.0, le=1.0
    )
    market_intervention_axis: Optional[float] = Field(
        default=None,
        description="-1: 市場重視・規制緩和・民営化 ←→ +1: 国家介入・産業政策・規制強化",
        ge=-1.0, le=1.0
    )
    redistribution_axis: Optional[float] = Field(
        default=None,
        description="-1: 成長・効率・競争重視 ←→ +1: 再分配・格差是正・平等重視",
        ge=-1.0, le=1.0
    )


class GovernanceIndividualAxes(BaseModel):
    """国家と個人層 — 国家介入度・個人vs共同体"""
    state_intervention: Optional[float] = Field(
        default=None,
        description="-1: 国家は最小限（リバタリアン）←→ +1: 国家が積極介入・保護（パターナリズム）",
        ge=-1.0, le=1.0
    )
    individual_vs_community: Optional[float] = Field(
        default=None,
        description="-1: 個人の権利・自由を最優先 ←→ +1: 共同体・伝統・社会的絆を優先（コミュニタリアン）",
        ge=-1.0, le=1.0
    )


class InternationalRelationsAxes(BaseModel):
    """国際政治・国防層 — 安全保障アプローチ・同盟依存度"""
    security_approach: Optional[float] = Field(
        default=None,
        description="-1: 外交・対話・多国間協調重視（リベラリズム）←→ +1: 軍事力・抑止力・同盟重視（リアリズム）",
        ge=-1.0, le=1.0
    )
    alliance_dependency: Optional[float] = Field(
        default=None,
        description="-1: 自主外交・独立路線 ←→ +1: 覇権国との緊密同盟重視（ヘゲモニー安定論）",
        ge=-1.0, le=1.0
    )


class EconomicsJusticeAxes(BaseModel):
    """経済と社会正義層（哲学）— 正義の根拠・市場vs国家"""
    justice_basis: Optional[float] = Field(
        default=None,
        description="-1: 社会全体の効率・総和を最優先（功利主義）←→ +1: 最も不遇な人への配慮を最優先（ロールズ的正義）",
        ge=-1.0, le=1.0
    )
    market_vs_state: Optional[float] = Field(
        default=None,
        description="-1: 市場の自己調節・民営化を信頼（新自由主義）←→ +1: 国家による再分配・規制を支持",
        ge=-1.0, le=1.0
    )


class CivilizationEcologyAxes(BaseModel):
    """文明と環境層 — 成長vs持続可能性・技術規制"""
    growth_vs_sustainability: Optional[float] = Field(
        default=None,
        description="-1: 経済成長・技術革新で課題解決（テクノ楽観主義）←→ +1: 脱成長・消費抑制・持続可能性優先",
        ge=-1.0, le=1.0
    )
    tech_regulation: Optional[float] = Field(
        default=None,
        description="-1: 技術開発・投資優先、規制は最小限 ←→ +1: 技術リスクへの規制・予防原則重視",
        ge=-1.0, le=1.0
    )


class Philosophy(BaseModel):
    economics:        Optional[EconomicsPolicyAxes]      = Field(default=None)
    governance:       Optional[GovernanceIndividualAxes] = Field(default=None)
    international:    Optional[InternationalRelationsAxes] = Field(default=None)
    economics_justice: Optional[EconomicsJusticeAxes]   = Field(default=None)
    civilization:     Optional[CivilizationEcologyAxes]  = Field(default=None)
    keywords:         List[str]                          = Field(default_factory=list)