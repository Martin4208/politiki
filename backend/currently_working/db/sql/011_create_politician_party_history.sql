CREATE TABLE politician_party_history (
    id             SERIAL PRIMARY KEY,
    politician_id  INT NOT NULL REFERENCES politicians(id),
    party_id       INT NOT NULL REFERENCES parties(id),
    start_date     DATE NOT NULL,
    end_date       DATE,  -- NULLなら現在も所属中

    UNIQUE (politician_id, party_id, start_date)
);