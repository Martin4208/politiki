'use client';

import { useState } from 'react';
import { useTracker } from './useTracker';
import { parties } from '@/lib/parties';
import type { PledgeTrackerItem, FinalStatus } from '@/app/api/tracker/route';

const STATUS: Record<FinalStatus, { label: string; dot: string; text: string }> = {
  achieved:    { label: '達成',     dot: 'bg-emerald-400', text: 'text-emerald-400' },
  in_progress: { label: '進行中',   dot: 'bg-sky-400',     text: 'text-sky-400'     },
  partial:     { label: '部分達成', dot: 'bg-amber-400',   text: 'text-amber-400'   },
  regressive:  { label: '逆行',     dot: 'bg-rose-500',    text: 'text-rose-500'    },
  unstarted:   { label: '未着手',   dot: 'bg-zinc-600',    text: 'text-zinc-500'    },
};

const ALL_STATUSES = Object.keys(STATUS) as FinalStatus[];

// 国政政党のみ表示
const nationalParties = parties.filter((p) =>
  p.status.includes('国政政党') || p.status.includes('最大野党')
);

function PledgeCard({ item }: { item: PledgeTrackerItem }) {
  const [open, setOpen] = useState(false);
  const s = STATUS[item.final_status];

  return (
    <div
      className={`
        group border-b py-5 transition-colors duration-200
        hover:bg-muted/30 px-1
        ${item.needs_review ? 'border-l-2 border-l-amber-500 pl-3' : ''}
      `}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 text-right">
          <span className={`text-lg font-bold tabular-nums ${s.text}`}>
            {item.best_score}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-relaxed line-clamp-2">{item.pledge_text}</p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${s.dot}`} />
              <span className={`text-xs font-medium tracking-wide ${s.text}`}>{s.label}</span>
            </span>
            <span className="text-xs text-muted-foreground">{item.category}</span>
          </div>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors text-xs mt-0.5"
        >
          {open ? '▲' : '▼'}
        </button>
      </div>

      {open && (
        <div className="mt-4 ml-14 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1 bg-muted relative overflow-hidden rounded">
              <div
                className={`absolute left-0 top-0 h-full rounded transition-all ${
                  item.best_score >= 80 ? 'bg-emerald-400' : item.best_score >= 50 ? 'bg-amber-400' : 'bg-muted-foreground/30'
                }`}
                style={{ width: `${item.best_score}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground tabular-nums w-12">{item.best_score} / 100</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed border-l-2 pl-3">
            {item.reasoning}
          </p>
          {(item.achieved_elements.length > 0 || item.missing_elements.length > 0) && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-widest">達成</p>
                <ul className="space-y-1">
                  {item.achieved_elements.map((el, i) => (
                    <li key={i} className="text-xs text-emerald-400 flex gap-1.5"><span className="opacity-50">+</span>{el}</li>
                  ))}
                  {item.achieved_elements.length === 0 && <li className="text-xs text-muted-foreground/50">なし</li>}
                </ul>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-widest">未達</p>
                <ul className="space-y-1">
                  {item.missing_elements.map((el, i) => (
                    <li key={i} className="text-xs text-rose-400 flex gap-1.5"><span className="opacity-50">−</span>{el}</li>
                  ))}
                  {item.missing_elements.length === 0 && <li className="text-xs text-muted-foreground/50">なし</li>}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function PartyTracker() {
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<FinalStatus | null>(null);
  const [page, setPage] = useState(1);

  const party = selectedParty ? parties.find((p) => p.id === selectedParty) : null;

  const { data, isLoading, isError } = useTracker(
    selectedParty
      ? {
          party_id: selectedParty,
          status: activeStatus ? [activeStatus] : undefined,
          page,
          limit: 20,
        }
      : { limit: 0 }
  );

  const toggleStatus = (s: FinalStatus) => {
    setActiveStatus((prev) => (prev === s ? null : s));
    setPage(1);
  };

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">政党公約トラッカー</h2>
          <p className="text-sm text-muted-foreground mt-1">
            各政党のマニフェスト・公約の達成度を追跡。
          </p>
        </div>

        {/* Party selector */}
        <div className="mb-8">
          <p className="text-xs text-muted-foreground mb-3 uppercase tracking-widest">政党を選択</p>
          <div className="grid grid-cols-2 gap-2">
            {nationalParties.map((p) => (
              <button
                key={p.id}
                onClick={() => { setSelectedParty(p.id); setPage(1); setActiveStatus(null); }}
                className={`
                  flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm border transition-all text-left
                  ${selectedParty === p.id
                    ? 'bg-black text-white dark:bg-white dark:text-black border-transparent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent border-transparent hover:border-border'}
                `}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: p.color }}
                />
                <span className="font-medium truncate">{p.shortName}</span>
              </button>
            ))}
          </div>
        </div>

        {!selectedParty && (
          <div className="py-24 text-center text-muted-foreground text-sm">
            政党を選択してください
          </div>
        )}

        {selectedParty && party && (
          <>
            {/* Party info */}
            <div className="mb-8 p-4 rounded-xl border bg-muted/30">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: party.color }} />
                <span className="font-bold">{party.name}</span>
                <span className="text-xs text-muted-foreground">{party.status}</span>
              </div>
              <p className="text-sm text-muted-foreground">{party.description}</p>
            </div>

            {/* Status filters */}
            {data && data.items.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-8">
                {ALL_STATUSES.map((s) => {
                  const meta = STATUS[s];
                  const count = data.summary[s];
                  const active = activeStatus === s;
                  return (
                    <button
                      key={s}
                      onClick={() => toggleStatus(s)}
                      className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs
                        border transition-all duration-150
                        ${active
                          ? 'border-foreground/30 text-foreground bg-accent'
                          : 'border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground'}
                      `}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                      {meta.label}
                      <span className="tabular-nums opacity-60">{count}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* List */}
            {isLoading && (
              <div className="py-24 text-center text-muted-foreground text-sm">読み込み中...</div>
            )}
            {isError && (
              <div className="py-24 text-center text-rose-500 text-sm">データの取得に失敗しました</div>
            )}
            {data && !isLoading && (
              <>
                {data.items.length === 0 ? (
                  <p className="py-24 text-center text-muted-foreground text-sm">
                    この政党の公約データはまだ準備中です
                  </p>
                ) : (
                  <div>
                    {data.items.map((item) => (
                      <PledgeCard key={item.pledge_id} item={item} />
                    ))}
                  </div>
                )}

                {Math.ceil(data.total / data.limit) > 1 && (
                  <div className="flex items-center justify-between mt-10 text-xs text-muted-foreground">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="hover:text-foreground disabled:opacity-20 transition-colors"
                    >← 前</button>
                    <span className="tabular-nums">
                      {page} / {Math.ceil(data.total / data.limit)}
                      <span className="ml-2 opacity-50">({data.total}件)</span>
                    </span>
                    <button
                      disabled={page >= Math.ceil(data.total / data.limit)}
                      onClick={() => setPage((p) => p + 1)}
                      className="hover:text-foreground disabled:opacity-20 transition-colors"
                    >次 →</button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
