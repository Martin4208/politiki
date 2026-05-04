import type { FinalStatus } from '@/app/api/tracker/route';
import type { StatusMeta } from '../types';

export const STATUS: Record<FinalStatus, StatusMeta> = {
  achieved:    { label: '達成',     dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  in_progress: { label: '進行中',   dot: 'bg-sky-400',     text: 'text-sky-400',     bg: 'bg-sky-400/10'     },
  partial:     { label: '部分達成', dot: 'bg-amber-400',   text: 'text-amber-400',   bg: 'bg-amber-400/10'   },
  regressive:  { label: '逆行',     dot: 'bg-rose-500',    text: 'text-rose-500',    bg: 'bg-rose-500/10'    },
  unstarted:   { label: '未着手',   dot: 'bg-zinc-500',    text: 'text-zinc-500',    bg: 'bg-zinc-500/10'    },
};

export const ALL_STATUSES = Object.keys(STATUS) as FinalStatus[];

export function statusColor(s: FinalStatus): string {
  const map: Record<FinalStatus, string> = {
    achieved: '#34d399',
    in_progress: '#38bdf8',
    partial: '#fbbf24',
    regressive: '#f43f5e',
    unstarted: '#71717a',
  };
  return map[s];
}