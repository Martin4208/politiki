'use client';

import { useParams, useRouter } from 'next/navigation';
import { questions } from '@/lib/quiz/quick/questions';
import { categories } from '@/lib/categories';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CategoryLearn() {
  const router = useRouter();
  const { category } = useParams();

  const categoryInfo = categories.find(c => c.id === category);
  const categoryQuestions = questions.filter((q) => q.enCategory === category);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-8 py-8 pb-20">

        {/* Back */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground -ml-2 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          一覧に戻る
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-bold tracking-tight">
            {categoryInfo?.label ?? String(category)}
          </h1>
          {categoryInfo && (
            <p className="text-xs text-muted-foreground mt-1">
              {categoryInfo.axis.left} ↔ {categoryInfo.axis.right}
            </p>
          )}
        </div>

        {/* Question list */}
        <div>
          {categoryQuestions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              このカテゴリーの記事はまだありません
            </p>
          ) : (
            categoryQuestions.map((q) => (
              <button
                key={q.id}
                onClick={() => router.push(`/learn/${q.enCategory}/${q.learnSlug}`)}
                className="w-full flex items-center justify-between py-4 border-b text-left group"
              >
                <p className="text-sm text-foreground leading-snug pr-4">{q.text}</p>
                <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
