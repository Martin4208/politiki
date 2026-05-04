CREATE TABLE IF NOT EXISTS bill_amendments (
    id              SERIAL  PRIMARY KEY,
    bill_id         INT     NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    amendment_text  TEXT,
    amendment_vector vector(768),
    created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bill_amendments_bill_id ON bill_amendments(bill_id);
