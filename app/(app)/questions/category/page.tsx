'use client'

import { categories } from '@/lib/categories';
import { categoryQuestionsMap } from '@/lib/quiz/categories';
import { useDeepDiveStore } from '@/stores/deepDiveStore';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function CategoryList() {
    const router = useRouter();
    const { answers } = useDeepDiveStore();

    return (
        <div className="max-w-2xl mx-auto px-6 py-6 h-screen overflow-y-auto">
            <div className="mb-8">
                <button
                    onClick={() => router.push('/questions')}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Questions
                </button>
                <h1 className="text-2xl font-bold tracking-tight">Deep Dive</h1>
                <p className="text-muted-foreground mt-1 text-sm">カテゴリーを選んで深掘り</p>
            </div>

            <div className="space-y-2">
                {categories.map((category) => {
                    const qs = categoryQuestionsMap[category.id] ?? [];
                    const hasQuestions = qs.length > 0;
                    const catAnswers = answers[category.id] ?? {};
                    const answeredCount = Object.keys(catAnswers).length;
                    const isComplete = hasQuestions && answeredCount >= qs.length;

                    return (
                        <div
                            key={category.id}
                            onClick={() => hasQuestions && router.push(`/questions/category/${category.id}`)}
                            className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
                                hasQuestions
                                    ? 'cursor-pointer hover:bg-muted/40'
                                    : 'opacity-40 cursor-not-allowed'
                            }`}
                        >
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{category.label}</span>
                                    {isComplete && (
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    )}
                                    {!hasQuestions && (
                                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                                            準備中
                                        </span>
                                    )}
                                </div>
                                {hasQuestions && (
                                    <div className="flex items-center gap-1 mt-1">
                                        {qs.map((_, i) => (
                                            <div
                                                key={i}
                                                className={`w-2 h-2 rounded-full ${
                                                    i < answeredCount ? 'bg-primary' : 'bg-muted'
                                                }`}
                                            />
                                        ))}
                                        <span className="text-xs text-muted-foreground ml-1">
                                            {answeredCount}/{qs.length}
                                        </span>
                                    </div>
                                )}
                            </div>
                            {hasQuestions && (
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
