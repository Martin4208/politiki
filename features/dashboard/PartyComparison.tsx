'use client';

import { useMemo, useState } from 'react';
import { useQuizStore } from '@/stores/quizStore';
import {
  calcUserCompassPoint,
  calcPartyCompassPoints,
  getQuadrantLabel,
} from '@/lib/dashboard/coreValues';
import { stances_for_quick_questions } from '@/types/party-stance-data';
import { questions } from '@/lib/quiz/quick/questions';

// parties.ts の id → stance data のキー
const TO_STANCE_ID: Record<string, string> = {
  centrist_reform_alliance: 'cra',
  jrp: 'ishin',
};

export default function PartyComparison() {
  const { answers } = useQuizStore();
  const userPoint = useMemo(() => calcUserCompassPoint(answers), [answers]);
  const partyPoints = useMemo(() => calcPartyCompassPoints(), []);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const quadrant = userPoint ? getQuadrantLabel(userPoint) : null;

  const SIZE = 400;
  const PAD = 44;
  const INNER = SIZE - PAD * 2;
  const toSvg = (v: number) => PAD + ((v + 1) / 2) * INNER;

  const allStances = stances_for_quick_questions[0];

  // 政策ベースの一致度でランキング
  const rankedParties = useMemo(() => {
    return partyPoints
      .map(p => {
        const stanceId = TO_STANCE_ID[p.id] ?? p.id;
        const partyStances = allStances[stanceId];
        let similarity: number | null = null;
        if (partyStances) {
          let totalDiff = 0;
          let count = 0;
          for (const q of questions) {
            const userAnswer = answers[String(q.id)];
            if (userAnswer == null) continue;
            const ps = partyStances[q.learnSlug]?.stance;
            if (ps == null) continue;
            totalDiff += Math.abs(userAnswer - ps);
            count++;
          }
          if (count > 0) {
            similarity = Math.round(Math.max(0, (1 - totalDiff / count / 4) * 100));
          }
        }
        return { ...p, similarity };
      })
      .sort((a, b) => (b.similarity ?? -1) - (a.similarity ?? -1));
  }, [answers, partyPoints, allStances]);

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-20">

      {/* 回答数が少ない場合の警告 */}
      {answeredCount < 5 && (
        <div className="border border-dashed rounded-xl p-5 text-center space-y-1">
          <p className="text-sm font-medium">クイック診断の回答が少ない状態です</p>
          <p className="text-xs text-muted-foreground">
            より正確な比較のために、まず「Questions」からクイック診断を進めてください。
            現在 {answeredCount} / 22 問回答済み。
          </p>
        </div>
      )}

      {/* ── Political Compass ── */}
      <section className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-base">政治コンパス比較</h3>
            <p className="text-xs text-muted-foreground mt-0.5">あなたの位置と各政党の距離感</p>
          </div>
          {quadrant && userPoint && (
            <div className="text-right">
              <div className="text-sm font-bold">{quadrant.label}</div>
              <p className="text-xs text-muted-foreground max-w-44">{quadrant.description}</p>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <svg width={SIZE} height={SIZE} className="overflow-visible">

            {/* 背景 象限 */}
            <rect x={PAD} y={PAD} width={INNER / 2} height={INNER / 2} fill="#fef3c7" opacity="0.5" />
            <rect x={PAD + INNER / 2} y={PAD} width={INNER / 2} height={INNER / 2} fill="#fee2e2" opacity="0.5" />
            <rect x={PAD} y={PAD + INNER / 2} width={INNER / 2} height={INNER / 2} fill="#dbeafe" opacity="0.5" />
            <rect x={PAD + INNER / 2} y={PAD + INNER / 2} width={INNER / 2} height={INNER / 2} fill="#f0fdf4" opacity="0.5" />
            <rect x={PAD} y={PAD} width={INNER} height={INNER} fill="none" stroke="#e5e7eb" strokeWidth="1" />

            {/* 中心線 */}
            <line x1={SIZE / 2} y1={PAD} x2={SIZE / 2} y2={SIZE - PAD} stroke="#d1d5db" strokeWidth="1" strokeDasharray="4,3" />
            <line x1={PAD} y1={SIZE / 2} x2={SIZE - PAD} y2={SIZE / 2} stroke="#d1d5db" strokeWidth="1" strokeDasharray="4,3" />

            {/* 軸ラベル */}
            <text x={SIZE / 2} y={PAD - 10} textAnchor="middle" fontSize="11" fill="#6b7280">保守・権威</text>
            <text x={SIZE / 2} y={SIZE - PAD + 18} textAnchor="middle" fontSize="11" fill="#6b7280">進歩・自由</text>
            <text x={PAD - 6} y={SIZE / 2} textAnchor="middle" fontSize="11" fill="#6b7280"
              transform={`rotate(-90, ${PAD - 6}, ${SIZE / 2})`}>経済左派</text>
            <text x={SIZE - PAD + 6} y={SIZE / 2} textAnchor="middle" fontSize="11" fill="#6b7280"
              transform={`rotate(90, ${SIZE - PAD + 6}, ${SIZE / 2})`}>経済右派</text>

            {/* 象限ラベル */}
            <text x={PAD + 8} y={PAD + 18} fontSize="10" fill="#92400e" opacity="0.7">権威左派</text>
            <text x={SIZE - PAD - 8} y={PAD + 18} textAnchor="end" fontSize="10" fill="#991b1b" opacity="0.7">権威右派</text>
            <text x={PAD + 8} y={SIZE - PAD - 10} fontSize="10" fill="#1d4ed8" opacity="0.7">自由左派</text>
            <text x={SIZE - PAD - 8} y={SIZE - PAD - 10} textAnchor="end" fontSize="10" fill="#166534" opacity="0.7">自由右派</text>

            {/* ホバー中の政党へ破線 */}
            {userPoint && hoveredId && (() => {
              const p = partyPoints.find(p => p.id === hoveredId);
              if (!p) return null;
              return (
                <line
                  x1={toSvg(userPoint.x)} y1={toSvg(userPoint.y)}
                  x2={toSvg(p.x)} y2={toSvg(p.y)}
                  stroke="#000" strokeWidth="1.5" strokeDasharray="4,3" opacity={0.35}
                />
              );
            })()}

            {/* 政党ドット */}
            {partyPoints.map(party => {
              const isHovered = hoveredId === party.id;
              return (
                <g
                  key={party.id}
                  onMouseEnter={() => setHoveredId(party.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    cx={toSvg(party.x)}
                    cy={toSvg(party.y)}
                    r={isHovered ? 9 : 6}
                    fill={party.color}
                    opacity={hoveredId && !isHovered ? 0.3 : 0.85}
                  />
                  <text
                    x={toSvg(party.x)}
                    y={toSvg(party.y) - 12}
                    textAnchor="middle"
                    fontSize={isHovered ? 11 : 9}
                    fill={party.color}
                    fontWeight="700"
                    opacity={hoveredId && !isHovered ? 0.35 : 1}
                  >
                    {party.shortName}
                  </text>
                </g>
              );
            })}

            {/* ユーザードット */}
            {userPoint ? (
              <g>
                <circle cx={toSvg(userPoint.x)} cy={toSvg(userPoint.y)} r={18} fill="none" stroke="#000" strokeWidth="1" opacity={0.1} />
                <circle cx={toSvg(userPoint.x)} cy={toSvg(userPoint.y)} r={10} fill="#000" />
                <circle cx={toSvg(userPoint.x)} cy={toSvg(userPoint.y)} r={4} fill="#fff" />
                <text x={toSvg(userPoint.x)} y={toSvg(userPoint.y) + 24} textAnchor="middle" fontSize="11" fill="#000" fontWeight="bold">あなた</text>
              </g>
            ) : (
              <text x={SIZE / 2} y={SIZE / 2} textAnchor="middle" fontSize="13" fill="#9ca3af">
                質問に回答すると表示されます
              </text>
            )}
          </svg>
        </div>

        {/* 凡例 */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground justify-center">
          {partyPoints.map(p => (
            <span
              key={p.id}
              className="flex items-center gap-1 cursor-default"
              onMouseEnter={() => setHoveredId(p.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              {p.shortName}
            </span>
          ))}
        </div>
      </section>

      <div className="border-t" />

      {/* ── 一致度ランキング ── */}
      <section className="space-y-4">
        <div>
          <h3 className="font-bold text-base">政党一致度ランキング</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            各政策への回答から算出した一致度です
          </p>
        </div>

        <div className="space-y-2">
          {rankedParties.map((party, i) => (
            <div
              key={party.id}
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors"
              style={{ borderLeftColor: party.color, borderLeftWidth: 3 }}
              onMouseEnter={() => setHoveredId(party.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <span className="text-xs font-bold text-muted-foreground w-5 tabular-nums shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold truncate">{party.name}</span>
                  <span className="text-sm font-bold tabular-nums ml-2">
                    {party.similarity !== null ? `${party.similarity}%` : '—'}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: party.similarity !== null ? `${party.similarity}%` : '0%',
                      backgroundColor: party.color,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
