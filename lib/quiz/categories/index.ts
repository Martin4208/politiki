import { questions as economicsQuestions } from './economics/questions';
import type { Question } from '../quick/questions';

export const categoryQuestionsMap: Record<string, Question[]> = {
    economics: economicsQuestions,
    // 他カテゴリーは順次追加
};
