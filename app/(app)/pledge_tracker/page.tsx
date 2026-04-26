'use client';

import { useState } from 'react';
import { AdministrationTracker } from '@/features/tracker/AdministrationTracker';

const TABS = [
  {
    group: '公約',
    items: [
      { id: 1, label: '公約トラッカー'},
    ],
  },
];

export default function PledgeTrackerPage() {
  const [activeId, setActiveId] = useState(1);

  return (
    <div className="h-screen overflow-hidden flex">
      {/* Sidebar */}
      <div className="w-48 shrink-0 border-r flex flex-col bg-background">
        <nav className="flex-1 px-3 py-4 space-y-5">
          {TABS.map((group) => (
            <div key={group.group}>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveId(item.id)}
                    className={`
                      w-full flex flex-col items-start gap-1 px-4 py-3 rounded-lg cursor-pointer
                      text-left transition-all duration-200
                      ${activeId === item.id
                        ? 'bg-foreground text-background shadow-md scale-[1.02]' // 選択時に少し大きく
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'}
                    `}
                  >
                    <span className="text-base font-bold leading-tight">
                      {item.label}
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
        {activeId === 1 && <AdministrationTracker />}
      </main>
    </div>
  );
}