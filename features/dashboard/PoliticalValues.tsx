import { categories } from '@/lib/categories'
import * as Slider from '@radix-ui/react-slider';
import { useQuizStore } from '@/stores/quizStore';
import { questions } from '@/lib/quiz/quick/questions'

export default function PoliticalValues() {
    const { answers } = useQuizStore();

    const getCategoryScore = (categoryId: string) => {
        const categoryQuestions = questions.filter(q => q.enCategory === categoryId)
        if (categoryQuestions.length === 0) return 3;

        const answered = categoryQuestions.filter(q => answers[String(q.id)] !== undefined)
        if (answered.length === 0) return null

        const sum = answered.reduce((acc ,q) => acc + (answers[String(q.id)] ?? 3), 0)
        return sum / answered.length
    }

    return (
        <div className="max-w-3xl mx-auto space-y-16">

              {/* Header */}
              <div className="text-center space-y-3">
                <h1 className="text-2xl font-bold">Your Political Profile</h1>
              </div>

              {/* Sliders */}
              {categories.map((category) => {
                const currentValue = getCategoryScore(category.id) ?? 3;
                const hasAnswer = getCategoryScore(category.id) !== null;

                return (
                  <div key={category.id} className="space-y-4">

                    {/* Label + Score */}
                    <div className="flex justify-between items-center">
                      <h2 className="font-semibold">
                        {category.label}
                      </h2>
                      <span className="text-sm text-gray-500">
                        {hasAnswer ? currentValue.toFixed(1) : '未回答'}
                      </span>
                    </div>

                    {/* Slider */}
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

                    {/* Axis labels */}
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{category.axis.left}</span>
                      <span>{category.axis.right}</span>
                    </div>

                  </div>
                );
              })}

              {/* Summary */}
              <div className="border-t pt-10 space-y-4 mb-20">
                <h2 className="text-lg font-semibold">Summary</h2>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  {categories.map(category => (
                    <div key={category.id} className="flex justify-between">
                      <span>{category.label}</span>
                      <span>{answers[category.id] ?? '-'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
    )
}