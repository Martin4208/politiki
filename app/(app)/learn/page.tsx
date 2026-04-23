'use client';

import { useRouter } from 'next/navigation';
import { categories } from '@/lib/categories';
import { ChevronRight } from 'lucide-react';

export default function Learn() {
  const router = useRouter();

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-8 py-8 pb-20">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-bold tracking-tight">学ぶ</h1>
          <p className="text-xs text-muted-foreground mt-1">政治テーマの背景と論点を学ぶ</p>
        </div>

        {/* Category list */}
        <div>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => router.push(`/learn/${category.id}/`)}
              className="w-full flex items-center justify-between py-4 border-b text-left group transition-colors hover:bg-transparent"
            >
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{category.label}</p>
                <p className="text-xs text-muted-foreground">
                  {category.axis.left} ↔ {category.axis.right}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
