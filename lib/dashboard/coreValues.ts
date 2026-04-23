import { categories } from '@/lib/categories';
import { questions } from '@/lib/quiz/quick/questions';
import { human } from '@/lib/philosophy/human';
import { politicalThoughts } from '@/lib/philosophy/politics';
import { parties } from '@/lib/parties';

// ─── Types ───────────────────────────────────────────────────────────────────

export type CompassPoint = { x: number; y: number }; // x: economic, y: social (-1 to +1)

export type PhilosophyMatch = {
  id: string;
  name: string;
  core_value: string;
  logic: string;
  output_template: string;
  score: number; // 0-100
  layer: 'human' | 'politics';
  category_label: string;
};

export type ValueTension = {
  a: string;
  b: string;
  description: string;
};

// ─── Political Compass Calculation ───────────────────────────────────────────

/**
 * Calculates user's position on a 2D political compass.
 * x: -1 (economic left) to +1 (economic right)
 * y: -1 (progressive/libertarian) to +1 (conservative/authoritarian)
 */
export function calcUserCompassPoint(answers: Record<string, number>): CompassPoint | null {
  const getCatAvg = (catId: string): number | null => {
    const catQs = questions.filter(q => q.enCategory === catId);
    const answered = catQs.filter(q => answers[String(q.id)] != null);
    if (answered.length === 0) return null;
    return answered.reduce((s, q) => s + answers[String(q.id)], 0) / answered.length;
  };

  // Economic axis: categories where high score = economic left
  // economics(高=再分配左), social_security(高=公助左), labor(高=保護左), education(高=公共左)
  const economicCategories = ['economics', 'social_security', 'labor', 'education'];
  const economicScores = economicCategories.map(getCatAvg).filter((v): v is number => v !== null);

  // Social axis: categories where high score = progressive
  // human_rights(高=変化=進歩), justice(高=更生=進歩), culture_religion(高=変革=進歩)
  // constitution: 高=護憲 → 进步的ではあるが独立軸として扱う
  const socialCategories = ['human_rights', 'justice', 'culture_religion'];
  const socialScores = socialCategories.map(getCatAvg).filter((v): v is number => v !== null);

  if (economicScores.length === 0 && socialScores.length === 0) return null;

  // Convert 1-5 scale to -1 to +1
  // For economic: high (5) = left = -1, low (1) = right = +1 → x = (3 - avg) / 2
  const economicAvg = economicScores.length > 0
    ? economicScores.reduce((s, v) => s + v, 0) / economicScores.length
    : 3;
  const x = (economicAvg - 3) / 2; // high avg = economic left = negative x...
  // We want: high avg → left → x = -1, low avg → right → x = +1
  const economicX = -((economicAvg - 3) / 2);

  // For social: high (5) = progressive = -1 (bottom), low (1) = conservative = +1 (top)
  const socialAvg = socialScores.length > 0
    ? socialScores.reduce((s, v) => s + v, 0) / socialScores.length
    : 3;
  const socialY = -((socialAvg - 3) / 2);

  return {
    x: Math.max(-1, Math.min(1, economicX)),
    y: Math.max(-1, Math.min(1, socialY)),
  };
}

// ─── Party Compass Positions ─────────────────────────────────────────────────

// Philosophical tag → approximate compass position
const tagPositions: Record<string, CompassPoint> = {
  libertarianism:           { x:  0.8, y: -0.6 },
  neo_liberalism:           { x:  0.7, y:  0.1 },
  rationalism:              { x:  0.2, y: -0.2 },
  techno_optimism:          { x:  0.4, y: -0.3 },
  utilitarianism:           { x:  0.1, y:  0.0 },
  realism:                  { x:  0.2, y:  0.4 },
  conservatism:             { x:  0.1, y:  0.6 },
  paternalism:              { x: -0.1, y:  0.4 },
  communitarianism:         { x: -0.1, y:  0.5 },
  hegemonic_stability:      { x:  0.3, y:  0.3 },
  humanism:                 { x: -0.5, y: -0.3 },
  social_democracy:         { x: -0.6, y: -0.4 },
  rawlsian:                 { x: -0.7, y: -0.3 },
  liberalism_ir:            { x: -0.3, y: -0.5 },
  degrowth:                 { x: -0.8, y: -0.6 },
  tabula_rasa:              { x: -0.5, y: -0.5 },
  teleology:                { x: -0.3, y: -0.6 },
  progressivism:            { x: -0.4, y: -0.7 },
  organicism:               { x: -0.2, y:  0.7 },
  cyclical_traditionalism:  { x:  0.1, y:  0.8 },
  biological_determinism:   { x:  0.5, y:  0.5 },
  methodological_individualism: { x: 0.8, y: -0.4 },
  skeptical_empiricism:     { x:  0.1, y:  0.2 },
  populism:                 { x: -0.5, y:  0.2 },
};

