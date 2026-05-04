CREATE TABLE IF NOT EXISTS bill_progress (
    id                      SERIAL      PRIMARY KEY,
    bill_id                 INT         NOT NULL REFERENCES bills(id) ON DELETE CASCADE,

    -- 提出者情報
    submitters              TEXT[],     -- 例: {"田中健君", "岸田光広君"}
    submitter_faction       TEXT,       -- 提出会派: 例 "国民民主党・無所属クラブ"
    supporters              TEXT[],     -- 賛成者一覧

    -- 衆議院 予備審査
    hr_pre_received_date            DATE,   -- 衆議院予備審査 議案受理年月日
    hr_pre_committee_assigned_date  DATE,   -- 衆議院予備付託年月日
    hr_pre_committee                TEXT,   -- 衆議院予備付託委員会

    -- 衆議院 本審査
    hr_received_date                DATE,   -- 衆議院議案受理年月日
    hr_committee_assigned_date      DATE,   -- 衆議院付託年月日
    hr_committee                    TEXT,   -- 衆議院付託委員会（例: "財務金融"）
    hr_committee_decision_date      DATE,   -- 衆議院審査終了年月日
    hr_committee_result             TEXT,   -- 衆議院審査結果（例: "審査未了"）
    hr_plenary_decision_date        DATE,   -- 衆議院審議終了年月日
    hr_plenary_result               TEXT,   -- 衆議院審議結果（例: "可決"）

    -- 衆議院 採決時会派態度
    hr_vote_factions_for            TEXT[], -- 衆議院審議時賛成会派
    hr_vote_factions_against        TEXT[], -- 衆議院審議時反対会派

    -- 参議院 予備審査
    sr_pre_received_date            DATE,   -- 参議院予備審査 議案受理年月日
    sr_pre_committee_assigned_date  DATE,   -- 参議院予備付託年月日
    sr_pre_committee                TEXT,   -- 参議院予備付託委員会

    -- 参議院 本審査
    sr_received_date                DATE,   -- 参議院議案受理年月日
    sr_committee_assigned_date      DATE,   -- 参議院付託年月日
    sr_committee                    TEXT,   -- 参議院付託委員会
    sr_committee_decision_date      DATE,   -- 参議院審査終了年月日
    sr_committee_result             TEXT,   -- 参議院審査結果
    sr_plenary_decision_date        DATE,   -- 参議院審議終了年月日
    sr_plenary_result               TEXT,   -- 参議院審議結果

    -- 参議院 採決時会派態度
    sr_vote_factions_for            TEXT[], -- 参議院審議時賛成会派
    sr_vote_factions_against        TEXT[], -- 参議院審議時反対会派

    -- 成立情報
    promulgated_date                DATE,   -- 公布年月日
    law_number                      TEXT,   -- 法律番号

    created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bill_progress_bill_id ON bill_progress(bill_id);
