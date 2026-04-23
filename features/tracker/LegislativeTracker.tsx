'use client';

import { useState } from 'react';

const sessions = [
  { id: '215', name: '第215回国会（臨時会）', period: '2025年10月 - 2025年12月', type: '臨時' },
  { id: '214', name: '第214回国会（通常会）', period: '2025年1月 - 2025年6月', type: '通常' },
  { id: '213', name: '第213回国会（通常会）', period: '2024年1月 - 2024年6月', type: '通常' },
  { id: '212', name: '第212回国会（臨時会）', period: '2023年10月 - 2023年12月', type: '臨時' },
  { id: '211', name: '第211回国会（通常会）', period: '2023年1月 - 2023年6月', type: '通常' },
];

export function LegislativeTracker() {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  return (
    <div className="h-full overflow-y-auto p-8 pb-30">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">立法トラッカー</h2>
          <p className="text-sm text-muted-foreground mt-1">
            国会での法案審議の進捗と結果を追跡。
          </p>
        </div>

        {/* Session selector */}
        <div className="mb-8">
          <p className="text-xs text-muted-foreground mb-3 uppercase tracking-widest">国会会期を選択</p>
          <div className="space-y-2">
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSession(s.id)}
                className={`
                  w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm border transition-all text-left
                  ${selectedSession === s.id
                    ? 'bg-black text-white dark:bg-white dark:text-black border-transparent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent border-transparent hover:border-border'}
                `}
              >
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className={`text-xs mt-0.5 ${
                    selectedSession === s.id ? 'opacity-60' : 'text-muted-foreground'
                  }`}>{s.period}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  s.type === '通常'
                    ? selectedSession === s.id ? 'bg-white/20' : 'bg-muted'
                    : selectedSession === s.id ? 'bg-white/20' : 'bg-muted'
                }`}>
                  {s.type}
                </span>
              </button>
            ))}
          </div>
        </div>

        {!selectedSession && (
          <div className="py-24 text-center text-muted-foreground text-sm">
            国会会期を選択してください
          </div>
        )}

        {selectedSession && (
          <div className="space-y-6">
            {/* 法案概要 */}
            <div className="p-4 rounded-xl border">
              <h3 className="font-bold text-sm mb-2">提出法案</h3>
              <p className="text-xs text-muted-foreground">
                内閣提出法案・議員立法の提出状況と審議進捗。
              </p>
              <div className="mt-4 py-8 text-center text-muted-foreground/50 text-xs border border-dashed rounded-lg">
                データ準備中
              </div>
            </div>

            {/* 採決結果 */}
            <div className="p-4 rounded-xl border">
              <h3 className="font-bold text-sm mb-2">採決結果</h3>
              <p className="text-xs text-muted-foreground">
                各法案の採決結果と各党の賛否。
              </p>
              <div className="mt-4 py-8 text-center text-muted-foreground/50 text-xs border border-dashed rounded-lg">
                データ準備中
              </div>
            </div>

            {/* 委員会活動 */}
            {/* <div className="p-4 rounded-xl border">
              <h3 className="font-bold text-sm mb-2">委員会活動</h3>
              <p className="text-xs text-muted-foreground">
                各委員会の開催状況と主要な審議テーマ。
              </p>
              <div className="mt-4 py-8 text-center text-muted-foreground/50 text-xs border border-dashed rounded-lg">
                データ準備中
              </div>
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
}
