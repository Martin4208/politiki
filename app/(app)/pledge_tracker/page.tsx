'use client';

import { useState, useEffect, useRef } from 'react';
import { AdministrationTracker } from '@/features/tracker/pledge/AdministrationTracker';


// Modal
const STORAGE_KEY = 'pledge-tracker-storage-key'

function Modal({ onClose }: { onClose: () => void }) {
  const [closing, setClosing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // モーダルが開いたらフォーカスを移動
  useEffect(() => {
    const btn = modalRef.current?.querySelector('button');
    btn?.focus();
  }, []);

  // 背後の要素をinertにする
  useEffect(() => {
    const mainContent = document.getElementById('main-layout');
    if (mainContent) {
      mainContent.setAttribute('inert', '');
      return () => mainContent.removeAttribute('inert');
    }
  }, []);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, 'true');
      onClose();
    }, 200);
  };

    return (
    <div
      ref={modalRef}
      className={`
        fixed inset-0 z-100 flex items-center justify-center
        p-2 sm:p-4
        transition-opacity duration-200
        ${closing ? 'opacity-0' : 'opacity-100'}
      `}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div
        className={`
          relative w-full max-w-lg bg-background border border-border
          rounded-2xl shadow-2xl overflow-hidden
          max-h-[90vh] overflow-y-auto
          transition-all duration-200
          ${closing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
        `}
      >
        {/* ヘッダー */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
          <h2 className="text-xl font-bold tracking-tight">
            公約トラッカーへようこそ
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            ご利用前に以下をご確認ください
          </p>
        </div>

        {/* 本文 */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 sm:space-y-4">

          <p className="text-sm text-muted-foreground leading-relaxed">
            本サービスは、各政党の選挙公約が国会に提出された法案によって
            どの程度実現されているかをAIで自動評価するものです。
            現在ベータ版として公開しており、以下の点についてご了承のうえご利用ください。
          </p>

          {/* データの範囲 */}
          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 space-y-2">
            <p className="text-xs font-semibold text-foreground">データの範囲について</p>
            <ul className="space-y-1.5">
              <li className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                <span className="shrink-0 mt-0.5">•</span>
                <span>
                  現在、<span className="font-medium text-foreground">2024年 第50回衆議院議員総選挙</span>までのデータを掲載しています。
                  新しい選挙や国会会期のデータは随時追加していきます。
                </span>
              </li>
              <li className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                <span className="shrink-0 mt-0.5">•</span>
                <span>
                  掲載政党は現時点では一部の主要政党に限られており、
                  すべての政党を網羅できておりません。対象政党は順次拡大予定です。
                </span>
              </li>
              <li className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                <span className="shrink-0 mt-0.5">•</span>
                <span>
                  掲載中の政党についても、公約・法案データの収集が完了していない部分があります。
                  こちらも随時追加・更新を行っています。
                </span>
              </li>
            </ul>
          </div>

          {/* AI評価の注意 */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 space-y-2">
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">AI評価の精度について</p>
            <ul className="space-y-1.5">
              <li className="text-xs text-amber-600/80 dark:text-amber-400/80 leading-relaxed flex gap-2">
                <span className="shrink-0 mt-0.5">•</span>
                <span>
                  スコアや評価はAIによる自動判定のため、
                  不正確な評価や見落としが含まれる場合があります。
                </span>
              </li>
              <li className="text-xs text-amber-600/80 dark:text-amber-400/80 leading-relaxed flex gap-2">
                <span className="shrink-0 mt-0.5">•</span>
                <span>
                  公約データの中に、公約として適切でない内容が混在している可能性があります。
                  これらは発見次第修正しています。
                </span>
              </li>
            </ul>
          </div>

          {/* フィードバック */}
          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              評価の誤りやデータの不備を発見された場合は、
              <a
                href="mailto:politiki.contact@gmail.com"
                className="text-sky-500 hover:text-sky-400 underline underline-offset-2 transition-colors"
              >
                politiki.contact@gmail.com
              </a>
              {' '}までご連絡いただけますと幸いです。
              皆さまのフィードバックをもとに改善を進めてまいります。
            </p>
          </div>
        </div>

        {/* フッター */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <button
            onClick={handleClose}
            className="
              w-full py-3 rounded-xl text-sm font-medium
              bg-foreground text-background
              hover:opacity-90 active:scale-[0.98]
              transition-all duration-150 cursor-pointer
            "
          >
            了承して利用する
          </button>
        </div>
      </div>
    </div>
  );
}

const TABS = [
  {
    group: '公約',
    items: [
      { id: 1, label: '公約トラッカー'},
    ],
  },
];

export default function PledgeTrackerPage() {
  const [activeId, setActiveId] = useState(1);
  const [showIntro, setShowIntro] = useState(false);
 
  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      setShowIntro(true);
    }
  }, []);


  return (
    <div className="h-screen overflow-hidden flex">
      <div id="main-layout" className="contents">
        {/* Sidebar */}
        <div className="hidden sm:flex w-48 shrink-0 border-r flex-col bg-background">
          <nav className="flex-1 px-3 py-4 space-y-5">
            {TABS.map((group) => (
              <div key={group.group}>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveId(item.id)}
                      className={`
                        w-full flex flex-col items-start gap-1 px-4 py-3 rounded-lg cursor-pointer
                        text-left transition-all duration-200
                        ${activeId === item.id
                          ? 'bg-foreground text-background shadow-md scale-[1.02]' // 選択時に少し大きく
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'}
                      `}
                    >
                      <span className="text-base font-bold leading-tight">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {activeId === 1 && <AdministrationTracker />}
        </div>
      </div>
      
      {/* Modal */}
      {showIntro && <Modal onClose={() => setShowIntro(false)} />}
    </div>
  );
}