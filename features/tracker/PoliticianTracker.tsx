'use client';

import { useState } from 'react';
import { parties } from '@/lib/parties';

// 主要政治家データ（公約追跡対象）
const politicians = [
  { id: 'takaichi_sanae', name: '高市早苗', party_id: 'ldp', role: '内閣総理大臣', image: null },
  { id: 'ishiba_shigeru', name: '石破茂', party_id: 'ldp', role: '前内閣総理大臣', image: null },
  { id: 'noda_yoshihiko', name: '野田佳彦', party_id: 'cra', role: '中道改革連合代表', image: null },
  { id: 'baba_yoshihiko', name: '馬場伸幸', party_id: 'jrp', role: '日本維新の会代表', image: null },
  { id: 'tamaki_yuichiro', name: '玉木雄一郎', party_id: 'dpfp', role: '国民民主党代表', image: null },
  { id: 'shii_kazuo', name: '志位和夫', party_id: 'jcp', role: '日本共産党議長', image: null },
  { id: 'yamamoto_taro', name: '山本太郎', party_id: 'reiwa', role: 'れいわ新選組代表', image: null },
  { id: 'kamikawa_yoko', name: '上川陽子', party_id: 'ldp', role: '元外務大臣', image: null },
  { id: 'koizumi_shinjiro', name: '小泉進次郎', party_id: 'ldp', role: '元環境大臣', image: null },
];

export function PoliticianTracker() {
  const [selectedPolitician, setSelectedPolitician] = useState<string | null>(null);

  const selected = selectedPolitician
    ? politicians.find((p) => p.id === selectedPolitician)
    : null;
  const party = selected ? parties.find((p) => p.id === selected.party_id) : null;

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">政治家トラッカー</h2>
          <p className="text-sm text-muted-foreground mt-1">
            主要政治家の発言・公約の一貫性を追跡。
          </p>
        </div>

        {/* Politician grid */}
        <div className="mb-8">
          <p className="text-xs text-muted-foreground mb-3 uppercase tracking-widest">政治家を選択</p>
          <div className="grid grid-cols-2 gap-2">
            {politicians.map((pol) => {
              const p = parties.find((pp) => pp.id === pol.party_id);
              return (
                <button
                  key={pol.id}
                  onClick={() => setSelectedPolitician(pol.id)}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-lg text-sm border transition-all text-left
                    ${selectedPolitician === pol.id
                      ? 'bg-black text-white dark:bg-white dark:text-black border-transparent'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent border-transparent hover:border-border'}
                  `}
                >
                  {/* Avatar placeholder */}
                  <div
                    className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: p?.color ?? '#888',
                      color: '#fff',
                    }}
                  >
                    {pol.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{pol.name}</p>
                    <p className={`text-xs truncate ${
                      selectedPolitician === pol.id ? 'opacity-60' : 'text-muted-foreground'
                    }`}>
                      {pol.role}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {!selected && (
          <div className="py-24 text-center text-muted-foreground text-sm">
            政治家を選択してください
          </div>
        )}

        {selected && (
          <>
            {/* Politician detail */}
            <div className="mb-8 p-4 rounded-xl border bg-muted/30">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: party?.color ?? '#888', color: '#fff' }}
                >
                  {selected.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold">{selected.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {party?.shortName} · {selected.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Tracking sections */}
            <div className="space-y-6">
              {/* 発言の一貫性 */}
              <div className="p-4 rounded-xl border">
                <h3 className="font-bold text-sm mb-2">発言の一貫性</h3>
                <p className="text-xs text-muted-foreground">
                  国会答弁・メディア出演での発言を時系列で追跡し、一貫性を評価します。
                </p>
                <div className="mt-4 py-8 text-center text-muted-foreground/50 text-xs border border-dashed rounded-lg">
                  データ準備中
                </div>
              </div>

              {/* 投票行動 */}
              <div className="p-4 rounded-xl border">
                <h3 className="font-bold text-sm mb-2">投票行動</h3>
                <p className="text-xs text-muted-foreground">
                  法案への賛否と、所属政党の方針との一致率を分析します。
                </p>
                <div className="mt-4 py-8 text-center text-muted-foreground/50 text-xs border border-dashed rounded-lg">
                  データ準備中
                </div>
              </div>

              {/* 出席率 */}
              <div className="p-4 rounded-xl border">
                <h3 className="font-bold text-sm mb-2">国会出席率</h3>
                <p className="text-xs text-muted-foreground">
                  本会議・委員会への出席状況を追跡します。
                </p>
                <div className="mt-4 py-8 text-center text-muted-foreground/50 text-xs border border-dashed rounded-lg">
                  データ準備中
                </div>
              </div>

              {/* 政治資金 */}
              <div className="p-4 rounded-xl border">
                <h3 className="font-bold text-sm mb-2">政治資金</h3>
                <p className="text-xs text-muted-foreground">
                  政治資金収支報告書に基づく資金の流れを可視化します。
                </p>
                <div className="mt-4 py-8 text-center text-muted-foreground/50 text-xs border border-dashed rounded-lg">
                  データ準備中
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
