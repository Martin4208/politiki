CREATE TABLE IF NOT EXISTS bills (
    id SERIAL PRIMARY KEY,
    current_session_number INT NOT NULL REFERENCES diet_sessions(session_number),
    submitted_session_number INT NOT NULL REFERENCES diet_sessions(session_number),
    bill_number INT NOT NULL, -- 議案番号
    category VARCHAR(100) NOT NULL, -- 分類（衆法、参法、閣法 など）
    title TEXT NOT NULL,
    progress_url TEXT, -- 経過のURL
    text_url TEXT, -- 本文のURL
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(submitted_diet_number, bill_number, category) -- 回次・番号・種類の組み合わせで重複を防ぐ
);
