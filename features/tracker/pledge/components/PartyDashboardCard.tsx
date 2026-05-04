'use client'

// ---------------------------------------------------------------------------
// 政党ダッシュボードカード
// ---------------------------------------------------------------------------
import { useTracker } from '../../hooks/useTracker';
import { STATUS, ALL_STATUSES } from '../constants/status';
import { MiniRing } from './MiniRing';
import type { ElectionParty } from '../hooks/useElections';
import type { RingSegment } from '../types';

export function PartyDashboardCard({
  party,
  onClick,
}: {
  party: ElectionParty;
  onClick: () => void;
}) {
  // administration_id の有無に関わらず、party_id でフェッチ
  const filter = party.administration_id !== null 
    ? {
        administration: party.administration_id,
        party_id: party.party_id,
        limit: 1,
      }
    : {
        party_id: party.party_id,
        limit: 1,
      };

  const isAdmin = party.administration_id !== null;

  const { data, isLoading } = useTracker(filter);

  const segments: RingSegment[] = data
    ? ALL_STATUSES.map((s) => ({ status: s, count: data.summary[s] }))
    : [];

  const total = data
    ? ALL_STATUSES.reduce((sum, s) => sum + data.summary[s], 0)
    : 0;

  const hasData = data !== undefined && total > 0;

  return (
    <div className="relative">
      {isAdmin && (
        <div
          className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-[10px] font-medium tracking-wide border border-green-300 dark:border-green-700 z-10"
        >
          政権与党
        </div>
      )}
      <button
        onClick={onClick}
        className={`
          w-full text-left rounded-2xl border p-5 transition-all duration-200
          hover:shadow-md border-border bg-card hover:bg-accent/50
          ${!hasData && !isLoading ? 'opacity-50 cursor-default' : 'cursor-pointer'}
          ${isAdmin ? 'border-green-300 border-2' : ''}
        `}
        disabled={!hasData && !isLoading}
      >
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            {hasData ? (
              <MiniRing segments={segments} size={72} stroke={5} rate={data?.summary.avg_score ?? 0} />
            ) : (
              <div className="w-18 h-18 rounded-full border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                <span className="text-xs text-muted-foreground/40">—</span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{party.party_name}</p>
            {isLoading ? (
              <p className="text-xs text-muted-foreground/50 mt-1">読み込み中...</p>
            ) : hasData ? (
              <>
                <p className="text-xs text-muted-foreground mt-1">公約 {total}件</p>
                <div className="flex gap-3 mt-2 flex-wrap">
                  {ALL_STATUSES.map((s) => {
                    const count = data!.summary[s];
                    if (count === 0) return null;
                    const meta = STATUS[s];
                    return (
                      <span key={s} className="flex items-center gap-1 text-xs hover:cursor-pointer">
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                        <span className="text-muted-foreground">{meta.label}</span>
                        <span className="tabular-nums font-medium">{count}</span>
                      </span>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground/50 mt-1">データがありません</p>
            )}
          </div>

          {hasData && (
            <span className="shrink-0 text-muted-foreground/40 transition-colors">→</span>
          )}
        </div>

        {party.note && hasData && (
          <p className="text-xs text-muted-foreground/60 mt-3 leading-relaxed border-t border-border/50 pt-3">
            {party.note}
          </p>
        )}
      </button>
    </div>
  );
}