CREATE TABLE IF NOT EXISTS administrations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,            -- 例: "高市政権"
    prime_minister_jp TEXT NOT NULL,  -- 例: "高市早苗"
    prime_minister_en TEXT NOT NULL,  -- 例: "Sanae Takaichi"
    party_id TEXT REFERENCES parties(id),
    start_date DATE NOT NULL,
    end_date DATE,                 -- NULL = 現政権

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
