'use client';

import { useRouter } from 'next/navigation';
import { ExternalLink } from 'lucide-react';

export default function AboutDataPage() {
  const router = useRouter();

  return (
    <div className="h-full overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-12 space-y-12">
            
            <button
            onClick={() => router.push('/')}
            className="flex items-center px-4 py-2.5 rounded-lg text-sm border hover:bg-accent hover:cursor-pointer transition-colors"
            >
            戻る
            </button>

            {/* Hero */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">公約データについて</h1>
                <p className="text-base text-muted-foreground leading-relaxed">
                    当サイトでは、原則として各党の公式サイトで公開されている当該選挙の公約のうち、「最も詳細に記された政策集（分野別政策集など）」をソースとしています。
                </p>
                <p className="text-base text-muted-foreground leading-relaxed">
                    現在は、サービスをいち早くお届けし、各党の比較を迅速に可能にするため、<span className="font-medium">一部の政党については暫定的に「重点政策」から抽出したデータを採用しています。</span>
                </p>
                <p className="text-base text-muted-foreground leading-relaxed">
                    公約のデータを利用しやすい形に整形をする時、具体的な実行策を表現する「〇〇をします。」で終わる、もしくはそれに近しい文章ごとに分けて保存をしていますが、そうではない不適な形で利用されているかもしれません。もしそういったデータやそれ以外に修正すべき箇所がありましたら下記のアドレスにお問い合わせをお願いします。
                </p>
            </div>

            {/* New Section: Data Strategy & Status / 公約データ対応状況 */}
            <section className="space-y-6">
          <div className="space-y-2">
            <p className="text-lg font-medium border-b pb-2">
              2026年衆院選における、各政党と使用データ
            </p>
          </div>
          <div className="space-y-4 px-2">
            <div className="flex flex-col space-y-4">
              
              {/* 各政党リスト */}
              {[
                { name: "自民党", label: "政権公約2026", url: "https://www.jimin.jp/election/results/sen_shu51/political_promise/search/" },
                { name: "中道改革連合", label: "2026衆院選主要政策", url: "https://craj.jp/election2026/policies/" },
                { name: "日本維新の会", label: "維新八策2026 個別政策集", url: "https://o-ishin.jp/policy/8saku2026.html" },
                { name: "国民民主党", label: "政策各論インデックス", url: "https://new-kokumin.jp/policies/specifics" },
                { name: "日本共産党", label: "重点政策", url: "https://www.jcp.or.jp/web_policy/16323.html#juuten" },
                { name: "れいわ新選組", label: "マニフェスト", url: "https://shu51.reiwa-shinsengumi.com/" },
                { name: "参政党", label: "参政党の政策2026", url: "https://sanseito.jp/political_measures_2026/" },
                { name: "日本保守党", label: "日本保守党の重点政策項目", url: "https://hoshuto.jp/policy/" },
                { name: "社民党", label: "第51回衆議院選挙 公約", url: "https://sdp.or.jp/2026manifesto/" },
              ].map((party) => (
                <div key={party.name} className="flex items-baseline gap-2">
                  <span className="text-lg min-w-[140px] flex-shrink-0">{party.name}</span>
                  <p className="text-lg">
                    ： <a 
                            href={party.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1 relative z-10"
                        >
                            {party.label}
                            <ExternalLink className="w-4 h-4" />
                        </a>
                  </p>
                </div>
              ))}

              {/* データ取得中の政党 */}
              {[
                { name: "チームミライ", status: "データ取得中" },
                { name: "減税日本・ゆうこく連合", status: "データ取得中" },
              ].map((party) => (
                <div key={party.name} className="flex items-baseline gap-2">
                  <span className="text-lg min-w-[140px] flex-shrink-0">{party.name}</span>
                  <p className="text-lg text-muted-foreground">
                    ： {party.status}
                  </p>
                </div>
              ))}

            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4 italic">
            ※ 記載のデータは、順次より詳細なものへと更新作業を進めてまいります。
          </p>
        </section>

            {/* Footer info */}
            <section className="pt-8 border-t space-y-4">
                <div className="flex flex-col gap-2">
                    <h2 className="text-sm font-bold text-muted-foreground tracking-wider">問い合わせ</h2>
                    <p className="text-sm">politiki.contact@gmail.com</p>
                </div>
            </section>

        </div>
    </div>
  );
}