import { create } from 'zustand';
 
type DeepDiveStore = {
    // categoryId -> (questionId -> answer value)
    answers: Record<string, Record<number, number>>;
    // categoryId -> current question index
    currentIndexes: Record<string, number>;
 
    setAnswer: (categoryId: string, questionId: number, value: number) => void;
    setCurrentIndex: (categoryId: string, index: number) => void;
};
 
export const useDeepDiveStore = create<DeepDiveStore>((set) => ({
    answers: {},
    currentIndexes: {},
 
    setAnswer: (categoryId, questionId, value) =>
        set((state) => ({
            answers: {
                ...state.answers,
                [categoryId]: {
                    ...(state.answers[categoryId] ?? {}),
                    [questionId]: value,
                },
            },
        })),
 
    setCurrentIndex: (categoryId, index) =>
        set((state) => ({
            currentIndexes: {
                ...state.currentIndexes,
                [categoryId]: index,
            },
        })),
}));
