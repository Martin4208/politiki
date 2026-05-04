CREATE TABLE bill_amendment (
    id SERIAL PRIMARY KEY,
    bill_content_id INTEGER NOT NULL REFERENCES bill_content(id) ON DELETE CASCADE,
    title VARCHAR(255),
    amendment_text TEXT NOT NULL,
    amendment_vector vector(768),
    url TEXT
);