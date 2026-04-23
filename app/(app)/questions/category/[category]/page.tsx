'use client'

import { useParams, useRouter } from 'next/navigation';
import { categoryQuestionsMap } from '@/lib/quiz/categories';
import { useDeepDiveStore } from '@/stores/deepDiveStore';
import { categories } from '@/lib/categories';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const answerOptions = [
    { value: 1, label: '強く反対' },
    { value: 2, label: '反対' },
    { value: 3, label: 'どちらでもない' },
    { value: 4, label: '賛成' },
    { value: 5, label: '強く賛成' },
];

export default function CategoryQuiz() {
    const { category: categoryId } = useParams<{ category: string }>();
    const router = useRouter();
    const { answers, currentIndexes, setAnswer, setCurrentIndex } = useDeepDiveStore();

    const categoryInfo = categories.find(c => c.id === categoryId);
    const questions = categoryQuestionsMap[categoryId] ?? [];
    const currentIndex = currentIndexes[categoryId] ?? 0;
    const catAnswers = answers[categoryId] ?? {};

    const currentQuestion = questions[currentIndex];
    const selectedAnswer = currentQuestion ? (catAnswers[currentQuestion.id] ?? null) : null;
    const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
    const isLast = currentIndex === questions.length - 1;

    if (questions.length === 0) {
        return (
            <div className="max-w-2xl mx-auto px-6 py-12 text-center text-muted-foreground">
                <p>このカテゴリーの問題はまだ準備中です。</p>
                <Button variant="ghost" onClick={() => router.push('/questions/category')} className="mt-4">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    戻る
                </Button>
            </div>
        );
    }

    const handleAnswer = (value: number) => {
        if (!currentQuestion) return;
        setAnswer(categoryId, currentQuestion.id, value);
    };

    const handleLearnTopic = () => {
        const enCategory = currentQuestion.enCategory;
        const learnSlug = currentQuestion.learnSlug
        router.push(`/learn/${enCategory}/${learnSlug}?prev=quiz`);
    }

    const handleNext = () => {
        if (isLast) {
            setCurrentIndex(categoryId, 0)
            router.push('/questions/category');
        } else {
            setCurrentIndex(categoryId, currentIndex + 1);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-6 py-12">
            {/* ヘッダー */}
            <div className="mb-8">
                <button
                    onClick={() => router.push('/questions/category')}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    <ChevronLeft className="w-4 h-4" />
                    カテゴリー一覧
                </button>
                <div className="flex justify-between items-center mb-2 text-sm text-muted-foreground">
                    <span>{categoryInfo?.label ?? categoryId}</span>
                    <span>{currentIndex + 1} / {questions.length}</span>
                </div>
                <Progress value={progress} className="h-1.5" />
            </div>

            {/* カテゴリーバッジ */}
            <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm">
                    {categoryInfo?.label}
                </span>
            </div>

            {/* 質問文 */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestion?.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    <h2 className="text-xl font-bold mb-8">{currentQuestion?.text}</h2>
                </motion.div>
            </AnimatePresence>

            {/* 選択肢 */}
            <div className="space-y-3 mb-10">
                {answerOptions.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => handleAnswer(option.value)}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                            selectedAnswer === option.value
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-muted-foreground/50 bg-background'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm">{option.label}</span>
                            <div
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                    selectedAnswer === option.value
                                        ? 'border-primary bg-primary'
                                        : 'border-muted-foreground'
                                }`}
                            >
                                {selectedAnswer === option.value && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                )}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* ナビゲーション */}
            <div className="flex justify-between items-center">
                <Button
                    variant="outline"
                    onClick={() => setCurrentIndex(categoryId, currentIndex - 1)}
                    disabled={currentIndex === 0}
                >
                    ← 戻る
                </Button>
                <Button
                    onClick={handleLearnTopic}
                >
                    学習
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={selectedAnswer === null}
                >
                    {isLast ? '完了 ✓' : '次へ →'}
                </Button>
            </div>
        </div>
    );
}