export type PartyPoint = CompassPoint & { id: string; name: string; shortName: string; color: string };

export function calcPartyCompassPoints(): PartyPoint[] {
  return parties
    .filter(p => p.seats.representatives > 0 || p.seats.councillors > 0)
    .map(party => {
      const tags = party.philosophical_tags.filter(t => tagPositions[t]);
      if (tags.length === 0) return null;
      const xs = tags.map(t => tagPositions[t].x);
      const ys = tags.map(t => tagPositions[t].y);
      const x = xs.reduce((s, v) => s + v, 0) / xs.length;
      const y = ys.reduce((s, v) => s + v, 0) / ys.length;
      return { id: party.id, name: party.name, shortName: party.shortName, color: party.color, x, y };
    })
    .filter((p): p is PartyPoint => p !== null);
}

// ─── Philosophy Resonance ─────────────────────────────────────────────────────

type PhilosophyHint = {
  categories: string[];   // category IDs
  direction: 'high' | 'low' | 'extreme'; // which end of the axis resonates
};

// Maps each philosophy to the answer patterns that resonate with it
const philosophyHints: Record<string, PhilosophyHint> = {
  // human.ts
  tabula_rasa:                  { categories: ['human_rights', 'justice', 'education'], direction: 'high' },
  biological_determinism:       { categories: ['human_rights', 'social_security'], direction: 'low' },
  teleology:                    { categories: ['political_reform', 'culture_religion', 'human_rights'], direction: 'high' },
  cyclical_traditionalism:      { categories: ['culture_religion', 'political_reform'], direction: 'low' },
  methodological_individualism: { categories: ['social_security', 'economics', 'labor'], direction: 'low' },
  organicism:                   { categories: ['regional', 'disaster_prevention', 'culture_religion'], direction: 'low' },
  rationalism:                  { categories: ['technology', 'political_reform'], direction: 'high' },
  skeptical_empiricism:         { categories: ['political_reform', 'technology'], direction: 'low' },
  // politics.ts
  libertarianism:               { categories: ['economics', 'social_security', 'labor'], direction: 'low' },
  communitarianism:             { categories: ['culture_religion', 'human_rights', 'regional'], direction: 'low' },
  paternalism:                  { categories: ['justice', 'media', 'human_rights'], direction: 'high' },
  realism:                      { categories: ['foreign_policy', 'constitution'], direction: 'low' },
  liberalism_ir:                { categories: ['foreign_policy', 'constitution'], direction: 'high' },
  hegemonic_stability:          { categories: ['foreign_policy'], direction: 'low' },
  utilitarianism:               { categories: ['economics', 'technology', 'political_reform'], direction: 'extreme' },
  rawlsian:                     { categories: ['social_security', 'education', 'economics'], direction: 'high' },
  neo_liberalism:               { categories: ['economics', 'labor', 'technology'], direction: 'low' },
  techno_optimism:              { categories: ['technology', 'energy_environment'], direction: 'high' },
  degrowth:                     { categories: ['energy_environment', 'economics'], direction: 'high' },
};

function getCategoryAvg(catId: string, answers: Record<string, number>): number | null {
  const catQs = questions.filter(q => q.enCategory === catId);
  const answered = catQs.filter(q => answers[String(q.id)] != null);
  if (answered.length === 0) return null;
  return answered.reduce((s, q) => s + answers[String(q.id)], 0) / answered.length;
}

function scorePhilosophy(philosophyId: string, answers: Record<string, number>): number {
  const hint = philosophyHints[philosophyId];
  if (!hint) return 50;

  const scores: number[] = [];
  for (const catId of hint.categories) {
    const avg = getCategoryAvg(catId, answers);
    if (avg === null) continue;

    let score: number;
    if (hint.direction === 'high') {
      score = ((avg - 1) / 4) * 100; // 1→0%, 5→100%
    } else if (hint.direction === 'low') {
      score = ((5 - avg) / 4) * 100; // 1→100%, 5→0%
    } else {
      // extreme: close to center = 100%, far from center = 0%
      score = (1 - Math.abs(avg - 3) / 2) * 100;
    }
    scores.push(score);
  }

  if (scores.length === 0) return 50;
  return Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
}

