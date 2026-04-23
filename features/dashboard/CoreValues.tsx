'use client';

import { useMemo, useState } from 'react';
import { useQuizStore } from '@/stores/quizStore';
import {
  calcUserCompassPoint,
  calcPartyCompassPoints,
  calcPhilosophyMatches,
  detectValueTensions,
  getQuadrantLabel,
  type PhilosophyMatch,
} from '@/lib/dashboard/coreValues';

// ─── Political Compass ────────────────────────────────────────────────────────

function PoliticalCompass() {
  const { answers } = useQuizStore();
  const userPoint = useMemo(() => calcUserCompassPoint(answers), [answers]);
  const partyPoints = useMemo(() => calcPartyCompassPoints(), []);
  const quadrant = userPoint ? getQuadrantLabel(userPoint) : null;

  const SIZE = 320;
  const PAD = 32;
  const INNER = SIZE - PAD * 2;

  // Convert -1..+1 to SVG coords
  const toSvg = (v: number) => PAD + ((v + 1) / 2) * INNER;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-base">政治コンパス</h3>
          <p className="text-xs text-muted-foreground mt-0.5">あなたの政治的座標</p>
        </div>
        {quadrant && userPoint && (
          <div className="text-right">
            <div className="text-sm font-bold">{quadrant.label}</div>
            <p className="text-xs text-muted-foreground max-w-48">{quadrant.description}</p>
          </div>
        )}
      </div>

      <div className="relative flex justify-center">
        <svg width={SIZE} height={SIZE} className="overflow-visible">
          {/* Background quadrants */}
          <rect x={PAD} y={PAD} width={INNER / 2} height={INNER / 2} fill="#fef3c7" opacity="0.5" />
          <rect x={PAD + INNER / 2} y={PAD} width={INNER / 2} height={INNER / 2} fill="#fee2e2" opacity="0.5" />
          <rect x={PAD} y={PAD + INNER / 2} width={INNER / 2} height={INNER / 2} fill="#dbeafe" opacity="0.5" />
          <rect x={PAD + INNER / 2} y={PAD + INNER / 2} width={INNER / 2} height={INNER / 2} fill="#f0fdf4" opacity="0.5" />

          {/* Grid border */}
          <rect x={PAD} y={PAD} width={INNER} height={INNER} fill="none" stroke="#e5e7eb" strokeWidth="1" />

          {/* Center lines */}
          <line x1={SIZE / 2} y1={PAD} x2={SIZE / 2} y2={SIZE - PAD} stroke="#d1d5db" strokeWidth="1" strokeDasharray="4,3" />
          <line x1={PAD} y1={SIZE / 2} x2={SIZE - PAD} y2={SIZE / 2} stroke="#d1d5db" strokeWidth="1" strokeDasharray="4,3" />

          {/* Axis labels */}
          <text x={SIZE / 2} y={PAD - 8} textAnchor="middle" fontSize="10" fill="#6b7280">保守・権威</text>
          <text x={SIZE / 2} y={SIZE - PAD + 16} textAnchor="middle" fontSize="10" fill="#6b7280">進歩・自由</text>
          <text x={PAD - 4} y={SIZE / 2} textAnchor="end" fontSize="10" fill="#6b7280" transform={`rotate(-90, ${PAD - 4}, ${SIZE / 2})`}>経済左派</text>
          <text x={SIZE - PAD + 4} y={SIZE / 2} textAnchor="start" fontSize="10" fill="#6b7280" transform={`rotate(90, ${SIZE - PAD + 4}, ${SIZE / 2})`}>経済右派</text>

          {/* Quadrant micro labels */}
          <text x={PAD + 8} y={PAD + 16} fontSize="9" fill="#92400e" opacity="0.7">権威左派</text>
          <text x={SIZE - PAD - 8} y={PAD + 16} textAnchor="end" fontSize="9" fill="#991b1b" opacity="0.7">権威右派</text>
          <text x={PAD + 8} y={SIZE - PAD - 8} fontSize="9" fill="#1d4ed8" opacity="0.7">自由左派</text>
          <text x={SIZE - PAD - 8} y={SIZE - PAD - 8} textAnchor="end" fontSize="9" fill="#166534" opacity="0.7">自由右派</text>

          {/* Party dots */}
          {partyPoints.map(party => (
            <g key={party.id}>
              <circle
                cx={toSvg(party.x)}
                cy={toSvg(party.y)}
                r={5}
                fill={party.color}
                opacity={0.75}
              />
              <text
                x={toSvg(party.x)}
                y={toSvg(party.y) - 8}
                textAnchor="middle"
                fontSize="8"
                fill={party.color}
                fontWeight="600"
              >
                {party.shortName}
              </text>
            </g>
          ))}

          {/* User dot */}
          {userPoint ? (
            <g>
              {/* Pulse ring */}
              <circle cx={toSvg(userPoint.x)} cy={toSvg(userPoint.y)} r={14} fill="none" stroke="#000" strokeWidth="1" opacity={0.15} />
              <circle cx={toSvg(userPoint.x)} cy={toSvg(userPoint.y)} r={8} fill="#000" />
              <circle cx={toSvg(userPoint.x)} cy={toSvg(userPoint.y)} r={3} fill="#fff" />
              <text x={toSvg(userPoint.x)} y={toSvg(userPoint.y) + 20} textAnchor="middle" fontSize="9" fill="#000" fontWeight="bold">あなた</text>
            </g>
          ) : (
            <text x={SIZE / 2} y={SIZE / 2} textAnchor="middle" fontSize="12" fill="#9ca3af">
              質問に回答すると表示されます
            </text>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground justify-center">
        {partyPoints.slice(0, 6).map(p => (
          <span key={p.id} className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            {p.shortName}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Philosophy Resonance ─────────────────────────────────────────────────────

function PhilosophyResonance({ matches }: { matches: PhilosophyMatch[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const top = matches.slice(0, 6);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-bold text-base">思想共鳴度</h3>
        <p className="text-xs text-muted-foreground mt-0.5">あなたの回答が最も共鳴する哲学・思想</p>
      </div>

      <div className="space-y-3">
        {top.map((match, i) => (
          <div key={match.id} className="space-y-1.5">
            <button
              className="w-full text-left"
              onClick={() => setExpanded(expanded === match.id ? null : match.id)}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {i === 0 && (
                    <span className="text-xs px-1.5 py-0.5 bg-black text-white rounded-sm font-medium">最共鳴</span>
                  )}
                  <span className="text-sm font-semibold">{match.name}</span>
                  <span className="text-xs text-muted-foreground">{match.core_value}</span>
                </div>
                <span className="text-sm font-bold tabular-nums">{match.score}%</span>
              </div>

              {/* Bar */}
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${match.score}%`,
                    backgroundColor: i === 0 ? 'red' : '#000',
                  }}
                />
              </div>

              <div className="text-xs text-muted-foreground mt-0.5">{match.category_label}</div>
            </button>

            {/* Expanded detail */}
            {expanded === match.id && (
              <div className="ml-2 pl-3 border-l-2 border-gray-200 space-y-2 py-1">
                <p className="text-xs leading-relaxed text-slate-600">{match.logic}</p>
                <div className="bg-slate-50 rounded p-2 text-xs italic text-slate-500">
                  「{match.output_template}」
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {matches.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          質問に回答すると思想分析が表示されます
        </p>
      )}
    </div>
  );
}

// ─── Value Tensions ──────────────────────────────────────────────────────────

function ValueTensions({ answers }: { answers: Record<string, number> }) {
  const tensions = useMemo(() => detectValueTensions(answers), [answers]);

  if (tensions.length === 0) {
    const hasAnswers = Object.keys(answers).length > 0;
    return (
      <div className="space-y-3">
        <div>
          <h3 className="font-bold text-base">価値の緊張</h3>
          <p className="text-xs text-muted-foreground mt-0.5">あなたの立場における内的矛盾・複雑さ</p>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">
          {hasAnswers ? '矛盾は検出されませんでした。一貫した立場です。' : '質問に回答すると分析されます'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-bold text-base">価値の緊張</h3>
        <p className="text-xs text-muted-foreground mt-0.5">あなたの立場に見られる思想的複雑さ</p>
      </div>

      <div className="space-y-3">
        {tensions.map((t, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">{t.a}</span>
              <span className="text-xs text-muted-foreground">×</span>
              <span className="text-xs font-medium px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">{t.b}</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">{t.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function CoreValues() {
  const { answers } = useQuizStore();
  const philosophyMatches = useMemo(() => calcPhilosophyMatches(answers), [answers]);

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-20">

      {answeredCount < 5 && (
        <div className="border border-dashed rounded-xl p-5 text-center space-y-1">
          <p className="text-sm font-medium">クイック診断の回答が少ない状態です</p>
          <p className="text-xs text-muted-foreground">
            より正確な分析のために、まず「Questions」からクイック診断を進めてください。
            現在 {answeredCount} / 22 問回答済み。
          </p>
        </div>
      )}

      {/* Section 1 */}
      <section>
        <PoliticalCompass />
      </section>

      <div className="border-t" />

      {/* Section 2 */}
      <section>
        <PhilosophyResonance matches={philosophyMatches} />
      </section>

      <div className="border-t" />

      {/* Section 3 */}
      <section>
        <ValueTensions answers={answers} />
      </section>
    </div>
  );
}
