'use client';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { articles } from '@/lib/articles';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { ChevronLeft, BookOpen } from 'lucide-react';

export default function LearnTopic() {
  const { category, slug } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const prev = searchParams.get('prev');

  const article = articles.find(
    item => item.category === category && item.slug === slug
  );

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!article) return (
    <div className="flex flex-col h-full">
      <header className="shrink-0 border-b px-6 py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
          {prev === 'quiz' ? '質問に戻る' : '一覧に戻る'}
        </Button>
      </header>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">記事が見つかりませんでした</p>
      </div>
    </div>
  );

  // ── Article ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Fixed header */}
      <header className="shrink-0 border-b bg-background/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-4 h-4" />
            {prev === 'quiz' ? '質問に戻る' : '一覧に戻る'}
          </Button>

          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{article.category.toUpperCase()}</span>
          </div>
        </div>
      </header>

      {/* Scrollable body */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-10 space-y-12 pb-32">

          {/* Article body */}
          <article className="
            prose prose-slate dark:prose-invert max-w-none
            prose-h1:text-4xl prose-h1:font-black prose-h1:tracking-tight prose-h1:mb-8
            prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-4
            prose-h2:border-l-4 prose-h2:border-foreground/20 prose-h2:pl-4
            prose-p:text-base prose-p:text-muted-foreground prose-p:leading-relaxed
            prose-strong:text-foreground prose-strong:font-bold
            prose-li:text-muted-foreground
          ">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </article>

          {/* Think deeper section */}
          {/* <div className="border rounded-xl p-6 space-y-5">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base">このテーマをより深く考える</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              政治の問いには、事実（数字）だけでなく、あなたが「どのような社会を望むか」という価値観が反映されます。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg border">
                <h4 className="font-semibold text-sm mb-2">自由・成長の視点</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  「選択の自由」や「経済的な活力」を優先する場合、どのようなメリットがあるでしょうか？
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border">
                <h4 className="font-semibold text-sm mb-2">公平・保障の視点</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  「格差の是正」や「セーフティネット」を優先する場合、どのような課題が解決されるでしょうか？
                </p>
              </div>
            </div>
          </div> */}

          {/* Back to quiz button (only shown when coming from quiz) */}
          {prev === 'quiz' && (
            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                className="px-12 py-5 text-base font-semibold"
                onClick={() => router.back()}
              >
                回答に戻る
              </Button>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