export function calcPhilosophyMatches(answers: Record<string, number>): PhilosophyMatch[] {
  const allPhilosophies: Omit<PhilosophyMatch, 'score'>[] = [];

  for (const cat of human.categories) {
    for (const p of cat.philosophies) {
      allPhilosophies.push({
        id: p.id,
        name: p.name,
        core_value: p.core_value,
        logic: p.logic,
        output_template: p.output_template,
        layer: 'human',
        category_label: cat.label,
      });
    }
  }

  for (const cat of politicalThoughts.categories) {
    for (const p of (cat as any).philosophies ?? []) {
      allPhilosophies.push({
        id: p.id,
        name: p.name,
        core_value: p.core_value,
        logic: p.logic,
        output_template: p.output_template,
        layer: 'politics',
        category_label: cat.label,
      });
    }
  }

  return allPhilosophies
    .map(p => ({ ...p, score: scorePhilosophy(p.id, answers) }))
    .sort((a, b) => b.score - a.score);
}

// ─── Value Tensions ──────────────────────────────────────────────────────────

export function detectValueTensions(answers: Record<string, number>): ValueTension[] {
  const tensions: ValueTension[] = [];
  const getAvg = (catId: string) => getCategoryAvg(catId, answers);

  const econ = getAvg('economics');
  const labor = getAvg('labor');
  const tech = getAvg('technology');
  const energy = getAvg('energy_environment');
  const humanRights = getAvg('human_rights');
  const justice = getAvg('justice');
  const foreign = getAvg('foreign_policy');
  const constitution = getAvg('constitution');
  const media = getAvg('media');
  const security = getAvg('security_intel');

  // Tension: market economics but labor protection
  if (econ !== null && labor !== null && econ < 2.5 && labor > 3.5) {
    tensions.push({
      a: '経済的自由主義',
      b: '労働保護主義',
      description: '市場競争を重視しながら、同時に労働者保護を強く支持しています。これは「規制なき市場」への批判と「競争の恩恵」への肯定が共存する、実用主義的な立場です。',
    });
  }

  // Tension: tech promotion but environmental protection
  if (tech !== null && energy !== null && tech > 3.5 && energy > 3.5) {
    tensions.push({
      a: '技術楽観主義',
      b: '環境優先主義',
      description: '技術革新の推進を求めながら、同時に環境保護も強く支持しています。「テクノロジーで環境問題を解く」という立場か、両者の間で揺れているかもしれません。',
    });
  }

  // Tension: individual freedom but speech restriction
  if (humanRights !== null && media !== null && humanRights > 3.5 && media < 2.5) {
    tensions.push({
      a: '個人の自由・多様性重視',
      b: 'メディア・言論規制支持',
      description: '人権・多様性を進歩的に支持しながら、メディアへの規制も支持しています。守りたい自由の種類を整理することで、より一貫した立場が見えてきます。',
    });
  }

  // Tension: peace/international cooperation but constitution revision
  if (foreign !== null && constitution !== null && foreign > 3.5 && constitution < 2.5) {
    tensions.push({
      a: '国際協調主義',
      b: '憲法改正（改憲）',
      description: '国際協調を重視しながら、憲法改正（特に9条）も支持しています。「平和のための抑止力」という現実主義的な立場と読めます。',
    });
  }

  // Tension: strict justice but progressive human rights
  if (justice !== null && humanRights !== null && justice < 2.5 && humanRights > 3.5) {
    tensions.push({
      a: '厳罰・秩序重視',
      b: '人権・多様性重視',
      description: '治安・犯罪に厳しく臨みながら、人権・多様性も重視しています。「社会的マイノリティの権利」と「公共の秩序」をどう調整するかが問われます。',
    });
  }

  // Tension: transparency but security intel
  if (security !== null && media !== null && security > 3.5 && media > 3.5) {
    tensions.push({
      a: '情報の自由・透明性',
      b: 'メディア規制支持',
      description: '情報の透明性と安全保障を同時に重視しています。「知る権利」と「国家機密」のバランスという、現代の核心的な問いです。',
    });
  }

  return tensions.slice(0, 3);
}

// ─── Quadrant Label ──────────────────────────────────────────────────────────

export function getQuadrantLabel(point: CompassPoint): { label: string; description: string } {
  const { x, y } = point;
  if (x < -0.15 && y < -0.15) return { label: '自由左派', description: '経済的平等と個人の自由を共に重視する立場' };
  if (x > 0.15 && y < -0.15) return { label: '自由右派', description: '市場の自由と個人の自律を重視する立場' };
  if (x < -0.15 && y > 0.15) return { label: '権威左派', description: '国家による平等の実現と秩序を重視する立場' };
  if (x > 0.15 && y > 0.15) return { label: '権威右派', description: '伝統・秩序と経済的自立を重視する立場' };
  return { label: '中道', description: '特定のイデオロギーに縛られない実用主義的立場' };
}
