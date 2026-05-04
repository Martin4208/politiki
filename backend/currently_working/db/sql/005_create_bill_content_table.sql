CREATE TABLE IF NOT EXISTS bill_content (
    id SERIAL PRIMARY KEY,
    bill_id INT NOT NULL REFERENCES bills(id) ON DELETE CASCADE,

    bill_text TEXT,
    outline_text TEXT,

    title_vector vector(768),
    bill_vector vector(768),
    outline_vector vector(768), 

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bill_content_submitted ON bill_content(submitted_diet_number);
CREATE INDEX idx_bill_content_discussed ON bill_content(discussed_session_number);
