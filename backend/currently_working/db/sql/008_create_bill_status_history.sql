CREATE TABLE IF NOT EXISTS bill_status_history (
    id SERIAL PRIMARY KEY,
    bill_id INT NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    diet_session_id INT NOT NULL REFERENCES diet_sessions(session_number),
    status TEXT,                        -- 可決、継続審査、未了など
    is_continued BOOLEAN DEFAULT FALSE, -- 閉会中審査になるか
    progress_url TEXT,                  -- 各会期固有の経過URL
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bill_status_history_bill_id    ON bill_status_history(bill_id);
CREATE INDEX idx_bill_status_history_session    ON bill_status_history(diet_session_number);
