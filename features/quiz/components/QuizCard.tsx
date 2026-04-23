'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { questions } from '@/lib/quiz/quick/questions';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { useQuizStore } from '../../../stores/quizStore';
import { useAuth } from '@/providers/auth-provider';

  const answerOptions = [
    { value: 1 , label: "強く反対" },
    { value: 2 , label: "反対" },
    { value: 3 , label: "どちらでもない" },
    { value: 4 , label: "賛成" },
    { value: 5 , label: "強く賛成" }
  ];

export function QuizCard() {
    const router = useRouter();
    const { user } = useAuth();
    const { setAnswer, answers: storedAnswers, currentIndex, setCurrentIndex, hydrateAnswers } = useQuizStore();
    const [localAnswers, setLocalAnswers] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(false);

    const answers = user ? storedAnswers : localAnswers;

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    useEffect(() => {
        setCurrentIndex(0);
    }, []);

    useEffect(() => {
        if (!user) return;
        if (Object.keys(answers).length > 0) return; 

        fetch('/api/questions/quick')
            .then(async (res) => {
                if (!res.ok) return;
                const data: Record<string, number> = await res.json();
                if (Object.keys(data).length > 0) {
                    hydrateAnswers(data);
                }
            })
            .catch(console.error);
    }, [user]);

    if (!currentQuestion) return null

    const selectedAnswer = answers[currentQuestion.id] ?? null

    const handleNext = async () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setIsLoading(true);
            if (user) {
                await saveAnswers();
                router.push("/dashboard");
            } else {
                router.push("/?guest=true");
            }
        }
    };

    const handleBack = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
        }
    };

    const handleLearnTopic = () => {
        const enCategory = currentQuestion.enCategory;
        const learnSlug = currentQuestion.learnSlug
        router.push(`/learn/${enCategory}/${learnSlug}?prev=quiz`);
    }

    const handleAnswerSelect = (value: number) => {
        if (user) {
            setAnswer(currentQuestion.id.toString(), value);
        } else {
            setLocalAnswers(prev => ({ ...prev, [currentQuestion.id.toString()]: value }));
        }
    };

    async function saveAnswers() {
        const validAnswers = Object.fromEntries(
            Object.entries(answers).filter(([, v]) => Number.isInteger(v) && v >= 1 && v <= 5)
        );
        if (Object.keys(validAnswers).length === 0) return;
        await fetch('/api/questions/quick', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers: validAnswers }),
        });
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading...</p>
                {/* ここにスピナーなどのUIを入れる */}
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            {/* プログレスバー */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">
                    質問 {currentIndex + 1} / {questions.length}
                    </span>
                    <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    {currentQuestion.category}
                </span>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    <h2 className="mb-8 text-xl font-bold">{currentQuestion.text}</h2>
                </motion.div>
            </AnimatePresence>

            {/* 選択式 */}
            <div className="space-y-3 mb-12">
            {answerOptions.map((option) => (
                <button
                key={option.value}
                onClick={() => handleAnswerSelect(option.value)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    selectedAnswer === option.value
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
                >
                <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedAnswer === option.value
                        ? "border-blue-600 bg-blue-600"
                        : "border-gray-300"
                    }`}
                    >
                    {selectedAnswer === option.value && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                    </div>
                </div>
                </button>
            ))}
            </div>

            <div className="flex justify-between items-center">
                <Button
                    onClick={handleBack}
                    disabled={currentIndex === 0}
                >
                    戻る
                </Button>

                <Button
                    onClick={handleLearnTopic}
                >
                    学習
                </Button>

                <Button
                    onClick={handleNext}
                >
                    次へ
                </Button>
            </div>
        </div>
    )
}
