'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/stores/quizStore';
import { questions } from '@/lib/quiz/quick/questions';
import { questionReasoning } from '@/lib/quiz/quick/reasoning';
import { categories } from '@/lib/categories';
import { parties } from '@/lib/parties';
import { stances_for_quick_questions } from '@/types/party-stance-data';

const TO_STANCE_ID: Record<string, string> = {
  centrist_reform_alliance: 'cra',
  jrp: 'ishin',
};

const allStances = stances_for_quick_questions[0];

// stance data にキーが存在する政党のみ絞り込み
const STANCE_PARTIES = parties.filter(p => {
  const sid = TO_STANCE_ID[p.id] ?? p.id;
  return sid in allStances;
});

// スタンスごとのスタイル定義
const STANCE_STYLE: Record<number, { label: string; bg: string; text: string; bar: string }> = {
  5: { label: '強く賛成', bg: 'bg-blue-100',  text: 'text-blue-700',  bar: 'bg-blue-500' },
  4: { label: '賛成',     bg: 'bg-blue-50',   text: 'text-blue-600',  bar: 'bg-blue-300' },
  3: { label: 'どちらでもない', bg: 'bg-gray-100', text: 'text-gray-600', bar: 'bg-gray-300' },
  2: { label: '反対',     bg: 'bg-red-50',    text: 'text-red-600',   bar: 'bg-red-300' },
  1: { label: '強く反対', bg: 'bg-red-100',   text: 'text-red-700',   bar: 'bg-red-500' },
};

export default function StanceOnPolicies() {
  const { answers } = useQuizStore();
  const router = useRouter();
  const [selectedCat, setSelectedCat] = useState<string>('all');

  // 質問が存在するカテゴリのみ表示
  const usedCategories = useMemo(() => {
    const ids = new Set(questions.map(q => q.enCategory));
    return categories.filter(c => ids.has(c.id));
  }, []);

  // カテゴリフィルター適用
  const filteredQuestions = useMemo(() => {
    return selectedCat === 'all'
      ? questions
      : questions.filter(q => q.enCategory === selectedCat);
  }, [selectedCat]);

  // 回答済みのカテゴリIDセット
  const answeredCatIds = useMemo(() => {
    const ids = new Set<string>();
    questions.forEach(q => {
      if (answers[String(q.id)] != null) ids.add(q.enCategory);
    });
    return ids;
  }, [answers]);

  const answeredTotal = questions.filter(q => answers[String(q.id)] != null).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">

      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base">政策スタンス</h3>
          {/* <p className="text-xs text-muted-foreground mt-0.5">各質問に対するあなたの立場と理由</p> */}
        </div>
        <div className="text-right">
          <span className="text-sm font-bold tabular-nums">{answeredTotal}</span>
          <span className="text-xs text-muted-foreground"> / {questions.length} 回答済み</span>
        </div>
      </div>

      {/* 未回答の場合 */}
      {answeredTotal === 0 && (
        <div className="border border-dashed rounded-xl p-6 text-center space-y-3">
          <p className="text-sm font-medium">まだ回答がありません</p>
          <p className="text-xs text-muted-foreground">
            「Questions」からクイック診断を始めると、ここに立場が表示されます。
          </p>
          <button
            onClick={() => router.push('/questions/quick')}
            className="text-xs px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            クイック診断を始める
          </button>
        </div>
      )}

      {/* カテゴリフィルター */}
      {answeredTotal > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedCat('all')}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              selectedCat === 'all'
                ? 'bg-black text-white border-black'
                : 'text-muted-foreground hover:text-foreground border-gray-200 hover:border-gray-400'
            }`}
          >
            すべて
          </button>
          {usedCategories.map(cat => {
            if (!answeredCatIds.has(cat.id)) return null;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  selectedCat === cat.id
                    ? 'bg-black text-white border-black'
                    : 'text-muted-foreground hover:text-foreground border-gray-200 hover:border-gray-400'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      )}

      {/* 質問カード一覧 */}
      {answeredTotal > 0 && (
        <div className="space-y-3">
          {filteredQuestions.map(q => {
            const rawAnswer = answers[String(q.id)];
            const answer = rawAnswer as 1 | 2 | 3 | 4 | 5 | undefined;
            const reasoning = answer != null
              ? questionReasoning[q.id]?.find(r => r.stance === answer)
              : undefined;
            const style = answer != null ? STANCE_STYLE[answer] : null;

            // 未回答 & カテゴリ絞り込み中 → スキップ
            if (answer == null && selectedCat !== 'all') return null;

            return (
              <div
                key={q.id}
                className={`border rounded-xl p-4 space-y-2.5 transition-opacity ${
                  answer == null ? 'opacity-35' : ''
                }`}
              >
                {/* 質問文 + スタンスバッジ */}
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium leading-snug flex-1">{q.text}</p>
                  {style ? (
                    <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                      {style.label}
                    </span>
                  ) : (
                    <span className="shrink-0 text-[11px] text-muted-foreground border rounded-full px-2.5 py-0.5">
                      未回答
                    </span>
                  )}
                </div>

                {/* スタンスバー（1〜5 の視覚化） */}
                {answer != null && style && (
                  <div className="space-y-1">
                    <div className="flex gap-0.5 h-1.5">
                      {[1, 2, 3, 4, 5].map(v => (
                        <div
                          key={v}
                          className={`flex-1 rounded-sm transition-colors ${
                            v <= answer ? style.bar : 'bg-gray-100'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* 理由 */}
                {reasoning && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {reasoning.reasoning}
                  </p>
                )}

                {/* 各党スタンス */}
                {answer != null && (
                  <div className="space-y-1 pt-0.5">
                    <p className="text-[10px] text-muted-foreground">各党のスタンス</p>
                    <div className="flex flex-wrap gap-1">
                      {STANCE_PARTIES.map(party => {
                        const sid = TO_STANCE_ID[party.id] ?? party.id;
                        const stance = allStances[sid]?.[q.learnSlug]?.stance;
                        if (stance == null) return null;
                        return (
                          <div key={party.id} className="flex items-center gap-0.5">
                            <span className="text-[9px] text-muted-foreground">{party.shortName}</span>
                            <div className="flex gap-px">
                              {[1, 2, 3, 4, 5].map(v => (
                                <div
                                  key={v}
                                  className="w-1.5 h-1.5 rounded-sm"
                                  style={{
                                    backgroundColor: v <= stance ? party.color : '#e5e7eb',
                                    opacity: v <= stance ? (stance >= 4 ? 1 : 0.7) : 1,
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* カテゴリタグ */}
                <div>
                  <span className="text-[10px] text-muted-foreground/60 bg-muted/40 px-2 py-0.5 rounded">
                    {q.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
