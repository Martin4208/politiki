export interface Question {
  id: number;
  text: string;
  category: string;    // 日本語表示用
  enCategory: string;  // プログラム処理・ID用
  placeholder: string;
  learnSlug: string;
}

export const questions: Question[] = [
  {
    id: 1,
    text: "消費税を引き下げるべきだ",
    category: "経済・財政",
    enCategory: "economics",
    placeholder: "景気刺激効果、財源の代替案、逆進性の問題を踏まえて考えてください。",
    learnSlug: "consumption-tax"
  },
  {
    id: 2,
    text: "法人税を引き上げるべきだ",
    category: "経済・財政",
    enCategory: "economics",
    placeholder: "企業の国際競争力や投資への影響、税収増の使途を考慮してください。",
    learnSlug: "corporate-tax"
  },
  {
    id: 3,
    text: "最低賃金を大幅に引き上げるべきだ",
    category: "経済・財政",
    enCategory: "economics",
    placeholder: "労働者の生活水準向上と中小企業への影響のバランスを検討してください。",
    learnSlug: "minimum-wage"
  },
  {
    id: 4,
    text: "原子力発電所を再稼働すべきだ",
    category: "エネルギー・環境",
    enCategory: "energy_environment",
    placeholder: "エネルギー安全保障、コスト、安全性リスクを踏まえて考えてください。",
    learnSlug: "nuclear-power"
  },
  {
    id: 5,
    text: "再生可能エネルギーへの投資を拡大すべきだ",
    category: "エネルギー・環境",
    enCategory: "energy_environment",
    placeholder: "脱炭素目標、発電の安定性、国民負担の増加を考慮してください。",
    learnSlug: "renewable-energy"
  },
  {
    id: 6,
    text: "憲法第9条を改正すべきだ",
    category: "外交・安全保障",
    enCategory: "constitution",
    placeholder: "抑止力強化と平和主義の理念のバランスをどう考えるか整理してください。",
    learnSlug: "article-9"
  },
  {
    id: 7,
    text: "防衛費を増やすべきだ",
    category: "外交・安全保障",
    enCategory: "foreign_policy",
    placeholder: "安全保障環境の変化と財政負担の持続可能性を考えてください。",
    learnSlug: "defense-budget"
  },
  {
    id: 8,
    text: "外国人労働者の受け入れを拡大すべきだ",
    category: "社会保障",
    enCategory: "social_security",
    placeholder: "労働力不足対策と社会統合・文化摩擦の課題を検討してください。",
    learnSlug: "immigration"
  },
  {
    id: 9,
    text: "同性婚を法的に認めるべきだ",
    category: "社会保障",
    enCategory: "social_security",
    placeholder: "個人の権利保障と家族制度への影響の観点から考えてください。",
    learnSlug: "same-sex-marriage"
  },
  {
    id: 10,
    text: "選択的夫婦別姓制度を導入すべきだ",
    category: "社会保障",
    enCategory: "social_security",
    placeholder: "個人の尊厳と家族単位の一体性の観点を整理してください。",
    learnSlug: "separate-surnames"
  },
  {
    id: 11,
    text: "教育の無償化を拡大すべきだ",
    category: "教育",
    enCategory: "education",
    placeholder: "機会均等の実現と財源確保の現実性を踏まえて考えてください。",
    learnSlug: "education-free"
  },
  {
    id: 12,
    text: "子育て支援予算を大幅に増やすべきだ",
    category: "教育",
    enCategory: "economics", // 既存データに合わせ economics としています
    placeholder: "少子化対策の効果と他政策との優先順位を検討してください。",
    learnSlug: "child-support"
  },
  {
    id: 13,
    text: "解雇規制を緩和し、労働市場の流動性を高めるべきだ",
    category: "労働",
    enCategory: "labor",
    placeholder: "産業構造の転換の速さと、失業時のセーフティネットを考慮してください。",
    learnSlug: "labor-flexibility"
  },
  // {
  //   id: 14,
  //   text: "犯罪に対する罰則をより厳格化すべきだ",
  //   category: "司法・治安",
  //   enCategory: "justice",
  //   placeholder: "犯罪抑止力の向上と、更生・社会復帰の可能性を比較してください。",
  //   learnSlug: "stricter-punishment"
  // },
  {
    id: 15,
    text: "生成AIなどの新技術開発を、規制より推進を優先すべきだ",
    category: "科学技術・デジタル",
    enCategory: "technology",
    placeholder: "技術革新による成長と、著作権・倫理的リスクの管理を検討してください。",
    learnSlug: "ai-promotion"
  },
  // {
  //   id: 16,
  //   text: "ネット上の誹謗中傷に対し、投稿者の特定を容易にする規制を強めるべきだ",
  //   category: "メディア・情報",
  //   enCategory: "media",
  //   placeholder: "被害者救済と、表現の自由・匿名性の保持をどう両立するか考えてください。",
  //   learnSlug: "online-regulation"
  // },
  // {
  //   id: 17,
  //   text: "中央政府の権限を地方自治体へ大幅に移譲すべきだ",
  //   category: "地域・都市",
  //   enCategory: "regional",
  //   placeholder: "地域独自の最適化と、全国一律の行政水準の維持を検討してください。",
  //   learnSlug: "decentralization"
  // },
  // {
  //   id: 18,
  //   text: "大都市圏への一極集中を回避するため、地方移転に強制力を持たせるべきだ",
  //   category: "地域・都市",
  //   enCategory: "regional",
  //   placeholder: "国土の均衡ある発展と、集積による経済的メリットを考慮してください。",
  //   learnSlug: "city-concentration"
  // },
  {
    id: 19,
    text: "緊急事態条項を新設し、政府の権限を一時的に強化できるようにすべきだ",
    category: "憲法・統治",
    enCategory: "constitution",
    placeholder: "災害や有事の迅速な対応と、権力濫用のリスクを整理してください。",
    learnSlug: "emergency-clause"
  },
  // {
  //   id: 20,
  //   text: "公共放送（NHK）のあり方を根本から見直し、民営化も検討すべきだ",
  //   category: "メディア・情報",
  //   enCategory: "media",
  //   placeholder: "情報の公共性・中立性の維持と、効率的な経営体制を比較してください。",
  //   learnSlug: "media-reform"
  // },
  {
    id: 21,
    text: "ヘイトスピーチなどの差別的言動に対し、罰則を伴う法的規制を強めるべきだ",
    category: "人権・多様性",
    enCategory: "human_rights",
    placeholder: "表現の自由の保障と、マイノリティの尊厳保護のバランスを検討してください。",
    learnSlug: "hate-speech-regulation"
  },
  // {
  //   id: 22,
  //   text: "過去の格差を是正するため、採用や入学で特定グループを優遇する措置（アファーマティブ・アクション）を導入すべきだ",
  //   category: "人権・多様性",
  //   enCategory: "human_rights",
  //   placeholder: "実質的な機会の平等と、他グループへの「逆差別」の懸念を整理してください。",
  //   learnSlug: "affirmative-action"
  // },
  // {
  //   id: 23,
  //   text: "不治の病などで苦しむ患者に対し、本人の意思に基づく「安楽死」を法的に認めるべきだ",
  //   category: "人権・多様性",
  //   enCategory: "human_rights",
  //   placeholder: "個人の自己決定権と、生命の尊厳・濫用のリスクを考慮してください。",
  //   learnSlug: "euthanasia-debate"
  // },
  // {
  //   id: 24,
  //   text: "ネット上の個人情報や過去の記録について、削除を求める権利（忘れられる権利）を法的に確立すべきだ",
  //   category: "人権・多様性",
  //   enCategory: "human_rights",
  //   placeholder: "プライバシーの保護と、社会の「知る権利」・歴史的記録の保持を比較してください。",
  //   learnSlug: "right-to-be-forgotten"
  // },
  // {
  //   id: 25,
  //   text: "公共施設やサービスにおいて、性自認に基づく利用（性別不問トイレ等）を全面的に推進すべきだ",
  //   category: "人権・多様性",
  //   enCategory: "human_rights",
  //   placeholder: "トランスジェンダー当事者の権利と、周囲の利用者の安心・安全の確保を検討してください。",
  //   learnSlug: "gender-identity-space"
  // }
  {
    id: 26,
    text: "積極的な財政出動（国債増発）で経済を刺激すべきだ",
    category: "経済・財政",
    enCategory: "economics",
    placeholder: "景気の下支えと将来的な経済成長の可能性、財政規律と将来世代への負担を整理してください。",
    learnSlug: "fiscal-stimulus"
  }
];