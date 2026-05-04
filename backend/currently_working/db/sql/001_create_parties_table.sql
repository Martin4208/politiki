CREATE TABLE IF NOT EXISTS parties (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    shortName TEXT NOT NULL UNIQUE,
    officialUrl TEXT NOT NULL,
    foundedYear INTEGER NOT NULL,
    color_code VARCHAR(7)
);
