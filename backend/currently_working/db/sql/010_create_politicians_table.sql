CREATE TABLE IF NOT EXISTS politicians (
    id          SERIAL  PRIMARY KEY,
    party_id    INT REFERENCES parties(id),
    name        TEXT NOT NULL,
    name_yomi   TEXT NOT NULL,
    name_en     TEXT NOT NULL,

    house       TEXT CHECK (house IN ('衆議院', '参議院', '両院', NULL)),

    is_active   BOOLEAN DEFAULT TRUE,

    UNIQUE (name, name_yomi)
);
