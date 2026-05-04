'use client'

// ---------------------------------------------------------------------------
// ディスクレーマーバナー
// ---------------------------------------------------------------------------
import { useState } from 'react';

export function DisclaimerBanner() {
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
            あくまで参考情報としてご利用ください。各法案のURLは詳細ページの下部にあり、各公約のURLは「データについて」にありますので、ご自身でもご確認をお願いします。
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