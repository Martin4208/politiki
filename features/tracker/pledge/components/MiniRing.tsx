// ---------------------------------------------------------------------------
// ミニ・リングチャート（SVG）
// ---------------------------------------------------------------------------
import { statusColor } from '../constants/status';
import type { RingSegment } from '../types';

export function MiniRing({
  segments,
  size = 80,
  stroke = 6,
  rate,
}: {
  segments: RingSegment[];
  size?: number;
  stroke?: number;
  rate: number;
}) {
  const total = segments.reduce((s, seg) => s + seg.count, 0);
  if (total === 0) return null;

  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;

  // オフセットを事前計算
  const visible = segments.filter((seg) => seg.count > 0);
  const offsets = visible.reduce<number[]>((acc, seg, i) => {
    if (i === 0) return [0];
    const prev = visible[i - 1];
    return [...acc, acc[i - 1] + (prev.count / total) * circumference];
  }, [0]);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {visible.map((seg, i) => {
        const pct = seg.count / total;
        const dash = pct * circumference;
        const gap = circumference - dash;
        return (
          <circle
            key={seg.status}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={statusColor(seg.status)}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offsets[i]}
            strokeLinecap="butt"
            className="transition-all duration-500"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        );
      })}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-foreground font-bold"
        fontSize={size * 0.22}
      >
        {rate}%
      </text>
    </svg>
  );
}