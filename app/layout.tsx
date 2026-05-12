import "./globals.css";
import '@radix-ui/colors/black-alpha.css';
import { Header } from '@/components/layouts/header';
import { Theme } from "@radix-ui/themes";
import { AuthProvider } from '@/providers/auth-provider';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from 'next';

/* ───────────────────────── 定数 ───────────────────────── */

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://politiki.jp').replace(
  /\/$/,
  '',
);

const SITE_NAME = 'POLITIKI';

const DESCRIPTION_JA =
  'POLITIKIは、選挙で掲げた公約が次の選挙までどのくらい達成されているかを確認できます。';

const DESCRIPTION_EN =
  'Find out where you stand politically. Compare your views with major political parties and explore your ideological position.';

/* ───────────────────────── Metadata ───────────────────── */

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: `${SITE_NAME} - 公約トラッカー`,
    template: `%s | ${SITE_NAME}`,
  },

  description: DESCRIPTION_JA,

  authors: [{ name: SITE_NAME, url: SITE_URL }],

  keywords: [
    'POLITIKI',
    '政治コンパス',
    '政治診断',
    '公約',
    '公約比較',
    'マニフェスト',
    'トラッカー',
    '法案',
    '選挙',
    '政党比較',
    'political compass',
    'manifesto tracker',
  ],

  alternates: {
    canonical: SITE_URL,
    // languages: { en: `${SITE_URL}/en`, ja: `${SITE_URL}/ja` },
  },

  /* ── Open Graph（POLITIKI に統一） ── */
  openGraph: {
    title: `${SITE_NAME} – 政党の公約達成率を比較`,
    description: DESCRIPTION_JA,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'ja_JP',
    images: [
      {
        url: `${SITE_URL}/og.png`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} – 政治ポジション診断`,
      },
    ],
  },

  /* ── Twitter Card（POLITIKI に統一） ── */
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} – 公約トラッカー`,
    description: DESCRIPTION_JA,
    images: [`${SITE_URL}/og.png`],
    // site: '@politiki_jp',   // 公式アカウントがあれば追加
    // creator: '@politiki_jp',
  },

  robots: { index: true, follow: true },

  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

/* ───────────────────────── Viewport ───────────────────── */

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

/* ───────────────────── JSON-LD 構造化データ ─────────────── */

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "name": SITE_NAME,
      "alternateName": ["ポリティキ", "politiki"],
      "url": SITE_URL,
    },
    {
      "@type": "WebApplication",
      "name": SITE_NAME,
      "url": SITE_URL,
      "description": DESCRIPTION_JA,
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "All",
      "inLanguage": ["ja", "en"],
    }
  ]
};

/* ───────────────────── Root Layout ────────────────────── */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        {/* 構造化データ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <meta name="google-site-verification" content="cZVEl21DlvHwPm7gTck1PkPWpcf1U343h_O3m7PMPwY" />
      <body>
        <Theme>
          <AuthProvider>
            <div className="bg-background text-foreground h-screen flex flex-row">
              {/* <Sidebar /> */}
              <div className="flex flex-col h-full w-full overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto">
                  {children}
                </main>
              </div>
            </div>
            <Analytics />
            <SpeedInsights />
          </AuthProvider>
        </Theme>
      </body>
    </html>
  );
}