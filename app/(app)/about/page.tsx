'use client';
 
import { useRouter } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
 
export default function AboutPage() {
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
          
          <h1 className="text-3xl font-bold tracking-tight">POLITIKIについて</h1>
        </div>
 
        {/* Mission */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold">目標</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            当サイトは、各党の公約と実際に提出されている法案を比較することで、どの程度公約が実現されているかを確認できるサイトです。
          </p>
        </section>

        {/* Citations / データ引用元 */}
        <section className="space-y-4">
            <h2 className="text-lg font-bold">引用</h2>
            <div className="grid grid-cols-1 gap-3">
                <a 
                    href="https://www.kantei.go.jp/jp/rekidainaikaku/index.html"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent transition-colors"
                >
                    <p className="text-sm font-medium">歴代内閣</p>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </a>
                <a 
                    href="https://www.shugiin.go.jp/internet/itdb_gian.nsf/html/gian/menu.htm"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent transition-colors"
                >
                    <p className="text-sm font-medium">法案データ</p>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </a>
            </div>
        </section>
 
        {/* Features */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold">主な機能</h2>
          <div className="space-y-3">
            <div className="p-4">
              <h3 className="font-bold text-sm">公約トラッカー</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                政権の公約と国会に提出された法案をAIが照合し、達成度をスコア化。
                達成・部分達成・未着手・逆行の4段階で評価し、根拠を併記します。
              </p>
              <button
                onClick={() => router.push('/about/evaluation')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm border hover:bg-accent transition-colors hover:cursor-pointer"
              >
               ↳評価について
              </button>
            </div>
            {/* <div className="p-4 rounded-xl border">
              <h3 className="font-bold text-sm">政治診断</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                質問に答えることで、あなたの政治的スタンスを可視化。
                各政党との類似度がわかります。
              </p>
            </div>
            <div className="p-4 rounded-xl border">
              <h3 className="font-bold text-sm">政党・財政データ</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                各政党の基本情報、政策スタンス、国の財政データをわかりやすく整理。
              </p>
            </div> */}
          </div>
        </section>

        {/* Disclaimer / 免責事項 */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold">免責事項</h2>
          <div className="p-4  bg-card space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                利用者の自己責任について
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed pl-3.5">
                本サービスのご利用により生じた損害について、当サイト管理者は一切の責任を負いません。
                提供される情報の正確性や妥当性についてはご自身で判断し、自己の責任においてご利用ください。
              </p>
            </div>

            <div className="pt-3 space-y-1.5">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                情報の正確性について
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed pl-3.5">
                データの正確性・完全性・最新性の確保に努めておりますが、これを保証するものではありません。
                法案の可決状況や公約の内容は随時変更される可能性があり、反映に時間を要する場合や、誤りが含まれる場合があります。
              </p>
            </div>

            <div className="pt-3 space-y-1.5">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                記載されている政党について
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed pl-3.5">
                アプリが現状開発中ということもあり、全ての政党の全てのデータを載せられているわけではありません。ご了承ください。
              </p>
            </div>

            <div className="pt-3 space-y-1.5">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                公約データについて
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed pl-3.5">
                公約データの著作権は各政党に帰属します。当サイトは比較・分析の便宜を図るものであり、正確な情報の確認には各党の公式サイトをご参照ください。
              </p>
            </div>

            <div className="pt-3 space-y-1.5">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                Cookieについて
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed pl-3.5">
                本サービスではアカウント登録や個人情報の収集は行っていません。
                サービスの動作に必要な技術的Cookieを使用する場合があります。
              </p>
            </div>
          </div>
        </section>
 
        {/* AI Disclaimer */}
        <section className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
          <h2 className="text-sm font-bold text-amber-600 dark:text-amber-400">AIによる評価について</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            本サービスの公約達成度スコアは、AIによる自動評価です。
            評価の正確性・網羅性を保証するものではありません。
            必ず原文（国会議事録・官報・法案本文等）をご自身でご確認ください。
            評価に誤りを発見された場合は、フィードバックをお寄せください。
          </p>
        </section>
 
        {/* Neutrality */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold">政治的中立性</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            POLITIKIは特定の政党・政治家・政策を支持または推薦するものではありません。
            すべての評価は公開データとアルゴリズムに基づいて自動的に行われます。
          </p>
          <p  className="text-sm text-muted-foreground leading-relaxed">
            また、AIの評価基準などについては公平性のため、記載することを検討しています。準備が整い次第、記載をいたします。
          </p>
        </section>

        {/* Status */}
        <section className="p-4 rounded-xl border bg-muted/30 space-y-2">
          <h2 className="text-sm font-bold">現在のステータス</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            POLITIKIは現在開発中のベータ版です。現時点では2026年2月8日にあった第51回衆議院議員選挙で勝利した高市政権の公約データのみ利用可能です。
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            今後、過去の政権データ、政党別トラッキング、政治家個人の活動追跡など機能を順次拡大していきます。
          </p>
        </section>

        {/* Contact */}
        {/* Neutrality */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold">問い合わせ</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            politiki.contact@gmail.com
          </p>
        </section>
 
        {/* Legal links */}
        <section className="space-y-3 pb-8">
          <h2 className="text-lg font-bold">法的情報</h2>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/legal/terms')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm border hover:bg-accent transition-colors hover:cursor-pointer"
            >
              利用規約
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </button>
            {/* <button
              onClick={() => router.push('/legal/privacy')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm border hover:bg-accent transition-colors"
            >
              プライバシーポリシー
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </button> */}
          </div>
        </section>
 
      </div>
    </div>
  );
}