'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
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

        <h1 className="text-3xl font-bold tracking-tight mb-2">プライバシーポリシー</h1>
        <p className="text-xs text-muted-foreground mb-10">最終更新日: 2026年4月8日</p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed pb-16">

          {/* 1 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">1. はじめに</h2>
            <p>
              POLITIKI運営者（以下「運営者」）は、Webサービス「POLITIKI」（以下「本サービス」）における
              ユーザーの個人情報の取り扱いについて、以下のとおりプライバシーポリシーを定めます。
            </p>
          </section>

          {/* 2 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">2. 収集する情報</h2>
            <p>本サービスでは、以下の情報を収集する場合があります。</p>

            <div className="space-y-3 ml-2">
              <div>
                <h3 className="text-sm font-semibold text-foreground">2.1 アカウント情報</h3>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>メールアドレス</li>
                  <li>パスワード（ハッシュ化して保存）</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground">2.2 利用データ</h3>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>政治診断の回答データ</li>
                  <li>閲覧履歴・利用状況に関するログ</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground">2.3 自動収集情報</h3>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>IPアドレス</li>
                  <li>ブラウザの種類、OS</li>
                  <li>アクセス日時</li>
                  <li>Cookie情報</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">3. 利用目的</h2>
            <p>収集した情報は以下の目的で利用します。</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>本サービスの提供・運営・改善</li>
              <li>ユーザーの診断結果の保存・表示</li>
              <li>サービスの利用状況の分析</li>
              <li>不正利用の防止</li>
              <li>規約変更やメンテナンス等の重要なお知らせ</li>
            </ol>
          </section>

          {/* 4 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">4. 第三者提供</h2>
            <p>
              運営者は、以下の場合を除き、ユーザーの個人情報を第三者に提供しません。
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>ユーザー本人の同意がある場合</li>
              <li>法令に基づく場合</li>
              <li>人の生命・身体・財産の保護に必要な場合</li>
            </ol>
          </section>

          {/* 5 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">5. データの保管</h2>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>
                ユーザーデータはSupabase（クラウドデータベース）上に保管されます。
                通信はSSL/TLSにより暗号化されています。
              </li>
              <li>
                パスワードはbcrypt等によりハッシュ化して保存されます。平文での保存は行いません。
              </li>
            </ol>
          </section>

          {/* 6 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">6. 政治的情報の取り扱い</h2>
            <p>
              本サービスでは政治診断の回答データを収集しますが、これはユーザー自身の分析結果表示のみに使用されます。
              診断回答を政治団体・広告主・第三者に提供することはありません。
              また、診断回答データは統計的な集計（個人を特定できない形式）以外の目的では使用しません。
            </p>
          </section>

          {/* 7 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">7. Cookieの使用</h2>
            <p>
              本サービスでは、認証情報の保持およびサービス改善のためにCookieを使用しています。
              ブラウザの設定によりCookieを無効にすることも可能ですが、
              一部の機能が利用できなくなる場合があります。
            </p>
          </section>

          {/* 8 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">8. ユーザーの権利</h2>
            <p>ユーザーは以下の権利を有します。</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>自己の個人情報の開示を請求すること</li>
              <li>個人情報の訂正・削除を請求すること</li>
              <li>アカウントの削除を請求すること</li>
            </ol>
            <p className="mt-2">
              上記の請求は、本サービス内のお問い合わせ機能または運営者への連絡により行うことができます。
            </p>
          </section>

          {/* 9 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">9. 未成年者の利用</h2>
            <p>
              本サービスは政治的情報を提供するものであり、年齢制限は設けていません。
              ただし、16歳未満のユーザーがアカウントを作成する場合、保護者の同意を推奨します。
            </p>
          </section>

          {/* 10 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">10. ポリシーの変更</h2>
            <p>
              運営者は本ポリシーを随時変更できるものとします。
              重要な変更がある場合は本サービス上で通知します。
              変更後に本サービスを継続して利用された場合、変更後のポリシーに同意したものとみなします。
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
