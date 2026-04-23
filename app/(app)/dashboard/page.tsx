'use client';

import { useState } from 'react';
import { categories } from '@/lib/categories';
import { questions } from '@/lib/quiz/quick/questions';
import * as Slider from '@radix-ui/react-slider';
import { useQuizStore } from '@/stores/quizStore';
import CoreValues from '@/features/dashboard/CoreValues';
import PhilosophyStatement from '@/features/dashboard/PhilosophyStatement';
import StanceOnPolicies from '@/features/dashboard/StanceOnPolicies';
import PartyComparison from '@/features/dashboard/PartyComparison';

const TABS = [
  {
    group: '分析',
    items: [
      // { id: 1, value: 'Core Values' },
      // { id: 2, value: 'Political Values' },
      { id: 3, value: '政策スタンス' },
      // { id: 4, value: '政党比較' },
    ],
  },
  // {
  //   group: '作成',
  //   items: [
  //     { id: 5, value: '私の政治哲学' },
  //   ],
  // },
];

export default function Dashboard() {  
  const [activeId, setActiveId] = useState<number>(3);
  const { answers } = useQuizStore();

  const getCategoryScore = (categoryId: string) => {
    const categoryQuestions = questions.filter(q => q.enCategory === categoryId);
    if (categoryQuestions.length === 0) return 3;
    const answered = categoryQuestions.filter(q => answers[String(q.id)] !== undefined);
    if (answered.length === 0) return null;
    const sum = answered.reduce((acc, q) => acc + (answers[String(q.id)] ?? 3), 0);
    return sum / answered.length;
  };

  return (
    <div className="h-screen overflow-hidden flex">

      {/* Sidebar */}
      <div className="w- shrink-0 border-r flex flex-col bg-background">
        <nav className="flex-1 px-3 py-4 space-y-5">
          {TABS.map((group) => (
            <div key={group.group}>
              {/* Group label */}
              <p className="px-3 mb-1 text-[10px] font-semibold tracking-widest  text-muted-foreground uppercase">
                {group.group}
              </p>

              {/* Items */}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveId(item.id)}
                    className={`
                      w-full flex flex-col items-start gap-0.5 px-3 py-2 rounded-md cursor-pointer
                      text-left transition-colors
                      ${activeId === item.id
                        ? 'bg-black text-white'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'}
                    `}
                  >
                    <span className="text-sm font-medium leading-tight">{item.value}</span>
                    <span className={`text-[10px] leading-tight ${
                      activeId === item.id ? 'text-white/60' : 'text-muted-foreground/60'
                    }`}>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">

        {/* 1 · Core Values */}
        {activeId === 1 && (
          <div className="h-full overflow-y-auto p-8">
            <CoreValues />
          </div>
        )}

        {/* 2 · Political Values */}
        {activeId === 2 && (
          <div className="h-full overflow-y-auto p-8">
            <div className="max-w-3xl mx-auto space-y-16 pb-20">
              <div className="text-center space-y-3">
                <h1 className="text-2xl font-bold">あなたの政治プロフィール</h1>
              </div>
              {categories.map((category) => {
                const currentValue = getCategoryScore(category.id) ?? 3;
                const hasAnswer = getCategoryScore(category.id) !== null;
                return (
                  <div key={category.id} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="font-semibold">{category.label}</h2>
                      <span className="text-sm text-gray-500">
                        {hasAnswer ? currentValue.toFixed(1) : '未回答'}
                      </span>
                    </div>
                    <Slider.Root
                      className="relative flex items-center w-full h-6"
                      value={[currentValue]}
                      max={5}
                      min={1}
                      step={0.1}
                      disabled
                    >
                      <Slider.Track className="relative grow h-0.75 bg-gray-200 rounded-full">
                        <Slider.Range className="absolute h-full bg-black rounded-full" />
                      </Slider.Track>
                      <Slider.Thumb className="block w-5 h-5 bg-black rounded-full shadow" />
                    </Slider.Root>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{category.axis.left}</span>
                      <span>{category.axis.right}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3 · Stance on Policies */}
        {activeId === 3 && (
          <div className="h-full overflow-y-auto p-8">
            <StanceOnPolicies />
          </div>
        )}

        {/* 4 · Party Comparison */}
        {activeId === 4 && (
          <div className="h-full overflow-y-auto p-8">
            <PartyComparison />
          </div>
        )}

        {/* 5 · 私の政治哲学 */}
        {activeId === 5 && (
          <PhilosophyStatement />
        )}

      </main>
    </div>
  );
}
