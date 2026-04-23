import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type QuizStore = {
    answers: Record<string, number>
    currentIndex: number
    setAnswer: (id: string, value: number) => void
    setCurrentIndex: (id: number) => void
    hydrateAnswers: (answers: Record<string, number>) => void
}

export const useQuizStore = create<QuizStore>(
    persist(
        (set) => ({
            answers: {},

            currentIndex: 0,
            
            setAnswer: ( id, value ) => 
                set((state) => ({
                    answers: { 
                        ...state.answers, 
                        [id]: value 
                    },
                })),

            setCurrentIndex: ( id ) => set({currentIndex: id}),

            hydrateAnswers: (answers) => set({ answers }),
        }),
        {
            name: 'quiz-storage',
            storage: createJSONStorage(() => sessionStorage)
        }
    )
)