import "./globals.css";
import '@radix-ui/colors/black-alpha.css';
import { Sidebar } from '@/components/layouts/sidebar';
import { Header } from '@/components/layouts/header';
import { Theme } from "@radix-ui/themes";
import { AuthProvider } from '@/providers/auth-provider';
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <title>POLITIKI</title>
      <meta name="description" content="質問に答えて自分の政治的立場を可視化。経済・外交・社会政策などの分野で、あなたの考えが各政党とどれくらい近いかを比較できます。" />
      <meta name="description" content="Find out where you stand politically. Compare your views with major political parties and explore your ideological position with our interactive political compass test." />
      <meta name="keywords" content="political compass, political ideology test, political alignment test, compare political parties, political spectrum quiz" />
      <body>
          <Theme>
            <AuthProvider>
                <div className="bg-background text-foreground h-screen flex flex-row">
                  {/** Sidebar */}
                  {/* <div> 
                    <Sidebar />
                  </div> */}
                  {/** Header + Main */}
                  <div className="flex flex-col h-full w-full overflow-hidden">
                    <Header />
                    

                    <main className="flex-1 w-full h-screen overflow-hidden">
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
