'use client';

import { useState, useEffect, useRef } from 'react';
import { useTracker } from './useTracker';
import { useElections } from './useElections';
import type { ElectionParty } from './useElections';
import type { PledgeTrackerItem, FinalStatus } from '@/app/api/tracker/route';

// ---------------------------------------------------------------------------
// ステータス定義
// ---------------------------------------------------------------------------

const STATUS: Record<FinalStatus, { label: string; dot: string; text: string; bg: string }> = {
  achieved:    { label: '達成',     dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  in_progress: { label: '進行中',   dot: 'bg-sky-400',     text: 'text-sky-400',     bg: 'bg-sky-400/10'     },
  partial:     { label: '部分達成', dot: 'bg-amber-400',   text: 'text-amber-400',   bg: 'bg-amber-400/10'   },
  regressive:  { label: '逆行',     dot: 'bg-rose-500',    text: 'text-rose-500',    bg: 'bg-rose-500/10'    },
  unstarted:   { label: '未着手',   dot: 'bg-zinc-500',    text: 'text-zinc-500',    bg: 'bg-zinc-500/10'    },
};

const ALL_STATUSES = Object.keys(STATUS) as FinalStatus[];

function statusColor(s: FinalStatus): string {
  const map: Record<FinalStatus, string> = {
    achieved: '#34d399',
    in_progress: '#38bdf8',
    partial: '#fbbf24',
    regressive: '#f43f5e',
    unstarted: '#71717a',
  };
  return map[s];
}

// ---------------------------------------------------------------------------
// ミニ・リングチャート（SVG）
// ---------------------------------------------------------------------------

type RingSegment = { status: FinalStatus; count: number };

function MiniRing({
  segments,
  size = 80,
  stroke = 6,
}: {
  segments: RingSegment[];
  size?: number;
  stroke?: number;
}) {
  const total = segments.reduce((s, seg) => s + seg.count, 0);
  if (total === 0) return null;

  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  const achieved = segments.find((s) => s.status === 'achieved')?.count ?? 0;
  const partial = segments.find((s) => s.status === 'partial')?.count ?? 0;
  const rate = Math.round(((achieved + partial * 0.5) / total) * 100);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments
        .filter((seg) => seg.count > 0)
        .map((seg) => {
          const pct = seg.count / total;
          const dash = pct * circumference;
          const gap = circumference - dash;
          const currentOffset = offset;
          offset += dash;
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
              strokeDashoffset={-currentOffset}
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

// ---------------------------------------------------------------------------
// ディスクレーマーバナー
// ---------------------------------------------------------------------------

function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-8">
      <div className="flex items-start gap-3">
        <span className="text-amber-500 mt-0.5 shrink-0 text-sm">⚠</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed">
            <span className="font-semibold">本サービスのスコア・評価はAIによる自動判定であり、正確性を保証するものではありません。</span>
            {' '}評価精度は改善を重ねていますが、誤りや見落としが含まれる可能性があります。
            あくまで参考情報としてご利用ください。各公約の根拠・ソースを併記していますので、ご自身でもご確認をお願いします。
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 text-amber-500/40 hover:text-amber-500 transition-colors text-xs mt-0.5"
          aria-label="閉じる"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 政党ダッシュボードカード
// ---------------------------------------------------------------------------

function PartyDashboardCard({
  party,
  onClick,
}: {
  party: ElectionParty;
  onClick: () => void;
}) {
  const hasData = party.administration_id !== null;

  const { data } = useTracker(
    hasData
      ? { administration: party.administration_id!, party_id: party.party_id, limit: 1 }
      : null
  );

  const segments: RingSegment[] = data
    ? ALL_STATUSES.map((s) => ({ status: s, count: data.summary[s] }))
    : [];

  const total = data
    ? ALL_STATUSES.reduce((sum, s) => sum + data.summary[s], 0)
    : 0;

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left rounded-2xl border p-5 transition-all duration-200
        hover:shadow-md hover:border-foreground/20
        border-border bg-card hover:bg-accent/50
        ${!hasData ? 'opacity-50 cursor-default' : 'cursor-pointer'}
      `}
      disabled={!hasData}
    >
      <div className="flex items-center gap-4">
        <div className="shrink-0">
          {hasData && data ? (
            <MiniRing segments={segments} size={72} stroke={5} />
          ) : (
            <div className="w-18 h-18 rounded-full border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
              <span className="text-xs text-muted-foreground/40">—</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{party.party_name}</p>
          {hasData && data ? (
            <>
              <p className="text-xs text-muted-foreground mt-1">公約 {total}件</p>
              <div className="flex gap-3 mt-2 flex-wrap">
                {ALL_STATUSES.map((s) => {
                  const count = data.summary[s];
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
            <p className="text-xs text-muted-foreground/50 mt-1">データ準備中</p>
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
  );
}

// ---------------------------------------------------------------------------
// 公約リスト行（コンパクト）
// ---------------------------------------------------------------------------

function PledgeRow({
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

// ---------------------------------------------------------------------------
// 詳細パネル（右スライドイン）
// ---------------------------------------------------------------------------

function DetailPanel({
  item,
  onClose,
}: {
  item: PledgeTrackerItem;
  onClose: () => void;
}) {
  const s = STATUS[item.final_status];
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // const handleFeedback = () => {

  // }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full w-full max-w-xl bg-background border-l z-50 overflow-y-auto animate-in slide-in-from-right duration-300"
      >
        {/* ヘッダー */}
        <div className="sticky top-0 bg-background/95 backdrop-blur border-b px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              {s.label}
            </span>
            <span className={`text-lg font-bold tabular-nums ${s.text}`}>
              {item.best_score}
              <span className="text-xs text-muted-foreground font-normal ml-0.5">/ 100</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors hover:cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-6 space-y-8">
          {/* 公約全文 */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-widest">公約</p>
            <p className="text-sm leading-relaxed">{item.pledge_text}</p>
          </div>

          {/* カテゴリ */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-widest">カテゴリ</p>
            <span className="text-sm px-3 py-1 rounded-full bg-accent text-foreground">
              {item.category}
            </span>
          </div>

          {/* スコアバー */}
          <div>
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-widest">達成スコア</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-muted relative overflow-hidden rounded-full">
                <div
                  className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
                    item.best_score >= 80
                      ? 'bg-emerald-400'
                      : item.best_score >= 50
                        ? 'bg-amber-400'
                        : item.best_score >= 20
                          ? 'bg-rose-400'
                          : 'bg-zinc-500'
                  }`}
                  style={{ width: `${item.best_score}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground tabular-nums font-medium">
                {item.best_score}%
              </span>
            </div>
          </div>

          {/* AI評価の根拠 */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-widest">AI評価の根拠</p>
            <div className="bg-muted/30 rounded-xl p-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.reasoning}
              </p>
              <p className="text-[10px] text-muted-foreground/40 mt-3 leading-relaxed">
                ※ この評価はAIが公開情報をもとに自動生成したものです。誤りを含む場合があります。
              </p>
            </div>
          </div>

          {/* 達成要素 / 未達要素 */}
          {(item.achieved_elements.length > 0 || item.missing_elements.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {item.achieved_elements.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-3 uppercase tracking-widest">達成された要素</p>
                  <ul className="space-y-2">
                    {item.achieved_elements.map((el, i) => (
                      <li key={i} className="text-sm flex gap-2 items-start">
                        <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                        <span className="leading-relaxed">{el}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {item.missing_elements.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-3 uppercase tracking-widest">未達の要素</p>
                  <ul className="space-y-2">
                    {item.missing_elements.map((el, i) => (
                      <li key={i} className="text-sm flex gap-2 items-start">
                        <span className="text-rose-400 mt-0.5 shrink-0">✗</span>
                        <span className="leading-relaxed">{el}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* ソース・法案リンク */}
          {item.sources && item.sources.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-3 uppercase tracking-widest">関連法案・ソース</p>
              <ul className="space-y-2">
                {item.sources.map((src, i) => (
                  <li key={i}>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors flex items-center gap-1.5"
                    >
                      <span className="inline-block w-1 h-1 rounded-full bg-sky-400/50 shrink-0" />
                      {src.label}
                      <span className="opacity-50">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* needs_review */}
          {item.needs_review && item.review_reason && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="text-xs text-amber-500 font-medium mb-1">⚠ AI評価に注意</p>
              <p className="text-xs text-amber-500/70 leading-relaxed">{item.review_reason}</p>
            </div>
          )}

          {/* フィードバックボタン */}
          {/* <div>
            <button 
              className="border rounded-2xl hover:cursor-pointer bg-red-300"
              onClick={() => handleFeedback}
            >
              間違っている
            </button>
          </div> */}
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// メインコンポーネント
// ---------------------------------------------------------------------------

type View = 'dashboard' | 'party';

export function AdministrationTracker() {
  const { elections, isLoading: electionsLoading, isError: electionsError } = useElections();

  const [selectedElectionId, setSelectedElectionId] = useState<number | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [selectedPartyId, setSelectedPartyId] = useState<number | null>(null);
  const [activeStatus, setActiveStatus] = useState<FinalStatus | null>(null);
  const [page, setPage] = useState(1);
  const [selectedPledge, setSelectedPledge] = useState<PledgeTrackerItem | null>(null);

  // 初回ロード時に最新の選挙を選択
  useEffect(() => {
    if (elections.length > 0 && selectedElectionId === null) {
      setSelectedElectionId(elections[0].id);
    }
  }, [elections, selectedElectionId]);

  const election = elections.find((e) => e.id === selectedElectionId) ?? null;
  const selectedParty = election?.parties.find((p) => p.party_id === selectedPartyId) ?? null;
  const adminId = selectedParty?.administration_id ?? null;
  const hasData = adminId !== null;

  const { data, isLoading, isError } = useTracker(
    view === 'party' && hasData
      ? {
          administration: adminId!,
          party_id: selectedPartyId!,
          status: activeStatus ? [activeStatus] : undefined,
          page,
          limit: 20,
        }
      : null
  );

  const openPartyView = (party: ElectionParty) => {
    setSelectedPartyId(party.party_id);
    setView('party');
    setPage(1);
    setActiveStatus(null);
  };

  const backToDashboard = () => {
    setView('dashboard');
    setSelectedPledge(null);
    setActiveStatus(null);
    setPage(1);
  };

  const toggleStatus = (s: FinalStatus) => {
    setActiveStatus((prev) => (prev === s ? null : s));
    setPage(1);
  };

  // ローディング / エラー
  if (electionsLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground text-sm">読み込み中...</p>
      </div>
    );
  }

  if (electionsError || elections.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground text-sm">選挙データの取得に失敗しました</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 sm:p-8 pb-30">
      <div className="max-w-3xl mx-auto">

        {/* ── ヘッダー ── */}
        <div className="mb-6">
          {view === 'party' && (
            <button
              onClick={backToDashboard}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-3 flex items-center gap-1 hover:cursor-pointer"
            >
              ← ダッシュボードに戻る
            </button>
          )}
          <h2 className="text-2xl font-bold tracking-tight">
            {view === 'dashboard' ? '公約トラッカー' : `${selectedParty?.party_name}`}
          </h2>
        </div>

        {/* ── ディスクレーマー ── */}
        <DisclaimerBanner />

        {/* ── 選挙セレクタ ── */}
        <div className="mb-8">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-widest">選挙を選択</p>
          <div className="flex gap-2 flex-wrap">
            {elections.map((e) => (
              <button
                key={e.id}
                onClick={() => {
                  setSelectedElectionId(e.id);
                  setView('dashboard');
                  setSelectedPartyId(null);
                  setPage(1);
                  setActiveStatus(null);
                  setSelectedPledge(null);
                }}
                className={`
                  px-3 py-2 rounded-lg text-sm border transition-all hover:cursor-pointer
                  ${selectedElectionId === e.id
                    ? 'bg-foreground text-background border-transparent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent border-transparent hover:border-border'}
                `}
              >
                {e.label}
              </button>
            ))}
          </div>
        </div>

        {/* ダッシュボードビュー */}
        {view === 'dashboard' && election && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              {election.label} — 政党別 達成状況
            </p>
            {election.parties.map((party) => (
              <PartyDashboardCard
                key={party.party_id}
                party={party}
                onClick={() => {
                  if (party.administration_id !== null) openPartyView(party);
                }}
              />
            ))}

            {election.parties.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-muted-foreground text-sm">
                  {election.label}の公約データはまだ準備中です
                </p>
                <p className="text-muted-foreground/50 text-xs mt-2">順次追加予定です</p>
              </div>
            )}

            {election.parties.length > 0 && election.parties.every((p) => p.administration_id === null) && (
              <div className="py-16 text-center">
                <p className="text-muted-foreground text-sm">
                  {election.label}の公約データはまだ準備中です
                </p>
                <p className="text-muted-foreground/50 text-xs mt-2">順次追加予定です</p>
              </div>
            )}
          </div>
        )}

        {/* 政党詳細ビュー（公約一覧） */}
        {view === 'party' && hasData && (
          <>
            {data && (
              <div className="flex gap-2 flex-wrap mb-6">
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
                    該当する公約がありません
                  </p>
                ) : (
                  <div className="border-t border-border/50">
                    {data.items.map((item) => (
                      <PledgeRow
                        key={item.pledge_id}
                        item={item}
                        onClick={() => setSelectedPledge(item)}
                      />
                    ))}
                  </div>
                )}

                {Math.ceil(data.total / data.limit) > 1 && (
                  <div className="flex items-center justify-between mt-8 text-xs text-muted-foreground">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="hover:text-foreground hover:cursor-pointer disabled:opacity-20 transition-colors"
                    >
                      ← 前
                    </button>
                    <span className="tabular-nums">
                      {page} / {Math.ceil(data.total / data.limit)}
                      <span className="ml-2 opacity-50">({data.total}件)</span>
                    </span>
                    <button
                      disabled={page >= Math.ceil(data.total / data.limit)}
                      onClick={() => setPage((p) => p + 1)}
                      className="hover:text-foreground hover:cursor-pointer disabled:opacity-20 transition-colors"
                    >
                      次 →
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {view === 'party' && !hasData && (
          <div className="py-24 text-center">
            <p className="text-muted-foreground text-sm">この政党の公約データはまだ準備中です</p>
          </div>
        )}
      </div>

      {/* 詳細パネル（右スライドイン） */}
      {selectedPledge && (
        <DetailPanel
          item={selectedPledge}
          onClose={() => setSelectedPledge(null)}
        />
      )}
    </div>
  );
}