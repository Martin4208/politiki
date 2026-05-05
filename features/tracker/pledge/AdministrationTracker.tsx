'use client';

import { useState, useEffect, useRef } from 'react';

import { useTracker } from '../hooks/useTracker';
import { useElections } from '../hooks/useElections';
import type { ElectionParty } from '../hooks/useElections';
import { STATUS, ALL_STATUSES } from './constants/status';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { PartyDashboardCard } from './components/PartyDashboardCard';
import { PledgeRow } from './components/PledgeRow';
import { DetailPanel } from './components/DetailPanel';
import { SearchFilter } from './components/SearchFilter';
import type { View } from './types';
import type { PledgeTrackerItem, FinalStatus } from '@/app/api/tracker/route';
import { administrations } from '@/lib/administrations';

// ---------------------------------------------------------------------------
// メインコンポーネント
// ---------------------------------------------------------------------------
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

  // party詳細ビュー: administration_id があればそれも使う、なければ party_id だけ
  const partyDetailFilter =
    view === 'party' && selectedPartyId !== null
      ? {
          ...(adminId != null ? { administration: adminId } : {}),
          party_id: selectedPartyId,
          status: activeStatus ? [activeStatus] : undefined,
          page,
          limit: 20,
        }
      : null;

  const { data, isLoading, isError } = useTracker(partyDetailFilter);

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

  const containerRef = useRef<HTMLDivElement>(null);

  const changePage = (newPage: number) => {
    setPage(newPage);
    containerRef.current?.scroll({ top: 0, behavior: 'smooth' });
  }

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
    <div ref={containerRef} className="h-full overflow-y-auto p-6 sm:p-8 pb-30">
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
            {elections
              .filter((e) => e.id === 1)
              .map((e) => (
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
            {election.parties
              .filter((party) => !["立憲民主党（新）", "公明党"].includes(party.party_name))
              .sort((a, b) => {
                const aHasAdmin = a.administration_id != null ? 1 : 0;
                const bHasAdmin = b.administration_id != null ? 1 : 0;
                if (bHasAdmin !== aHasAdmin) return bHasAdmin - aHasAdmin;
              })
              .map((party) => (
                <PartyDashboardCard
                  key={party.party_id}
                  party={party}
                  onClick={() => openPartyView(party)}
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
          </div>
        )}

        {/* 政党詳細ビュー（公約一覧） */}
        {view === 'party' && (
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

            {/* 検索・タグフィルタリング */}
            {/* {data && <SearchFilter />} */}

            {data && !isLoading && (
              <>
                {data.items.length === 0 && data.total === 0 ? (
                  <p className="py-24 text-center text-muted-foreground text-sm">
                    この政党の公約データはまだありません
                  </p>
                ) : data.items.length === 0 ? (
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
                      onClick={() => changePage(page - 1)}
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
                      onClick={() => changePage(page + 1)}
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
      </div>

      {/* 詳細パネル（右スライドイン） */}
      {selectedPledge && (
        <DetailPanel
          item={selectedPledge}
          onClose={() => setSelectedPledge(null)}
        />
      )}
      
      {/* アジャスト用スペーサー：スマホのツールバー等で隠れる分を強制的に確保 */}
      <div className="h-40 w-full" aria-hidden="true" />
    </div>
  );
}