CREATE TABLE IF NOT EXISTS pledges (
    id SERIAL PRIMARY KEY,
    administration_id INT REFERENCES administrations(id) ON DELETE CASCADE,
    category TEXT,
    content TEXT NOT NULL,

    content_vector vector(768),

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
