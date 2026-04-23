'use client'

import { useRouter } from 'next/navigation';
import { questions as quickQuestions } from '@/lib/quiz/quick/questions';
import { useQuizStore } from '@/stores/quizStore';
import { useDeepDiveStore } from '@/stores/deepDiveStore';
import { categoryQuestionsMap } from '@/lib/quiz/categories';
import { Progress } from '@/components/ui/progress';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '../../../providers/auth-provider';

export default function Questions() {
    const router = useRouter();
    const { user } = useAuth();
    
    const { answers: quickAnswersStore } = useQuizStore();
    const { answers: deepDiveAnswersStore } = useDeepDiveStore();

    const quickAnswers = user ? quickAnswersStore : {}
    const deepDiveAnswers = user ? deepDiveAnswersStore : {}

    // Quick 進捗
    const quickAnswered = quickQuestions.filter(q => quickAnswers[q.id] != null).length;
    const quickTotal = quickQuestions.length;
    const quickProgress = quickTotal > 0 ? Math.round((quickAnswered / quickTotal) * 100) : 0;
    const quickLabel = quickAnswered === 0 ? '始める' : quickAnswered === quickTotal ? '見直す' : '続きから';

    // Deep Dive 進捗
    const categoryIds = Object.keys(categoryQuestionsMap);
    const totalCategories = categoryIds.length;
    const completedCategories = categoryIds.filter((catId) => {
        const qs = categoryQuestionsMap[catId];
        const catAnswers = deepDiveAnswers[catId] ?? {};
        return qs.length > 0 && Object.keys(catAnswers).length >= qs.length;
    }).length;

    return (
        <div className="max-w-2xl mx-auto px-6 py-12 space-y-5">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">診断</h1>
                <p className="text-muted-foreground mt-1 text-sm">あなたの政治的立場を確認する</p>
            </div>

            {/* Quick */}
            <button
                className="w-full text-left border rounded-xl p-6 hover:bg-muted/40 transition-colors group cursor-pointer"
                onClick={() => router.push('/questions/quick')}
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-base">クイック診断</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-4">
                            主要テーマを幅広くカバー · {quickTotal}問 · 約10分
                        </p>
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{quickAnswered} / {quickTotal} 回答済み</span>
                                <span>{quickProgress}%</span>
                            </div>
                            <Progress value={quickProgress} className="h-1.5" />
                        </div>
                    </div>
                    <div className="ml-4 flex items-center self-center gap-1">
                        <span className="text-xs text-primary font-medium">{quickLabel}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                </div>
            </button>

            {/* Deep Dive */}
            <button
                className="w-full text-left border rounded-xl p-6 hover:bg-muted/40 transition-colors group cursor-pointer"
                onClick={() => router.push('/questions/category')}
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-base">詳細診断</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-4">
                            カテゴリーを選んで深掘り · 各分野 3〜5問
                        </p>
                        <p className="text-xs text-muted-foreground">
                            完了: {completedCategories} / {totalCategories} カテゴリー
                        </p>
                    </div>
                    <div className="ml-4 flex items-center self-center">
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                </div>
            </button>
        </div>
    );
}
