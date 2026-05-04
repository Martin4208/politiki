CREATE TABLE IF NOT EXISTS diet_sessions (
    session_number INT PRIMARY KEY,  -- 例: 213 (第213回)
    name TEXT,                    -- 例: "第213回通常国会"
    start_date DATE NOT NULL,
    end_date DATE,
    session_period INTEGER, 
    planned_session_period INTEGER, 
    extended_days INTEGER,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
