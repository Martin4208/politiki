'use client';

import { useState } from 'react';
import { Overview } from '@/features/finance/Overview';
import { RevenueExpenditureTrends } from '@/features/finance/RevenueExpenditureTrends';
import { FiscalBalance } from '@/features/finance/FiscalBalance';

const TABS = [
    { id: 1, value: '概要' },
    { id: 2, value: '歳入・歳出推移' },
    { id: 3, value: '財政収支' },
    { id: 4, value: '予算 vs 決算' },
    { id: 5, value: '税収内訳' },
];

export default function Money() {
    const [activeId, setActiveId] = useState<number>(1);

    return (
        <div className="h-screen overflow-hidden flex">
            {/* Sidebar */}
            <div className="w- shrink-0 border-r flex-col bg-background">
                <nav className="flex-1 px-3 py-4 space-y-5">
                    {/* Items */}
                    <div className="space-y-0.5">
                        {TABS.map((item) => (
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
                </nav>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden">
                {/* 1 · Core Values */}
                {activeId === 1 && (
                    <div className="h-full overflow-y-auto p-8">
                        <Overview />
                    </div>
                )}
                

                {activeId === 2 && (
                    <div>
                        <RevenueExpenditureTrends />
                    </div>
                )}


                {activeId === 3 && (
                    <div>
                        <FiscalBalance />
                    </div>
                )}
            </main>
        </div>
    );
}