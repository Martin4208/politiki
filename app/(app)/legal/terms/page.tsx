'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
  const router = useRouter();

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Back */}
        <button
          onClick={() => router.push('/about')}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-3 h-3" />
          アプリについて
        </button>

        <h1 className="text-3xl font-bold tracking-tight mb-2">利用規約</h1>
        <p className="text-xs text-muted-foreground mb-10">最終更新日: 2026年4月8日</p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed pb-16">

          {/* 1 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">第1条（適用）</h2>
            <p>
              本利用規約（以下「本規約」）は、POLITIKI運営者（以下「運営者」）が提供するWebサービス「POLITIKI」（以下「本サービス」）の利用に関する条件を定めるものです。
              ユーザーは本サービスを利用することにより、本規約に同意したものとみなします。
            </p>
          </section>

          {/* 2 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">第2条（サービスの内容）</h2>
            <p>本サービスは以下の機能を提供します。</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>政権の公約達成度に関するAI評価の閲覧</li>
              {/* <li>政治的スタンスの診断</li>
              <li>政党・財政に関する情報の閲覧</li>
              <li>その他運営者が提供する機能</li> */}
            </ul>
          </section>

          {/* 3 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">第3条（AI評価に関する免責）</h2>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>
                本サービスにおける公約達成度のスコア及び評価は、AIによる自動分析の結果であり、
                その正確性、完全性、網羅性、最新性を保証するものではありません。
              </li>
              <li>
                AI評価は公開情報（国会議事録、法案本文、各政党の公式発表等）を基にしていますが、
                解釈の相違や情報の欠落が含まれる可能性があります。
              </li>
              <li>
                ユーザーは本サービスの情報のみに依拠して政治的判断を行うことなく、
                必ず原文資料を自らご確認ください。
              </li>
            </ol>
          </section>

          {/* 4 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">第4条（政治的中立性）</h2>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>
                本サービスは特定の政党、候補者、政策を推薦、支持、または批判することを目的としていません。
              </li>
              <li>
                すべての評価はアルゴリズムに基づいて自動的に生成されており、
                運営者の政治的立場を反映するものではありません。
              </li>
            </ol>
          </section>

          {/* 5 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">第5条（禁止事項）</h2>
            <p>ユーザーは以下の行為を行ってはなりません。</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>本サービスの情報を、特定の政党・候補者の選挙運動に直接利用すること（公職選挙法に抵触する行為）</li>
              <li>本サービスのデータをスクレイピング等で大量に取得し、運営者の許可なく再配布すること</li>
              <li>本サービスのAI評価を、あたかも公式な政府評価であるかのように表示・引用すること</li>
              <li>本サービスのネットワーク・システムへの不正アクセス</li>
              <li>法令または公序良俗に反する行為</li>
              <li>本サービスのデータの無断転載・再販</li>
            </ol>
          </section>

          {/* 6 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">第6条（知的財産権）</h2>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>
                本サービスのUI、デザイン、ソフトウェア、評価アルゴリズムに関する知的財産権は運営者に帰属します。
              </li>
              <li>
                本サービスが利用する公的データ（国会議事録、法案本文等）の著作権は各権利者に帰属します。
              </li>
            </ol>
          </section>

          {/* 7 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">第7条（サービスの変更・停止）</h2>
            <p>
              運営者は、事前の通知なく本サービスの内容を変更、または提供を一時的もしくは永続的に停止できるものとします。
              これによりユーザーに生じた損害について、運営者は一切の責任を負いません。
            </p>
          </section>

          {/* 8 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">第8条（免責事項）</h2>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>
                本サービスは現状有姿（AS IS）で提供されます。
                運営者は本サービスの利用により生じたいかなる損害についても責任を負いません。
              </li>
              <li>
                本サービスは現在ベータ版であり、機能やデータに不完全な部分があります。
              </li>
              <li>
                本トラッカーの公約データは、自由民主党の『政策BANK』を基盤としています。
              </li>
              <li>
                第1次および第2次高内閣の公約を統合し、一つの連続した政権運営として達成度を算出しています。
              </li>
            </ol>
          </section>

          {/* 9 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">第9条（規約の変更）</h2>
            <p>
              運営者は本規約を随時変更できるものとします。
              変更後の規約は本サービス上に掲示した時点で効力を生じます。
              変更後に本サービスを利用した場合、変更後の規約に同意したものとみなします。
            </p>
          </section>

          {/* 10 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">第10条（準拠法・管轄）</h2>
            <p>
              本規約は日本法に準拠し、本サービスに関する紛争については東京地方裁判所を第一審の専属的合意管轄裁判所とします。
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
