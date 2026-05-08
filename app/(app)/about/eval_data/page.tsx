'use client';

import { useRouter } from 'next/navigation';
import { ExternalLink } from 'lucide-react';

const PARTIES = [
  { name: "自民党", label: "政権公約2026", url: "https://www.jimin.jp/election/results/sen_shu51/political_promise/search/" },
  { name: "中道改革連合", label: "2026衆院選主要政策", url: "https://craj.jp/election2026/policies/" },
  { name: "日本維新の会", label: "維新八策2026 個別政策集", url: "https://o-ishin.jp/policy/8saku2026.html" },
  { name: "国民民主党", label: "政策各論インデックス", url: "https://new-kokumin.jp/policies/specifics" },
  { name: "日本共産党", label: "重点政策", url: "https://www.jcp.or.jp/web_policy/16323.html#juuten" },
  { name: "れいわ新選組", label: "マニフェスト", url: "https://shu51.reiwa-shinsengumi.com/" },
  { name: "参政党", label: "参政党の政策2026", url: "https://sanseito.jp/political_measures_2026/" },
  { name: "日本保守党", label: "日本保守党の重点政策項目", url: "https://hoshuto.jp/policy/" },
  { name: "社民党", label: "第51回衆議院選挙 公約", url: "https://sdp.or.jp/2026manifesto/" },
] as const;

const PENDING_PARTIES = [
  { name: "チームミライ" },
  { name: "減税日本・ゆうこく連合" },
] as const;

const STATUS_DEFINITIONS = [
  { label: "達成", description: "法案が成立し、かつ公約の主要要素をカバーしている。" },
  { label: "進行中", description: "関連法案はあるが、まだ成立していない（審議中など）。" },
  { label: "一部達成", description: "法案は成立したが、公約の一部しかカバーしていない。" },
  { label: "未着手", description: "関連する法案自体が存在しない。" },
  { label: "逆行", description: "公約と逆方向の法案。" },
] as const;

export default function AboutDataPage() {
  const router = useRouter();

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-16">

        {/* 戻るボタン */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center px-4 py-2.5 rounded-lg text-sm border hover:bg-accent hover:cursor-pointer transition-colors"
        >
          戻る
        </button>

        {/* ── 公約データについて ── */}
        <section className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">公約データについて</h1>
          <div className="space-y-3 text-base text-muted-foreground leading-relaxed">
            <p>
              当サイトでは、原則として各党の公式サイトで公開されている当該選挙の公約のうち、「最も詳細に記された政策集（分野別政策集など）」をソースとしています。
            </p>
            <p>
              現在は、サービスをいち早くお届けし、各党の比較を迅速に可能にするため、
              <span className="font-medium text-foreground">一部の政党については暫定的に「重点政策」から抽出したデータを採用しています。</span>
            </p>
            <p>
              公約のデータを利用しやすい形に整形をする時、具体的な実行策を表現する「〇〇をします。」で終わる、もしくはそれに近しい文章ごとに分けて保存をしていますが、そうではない不適な形で利用されているかもしれません。もしそういったデータやそれ以外に修正すべき箇所がありましたら下記のアドレスにお問い合わせをお願いします。
            </p>
          </div>
        </section>

        {/* ── 円グラフの割合について ── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">円グラフの割合について</h2>
          <div className="space-y-3 text-base text-muted-foreground leading-relaxed">
            <p>割合の算出方法は以下のとおりです。</p>
            <div className="rounded-lg border bg-card p-4">
              <p className="font-mono text-sm text-foreground">党が達成した公約の数 ÷ 党のその年の公約の数 × 100</p>
            </div>
            <p>
              現在はこのような非常にシンプルな方式で算出しています。将来的には、例えば与党政党は達成した公約の数で、野党は提出した法案の数など、異なる算出方法も検討していますが、現状の方式で継続していきます。
            </p>
          </div>
        </section>

        {/* ── 評価について ── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">評価について</h2>
          <div className="rounded-lg border bg-card p-4 divide-y divide-border">
            {STATUS_DEFINITIONS.map((item, i) => (
              <div key={item.label} className={`${i > 0 ? 'pt-3' : ''} ${i < STATUS_DEFINITIONS.length - 1 ? 'pb-3' : ''}`}>
                <h3 className="text-sm font-bold">{item.label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1 pl-3.5">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
          <p
            className="text-sm text-muted-foreground"
          >
            ※具体的に使用しているプロンプトは準備ができ次第掲載します
          </p>
        </section>

        {/* ── 各政党と使用データ ── */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight border-b pb-3">
            2026年衆院選における、各政党と使用データ
          </h2>

          <div className="space-y-3 px-2">
            {PARTIES.map((party) => (
              <div key={party.name} className="flex items-baseline gap-2">
                <span className="text-base min-w-[140px] flex-shrink-0">{party.name}</span>
                <span className="text-muted-foreground">：</span>
                <a
                  href={party.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-primary hover:underline inline-flex items-center gap-1"
                >
                  {party.label}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}

            {PENDING_PARTIES.map((party) => (
              <div key={party.name} className="flex items-baseline gap-2">
                <span className="text-base min-w-[140px] flex-shrink-0">{party.name}</span>
                <span className="text-muted-foreground">：</span>
                <span className="text-base text-muted-foreground">データ取得中</span>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            ※ 記載のデータは、順次より詳細なものへと更新作業を進めてまいります。
          </p>
        </section>

        {/* ── 問い合わせ ── */}
        <section className="pt-8 border-t space-y-2">
          <h2 className="text-sm font-bold text-muted-foreground tracking-wider">問い合わせ</h2>
          <p className="text-sm">politiki.contact@gmail.com</p>
        </section>

      </div>
    </div>
  );
}