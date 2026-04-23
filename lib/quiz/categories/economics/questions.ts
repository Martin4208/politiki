export interface Question {
  id: number;
  text: string;
  category: string;    // 日本語表示用
  enCategory: string;  // プログラム処理・ID用
  placeholder: string;
  learnSlug: string;
}

export const questions: Question[] = [
  // --- 1-12番（既存の形式を維持） ---
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
  }
]