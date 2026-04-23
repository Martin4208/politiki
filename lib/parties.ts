export type Party = {
  id: string
  name: string
  shortName: string
  color: string
  logoUrl: string
  officialUrl: string
  foundedYear: number
  status: string
  philosophical_tags: string[]
  description: string
  key_policy?: string
  seats: {
    representatives: number
    councillors: number
    updatedAt: string
  }
}

export const parties: Party[] = [
  // --- 主要国政勢力 ---
  {
    id: "ldp",
    name: "自由民主党",
    shortName: "自民",
    color: "#CC0000",
    logoUrl: "/images/parties/ldp.png",
    officialUrl: "https://www.jimin.jp",
    foundedYear: 1955,
    status: "国政政党（与党）",
    philosophical_tags: ["conservatism", "utilitarianism", "hegemonic_stability", "paternalism"],
    description: "長期的政権担当能力と現実的な利益調整を重視。伝統と革新のバランスを保つ包括政党。",
    seats: { representatives: 258, councillors: 114, updatedAt: "2026-03" }
  },
  {
    id: "cra",
    name: "中道改革連合",
    shortName: "中道",
    color: "#005599",
    logoUrl: "/images/parties/centrist_reform.png",
    officialUrl: "https://chudo-kaikaku.jp",
    foundedYear: 2026,
    status: "国政政党（最大野党 / 立憲・公明合流）",
    philosophical_tags: ["humanism", "social_democracy", "liberalism_ir", "rawlsian", "communitarianism"],
    description: "「生命・生活・生存」を最大尊重する人間主義を掲げる。格差是正と現実的な安全保障を両立させる日本の『ど真ん中』。",
    key_policy: "ジャパン・ファンドによる現役世代負担軽減、食料品消費税ゼロ、平和外交",
    seats: { representatives: 122, councillors: 66, updatedAt: "2026-03" }
  },
  {
    id: "jrp",
    name: "日本維新の会",
    shortName: "維新",
    color: "#00A040",
    logoUrl: "/images/parties/ishin.png",
    officialUrl: "https://o-ishin.jp",
    foundedYear: 2015,
    status: "国政政党（改革勢力）",
    philosophical_tags: ["neo_liberalism", "rationalism", "libertarianism"],
    description: "身を切る改革と地方分権を推進。市場原理と徹底した合理化による社会変革を目指す。",
    seats: { representatives: 38, councillors: 21, updatedAt: "2026-03" }
  },
  {
    id: "dpfp",
    name: "国民民主党",
    shortName: "国民",
    color: "#F5A400",
    logoUrl: "/images/parties/dpfp.png",
    officialUrl: "https://new-kokumin.jp",
    foundedYear: 2018,
    status: "国政政党（改革勢力）",
    philosophical_tags: ["techno_optimism", "realism", "utilitarianism"],
    description: "「対決より解決」。給料が上がる経済の実現や、科学技術投資、現実的な安全保障を重視。",
    seats: { representatives: 28, councillors: 10, updatedAt: "2026-03" }
  },
  {
    id: "jcp",
    name: "日本共産党",
    shortName: "共産",
    color: "#CC0000",
    logoUrl: "/images/parties/jcp.png",
    officialUrl: "https://www.jcp.or.jp",
    foundedYear: 1922,
    status: "国政政党",
    philosophical_tags: ["tabula_rasa", "rawlsian", "teleology"],
    description: "科学的社会主義を土台に、資本主義の枠内での民主的改革と平和外交を主張。",
    seats: { representatives: 8, councillors: 11, updatedAt: "2026-03" }
  },
  {
    id: "reiwa",
    name: "れいわ新選組",
    shortName: "れいわ",
    color: "#E4007F",
    logoUrl: "/images/parties/reiwa.png",
    officialUrl: "https://reiwa-shinsengumi.com",
    foundedYear: 2019,
    status: "国政政党",
    philosophical_tags: ["populism", "rawlsian", "degrowth"],
    description: "徹底した反緊縮と生活者救済。既存のエリート政治を批判する草の根勢力。",
    seats: { representatives: 9, councillors: 5, updatedAt: "2026-03" }
  },
  // --- 諸派・地域政党・活動団体 ---
  {
    id: "sansei",
    name: "参政党",
    shortName: "参政",
    color: "#FF6600",
    logoUrl: "/images/parties/sansei.png",
    officialUrl: "https://www.sanseito.jp",
    foundedYear: 2020,
    status: "国政政党",
    philosophical_tags: ["communitarianism", "cyclical_traditionalism", "biological_determinism"],
    description: "独自の教育・食・伝統の守護を訴える。参加型民主主義を標榜。",
    seats: { representatives: 3, councillors: 3, updatedAt: "2026-03" }
  },
  {
    id: "hoshu",
    name: "日本保守党",
    shortName: "保守党",
    color: "#16396E",
    logoUrl: "/images/parties/hoshu.png",
    officialUrl: "https://hoshuto.jp",
    foundedYear: 2023,
    status: "国政政党（議席あり）",
    philosophical_tags: ["conservatism", "realism", "cyclical_traditionalism"],
    description: "日本の国体、文化、伝統を次世代に繋ぐ。強い安全保障を強調。",
    seats: { representatives: 3, councillors: 0, updatedAt: "2026-03" }
  },
  {
    id: "tomin_first",
    name: "都民ファーストの会",
    shortName: "都民ファ",
    color: "#00A73C",
    logoUrl: "/images/parties/tomin.png",
    officialUrl: "https://tomin1st.jp",
    foundedYear: 2017,
    status: "地域政党（中道改革連合協力）",
    philosophical_tags: ["rationalism", "progressivism", "paternalism"],
    description: "東京大改革を掲げる。エビデンスに基づく政策決定を重視。",
    seats: { representatives: 0, councillors: 0, updatedAt: "2026-03" }
  },
  {
    id: "sdp",
    name: "社会民主党",
    shortName: "社民",
    color: "#0091DA",
    logoUrl: "/images/parties/sdp.png",
    officialUrl: "https://sdp.or.jp",
    foundedYear: 1996,
    status: "国政政党（議席あり）",
    philosophical_tags: ["degrowth", "liberalism_ir", "rawlsian"],
    description: "平和憲法を守り抜く。生存権の保障と非武装中立を理想とする。",
    seats: { representatives: 1, councillors: 2, updatedAt: "2026-03" }
  },
  {
    id: "greens",
    name: "緑の党グリーンズジャパン",
    shortName: "緑の党",
    color: "#008000",
    logoUrl: "/images/parties/greens.png",
    officialUrl: "https://greens.gr.jp",
    foundedYear: 2012,
    status: "政治団体",
    philosophical_tags: ["degrowth", "rawlsian", "liberalism_ir"],
    description: "環境保護と脱原発、多様性の共生を掲げる。グローバルな環境政党。",
    seats: { representatives: 0, councillors: 0, updatedAt: "2026-03" }
  },
  {
    id: "nhk",
    name: "NHKから国民を守る党（諸派）",
    shortName: "N党系",
    color: "#FFFF00",
    logoUrl: "/images/parties/nhk.png",
    officialUrl: "https://www.syoha.jp",
    foundedYear: 2013,
    status: "政治団体",
    philosophical_tags: ["libertarianism", "methodological_individualism", "populism"],
    description: "放送制度の抜本的改革を主張。直接民主主義の実験的側面を持つ。",
    seats: { representatives: 0, councillors: 0, updatedAt: "2026-03" }
  },
  {
    id: "shinfu",
    name: "維新政党・新風",
    shortName: "新風",
    color: "#800000",
    logoUrl: "/images/parties/shinfu.png",
    officialUrl: "https://shimpu.jp",
    foundedYear: 1995,
    status: "政治団体（右派諸派）",
    philosophical_tags: ["organicism", "cyclical_traditionalism", "realism"],
    description: "国体主義を掲げる伝統的右派団体。憲法破棄を主張。",
    seats: { representatives: 0, councillors: 0, updatedAt: "2026-03" }
  }
];