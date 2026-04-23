'use client';

import { useState } from 'react';
import { AdministrationTracker } from '@/features/tracker/AdministrationTracker';

const TABS = [
  {
    group: '公約',
    items: [
      { id: 1, label: '政権公約', description: '各政権の達成度' },
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
              <p className="px-3 mb-1 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                {group.group}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveId(item.id)}
                    className={`
                      w-full flex flex-col items-start gap-0.5 px-3 py-2 rounded-md cursor-pointer
                      text-left transition-colors
                      ${activeId === item.id
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'}
                    `}
                  >
                    <span className="text-sm font-medium leading-tight">{item.label}</span>
                    <span className={`text-[10px] leading-tight ${
                      activeId === item.id ? 'opacity-60' : 'text-muted-foreground/60'
                    }`}>
                      {item.description}
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