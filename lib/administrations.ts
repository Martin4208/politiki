export type Administration = {
  id: string
  name: string
  pm: string
  party_id: string
  start_date: string
  end_date: string | null
  description: string
  election_year: number        // 公約を掲げた選挙年
  db_ids: number[]             // DBのadministration_id（複数可）
  pledge_db_id: number | null  // 公約が紐づくDB id（nullは公約なし）
  no_pledge_note?: string      // 公約なしの場合の注記
}

export const administrations: Administration[] = [
  {
    id: "takaichi",
    name: "高市内閣",
    pm: "高市早苗",
    party_id: "ldp",
    start_date: "2025-10-21",
    end_date: null,
    description: "第104-105代内閣総理大臣。経済安全保障と積極財政を掲げる。",
    election_year: 2025,
    db_ids: [104, 105],
    pledge_db_id: 104,
  },
  {
    id: "ishiba",
    name: "石破内閣",
    pm: "石破茂",
    party_id: "ldp",
    start_date: "2024-10-01",
    end_date: "2025-10-21",
    description: "第102-103代内閣総理大臣。地方創生と安全保障改革を推進。",
    election_year: 2024,
    db_ids: [102, 103],
    pledge_db_id: 103, // 第2次が選挙後
    no_pledge_note: "第1次石破内閣は選挙前に発足のため公約なし。2024年衆院選後の第2次を対象。",
  },
  {
    id: "kishida",
    name: "岸田内閣",
    pm: "岸田文雄",
    party_id: "ldp",
    start_date: "2021-10-04",
    end_date: "2024-10-01",
    description: "第100-101代内閣総理大臣。「新しい資本主義」を掲げ、所得倍増・分配改革を推進。",
    election_year: 2021,
    db_ids: [100, 101],
    pledge_db_id: 101,
    no_pledge_note: "第1次岸田内閣は選挙前に発足のため公約なし。2021年衆院選後の第2次を対象。",
  },
  {
    id: "abe2",
    name: "第2次安倍内閣",
    pm: "安倍晋三",
    party_id: "ldp",
    start_date: "2012-12-26",
    end_date: "2020-09-16",
    description: "第96-98代内閣総理大臣。アベノミクスによる経済再生と安全保障法制の整備。歴代最長政権。",
    election_year: 2012,
    db_ids: [96, 97, 98],
    pledge_db_id: 96,
  },
  {
    id: "noda",
    name: "野田内閣",
    pm: "野田佳彦",
    party_id: "cra",
    start_date: "2011-09-02",
    end_date: "2012-12-26",
    description: "第95代内閣総理大臣。社会保障と税の一体改革、消費税増税法を成立。",
    election_year: 2009,
    db_ids: [95],
    pledge_db_id: 95,
  },
]