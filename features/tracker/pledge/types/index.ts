import type { FinalStatus } from '@/app/api/tracker/route';

export type RingSegment = {
  status: FinalStatus;
  count: number;
};

export type View = 'dashboard' | 'party';

export type StatusMeta = {
  label: string;
  dot: string;
  text: string;
  bg: string;
};