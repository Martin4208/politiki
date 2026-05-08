'use client'

// ---------------------------------------------------------------------------
// 詳細パネル（右スライドイン）
// ---------------------------------------------------------------------------
import { useEffect, useRef } from 'react';
import { STATUS } from '../constants/status';
import type { PledgeTrackerItem } from '@/app/api/tracker/route';

export function DetailPanel({
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
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors hover:cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-6 space-y-8">
          {/* カテゴリ */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-widest">カテゴリ</p>
            <span className="text-sm px-3 py-1 rounded-full bg-accent text-foreground">
              {item.category}
            </span>
          </div>

          {/* 公約全文 */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-widest">公約</p>
            <p className="text-sm leading-relaxed">{item.pledge_text}</p>
          </div>

          {/* スコアバー */}
          {/* <div>
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-widest">達成スコア</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-muted relative overflow-hidden rounded-full">
                <div
                  className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
                    item.summary.best_score >= 80
                      ? 'bg-emerald-400'
                      : item.summary.best_score >= 50
                        ? 'bg-amber-400'
                        : item.summary.best_score >= 20
                          ? 'bg-rose-400'
                          : 'bg-zinc-500'
                  }`}
                  style={{ width: `${item.summary.best_score}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground tabular-nums font-medium">
                {item.summary.best_score}%
              </span>
            </div>
          </div> */}

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
              <p className="text-xs text-muted-foreground mb-3 uppercase tracking-widest">関連法案</p>
              <ul className="space-y-2">
                {item.sources.map((src, i) => (
                  <li key={i}>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors flex items-center gap-1.5"
                    >
                      {/* <span className="inline-block w-1 h-1 rounded-full bg-sky-400/50 shrink-0" /> */}
                        {src.label}
                      <span className="opacity-50">↗</span>
                      {src.is_best && <span className="text-[10px] ml-1 opacity-70">★ 最関連</span>}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 検証不能要素（法案では判断できない要素） */}
          {item.unverifiable_elements && item.unverifiable_elements.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-3 uppercase tracking-widest">
                法案では検証できない要素
              </p>
              <ul className="space-y-2">
                {item.unverifiable_elements.map((el, i) => (
                  <li key={i} className="text-sm flex gap-2 items-start">
                    <span className="text-zinc-400 mt-0.5 shrink-0">？</span>
                    <span className="leading-relaxed text-muted-foreground">{el}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[10px] text-muted-foreground/40 mt-2">
                ※ これらの要素は運用・外交等に関するもので、法案テキストからは評価できません。
                スコアの算出には含まれていません。
              </p>
            </div>
          )}

          {/* needs_review */}
          {item.needs_review && item.review_reason && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="text-xs text-amber-500 font-medium mb-1">⚠ 間違っている可能性があります</p>
              <p className="text-xs text-amber-500/70 leading-relaxed">{item.review_reason}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}