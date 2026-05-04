CREATE TABLE IF NOT EXISTS pledge_tracker (
    pledge_id          TEXT        PRIMARY KEY,
    pledge_text        TEXT        NOT NULL,
    party_id           TEXT        NOT NULL,
    category           TEXT        NOT NULL,
 
    -- Step6: 最終ステータス（5分類）
    final_status       TEXT        NOT NULL
        CHECK (final_status IN ('achieved','in_progress','partial','regressive','unstarted')),
 
    -- Step5: 集約スコア
    best_score         INT         NOT NULL DEFAULT 0,
    best_bill_id       TEXT,                          -- 最高スコア法案のID
    all_bill_ids       JSONB       NOT NULL DEFAULT '[]',  -- 関連法案ID一覧
 
    -- Step4: 評価詳細（best_bill の値を採用）
    achieved_elements  JSONB       NOT NULL DEFAULT '[]',
    missing_elements   JSONB       NOT NULL DEFAULT '[]',
    reasoning          TEXT        NOT NULL DEFAULT '',
 
    -- ガードレール
    needs_review       BOOLEAN     NOT NULL DEFAULT FALSE,
    review_reason      TEXT,
 
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
 
-- インデックス（APIのフィルタに対応）
CREATE INDEX IF NOT EXISTS idx_pt_party_id     ON pledge_tracker (party_id);
CREATE INDEX IF NOT EXISTS idx_pt_category     ON pledge_tracker (category);
CREATE INDEX IF NOT EXISTS idx_pt_final_status ON pledge_tracker (final_status);
CREATE INDEX IF NOT EXISTS idx_pt_needs_review ON pledge_tracker (needs_review) WHERE needs_review = TRUE;
CREATE INDEX IF NOT EXISTS idx_pt_updated_at   ON pledge_tracker (updated_at DESC);
