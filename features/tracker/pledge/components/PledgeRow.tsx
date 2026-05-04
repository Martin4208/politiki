// ---------------------------------------------------------------------------
// 公約リスト行（コンパクト）
// ---------------------------------------------------------------------------
import { STATUS } from '../constants/status';
import type { PledgeTrackerItem } from '@/app/api/tracker/route';

export function PledgeRow({
  item,
  onClick,
}: {
  item: PledgeTrackerItem;
  onClick: () => void;
}) {
  const s = STATUS[item.final_status];

  return (
    <button
      onClick={onClick}
      className="w-full text-left border-b border-border/50 py-4 px-3 hover:bg-accent/50 transition-colors duration-150 flex items-center gap-4 hover:cursor-pointer"
    >
      <div className="shrink-0 w-10 text-right">
        <span className={`text-base font-bold tabular-nums ${s.text}`}>{item.best_score}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-relaxed line-clamp-1">{item.pledge_text}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1.5">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${s.dot}`} />
            <span className={`text-xs ${s.text}`}>{s.label}</span>
          </span>
          <span className="text-xs text-muted-foreground">{item.category}</span>
        </div>
      </div>
      <span className="shrink-0 text-muted-foreground/30 text-sm">→</span>
    </button>
  );
}