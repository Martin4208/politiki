# models/party.py

from pydantic import BaseModel, Field
from typing import Dict, Optional
from .philosophy import Philosophy 


class PolicyItem(BaseModel):
    stance: Optional[int] = Field(default=None, description="-2〜+2 のスタンス")
    target_value: Optional[float] = None
    target_rate:  Optional[float] = None
    notes:        Optional[str]   = None
    source_text:  Optional[str]   = None


class PolicyCategory(BaseModel):
    category_id: str
    policies: Dict[str, PolicyItem]


class Policies(BaseModel):
    economics:          Optional[PolicyCategory] = None
    social_security:    Optional[PolicyCategory] = None
    foreign_policy:     Optional[PolicyCategory] = None
    constitution:       Optional[PolicyCategory] = None
    labor:              Optional[PolicyCategory] = None
    energy_environment: Optional[PolicyCategory] = None
    education:          Optional[PolicyCategory] = None
    human_rights:       Optional[PolicyCategory] = None
    justice:            Optional[PolicyCategory] = None
    technology:         Optional[PolicyCategory] = None
    media:              Optional[PolicyCategory] = None
    regional:           Optional[PolicyCategory] = None
    immigration:        Optional[PolicyCategory] = None  # 移民・入国管理
    political_reform:   Optional[PolicyCategory] = None  # 政治改革・議員制度
    culture_religion:   Optional[PolicyCategory] = None  # 文化・宗教・歴史
    agriculture:        Optional[PolicyCategory] = None  # 農林水産
    security_intel:     Optional # 情報・諜報・スパイ防止[PolicyCategory] = None  
    disaster_prevention: Optional[PolicyCategory] = None  # 防災・災害対策・復興
    culture_sport:       Optional[PolicyCategory] = None# 文化芸術・スポーツ振興


class Party(BaseModel):
    party_id:   str
    party_name: str
    philosophy: Philosophy
    policies:   Policies
