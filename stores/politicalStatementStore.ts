import { create } from 'zustand';

export type SectionKey = 'belief' | 'worldview' | 'stances' | 'philosophy';

type PoliticalStatementStore = {
  belief: string;
  worldview: string;
  stances: string;
  philosophy: string;
  stancesInitialized: boolean;
  setField: (field: SectionKey, value: string) => void;
  initStances: (draft: string) => void;
};

export const usePoliticalStatementStore = create<PoliticalStatementStore>((set) => ({
  belief: '',
  worldview: '',
  stances: '',
  philosophy: '',
  stancesInitialized: false,
  setField: (field, value) => set({ [field]: value }),
  initStances: (draft) =>
    set((state) =>
      state.stancesInitialized ? {} : { stances: draft, stancesInitialized: true }
    ),
}));
