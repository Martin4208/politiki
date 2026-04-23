'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useQuizStore } from '@/stores/quizStore';
import { usePoliticalStatementStore, type SectionKey } from '@/stores/politicalStatementStore';
import { calcPhilosophyMatches } from '@/lib/dashboard/coreValues';
import { questions } from '@/lib/quiz/quick/questions';
import { questionReasoning } from '@/lib/quiz/quick/reasoning';
import { human } from '@/lib/philosophy/human';
import { politicalThoughts } from '@/lib/philosophy/politics';
import { parties } from '@/lib/parties';

// ─── Constants ────────────────────────────────────────────────────────────────

const SECTIONS: {
  key: SectionKey;
  title: string;
  subtitle: string;
  placeholder: string;
  rows: number;
  index: number;
}[] = [
  {
    key: 'belief',
    title: '核心的信念',
    subtitle: '「私は___だと信じる」— あなたの政治哲学を一文で',
    placeholder: '例: 私は、一人ひとりの自由が守られてこそ、社会全体の豊かさが実現すると信じる。',
    rows: 3,
    index: 1,
  },
  {
    key: 'worldview',
    title: '社会・人間観',
    subtitle: '人間とは何か、社会はどうあるべきか',
    placeholder: '人間の本質、社会の目的、国家の役割についての考えを書いてください...',
    rows: 7,
    index: 2,
  },
  {
    key: 'stances',
    title: '主要テーマへの立場',
    subtitle: '具体的な政策・テーマに対するあなたの考え',
    placeholder: 'クイック診断に回答すると、ここに下書きが自動生成されます。自由に編集してください。',
    rows: 12,
    index: 3,
  },
  {
    key: 'philosophy',
    title: '共鳴する思想',
    subtitle: '私の立場の「哲学的根拠」',
    placeholder: '共鳴する哲学・思想と、自分の言葉でその理由を書いてください...',
    rows: 7,
    index: 4,
  },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

function generateStancesDraft(answers: Record<string, number>): string {
  const answeredQs = questions.filter(q => answers[String(q.id)] != null);
  if (answeredQs.length === 0) return '';

  const lines = answeredQs
    .map(q => {
      const value = answers[String(q.id)] as 1 | 2 | 3 | 4 | 5;
      const reasoning = questionReasoning[q.id]?.find(r => r.stance === value);
      if (!reasoning) return null;
      return `【${q.category}】${q.text}\n${reasoning.label}: ${reasoning.reasoning}`;
    })
    .filter((l): l is string => l !== null);

  return lines.join('\n\n');
}

function charCount(text: string) {
  return text.replace(/\s/g, '').length;
}

// ─── Reference Panel ──────────────────────────────────────────────────────────

function ReferencePanel({
  activeSection,
  onInsert,
  answers,
}: {
  activeSection: SectionKey;
  onInsert: (text: string) => void;
  answers: Record<string, number>;
}) {
  const philosophyMatches = useMemo(() => calcPhilosophyMatches(answers), [answers]);

  // All philosophies from human.ts
  const humanPhilosophies = useMemo(() =>
    human.categories.flatMap(cat =>
      cat.philosophies.map(p => ({ ...p, category_label: cat.label }))
    ),
    []
  );

  // All philosophies from politics.ts
  const politicsPhilosophies = useMemo(() =>
    politicalThoughts.categories.flatMap(cat =>
      ((cat as any).philosophies ?? []).map((p: any) => ({ ...p, category_label: cat.label }))
    ),
    []
  );

  // Answered questions with their matching reasoning
  const answeredWithReasoning = useMemo(() =>
    questions
      .filter(q => answers[String(q.id)] != null)
      .map(q => {
        const value = answers[String(q.id)] as 1 | 2 | 3 | 4 | 5;
        const match = questionReasoning[q.id]?.find(r => r.stance === value);
        return match ? { q, reasoning: match } : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null),
    [answers]
  );

  const InsertButton = ({ text }: { text: string }) => (
    <button
      onClick={() => onInsert(text)}
      className="mt-2 text-xs px-2.5 py-1 rounded border border-black/20 hover:bg-black hover:text-white hover:border-black transition-colors"
    >
      挿入
    </button>
  );

  const Card = ({ children }: { children: React.ReactNode }) => (
    <div className="border rounded-lg p-3 space-y-2 text-xs">
      {children}
    </div>
  );

  // ── belief panel ──
  if (activeSection === 'belief') {
    const top5 = philosophyMatches.slice(0, 5);
    return (
      <div className="space-y-4">
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">共鳴度の高い思想から一文を</p>
          <div className="space-y-3">
            {top5.map(m => (
              <Card key={m.id}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{m.name}</span>
                  <span className="text-muted-foreground tabular-nums">{m.score}%</span>
                </div>
                <p className="text-muted-foreground italic leading-relaxed">「{m.output_template}」</p>
                <InsertButton text={m.output_template} />
              </Card>
            ))}
            {top5.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">
                質問に回答すると候補が表示されます
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── worldview panel ──
  if (activeSection === 'worldview') {
    return (
      <div className="space-y-5">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">人間観・社会観の参照軸</p>
        {human.categories.map(cat => (
          <div key={cat.id} className="space-y-2">
            <p className="text-xs font-semibold text-slate-500">{cat.label}</p>
            {cat.philosophies.map(p => (
              <Card key={p.id}>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold leading-tight">{p.name}</span>
                  <span className="shrink-0 text-muted-foreground">{p.core_value}</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">{p.logic}</p>
                <p className="italic text-slate-500">「{p.output_template}」</p>
                <InsertButton text={p.output_template} />
              </Card>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // ── stances panel ──
  if (activeSection === 'stances') {
    return (
      <div className="space-y-4">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">あなたの回答から</p>
        {answeredWithReasoning.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">
            クイック診断に回答すると参照できます
          </p>
        ) : (
          <div className="space-y-3">
            {answeredWithReasoning.map(({ q, reasoning }) => (
              <Card key={q.id}>
                <div className="flex items-start gap-1.5">
                  <span className="shrink-0 px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-500 text-[10px]">{q.category}</span>
                </div>
                <p className="font-medium text-slate-700 leading-tight">{q.text}</p>
                <div className="flex items-center gap-1.5">
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium
                    ${reasoning.stance >= 4 ? 'bg-blue-100 text-blue-700' :
                      reasoning.stance <= 2 ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-600'}`}
                  >
                    {reasoning.label}
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed">{reasoning.reasoning}</p>
                <InsertButton
                  text={`【${q.category}】${q.text}\n${reasoning.label}: ${reasoning.reasoning}`}
                />
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── philosophy panel ──
  if (activeSection === 'philosophy') {
    const allPhilos = [...politicsPhilosophies, ...humanPhilosophies];
    const enriched = philosophyMatches.slice(0, 8).map(m => ({
      ...m,
      full: allPhilos.find(p => p.id === m.id),
    }));

    return (
      <div className="space-y-4">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">共鳴度の高い思想</p>
        <div className="space-y-3">
          {enriched.map(m => (
            <Card key={m.id}>
              <div className="flex items-center justify-between">
                <span className="font-semibold">{m.name}</span>
                <span className="text-muted-foreground tabular-nums">{m.score}%</span>
              </div>
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-black rounded-full" style={{ width: `${m.score}%` }} />
              </div>
              <p className="text-muted-foreground leading-relaxed">{m.logic}</p>
              <p className="italic text-slate-500 leading-relaxed">「{m.output_template}」</p>
              <InsertButton text={m.output_template} />
            </Card>
          ))}
          {enriched.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">
              質問に回答すると候補が表示されます
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
}

// ─── Preview Modal ────────────────────────────────────────────────────────────

function PreviewModal({
  statement,
  onClose,
}: {
  statement: Record<SectionKey, string>;
  onClose: () => void;
}) {
  const sections = SECTIONS.filter(s => statement[s.key].trim().length > 0);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b px-8 py-4 flex items-center justify-between">
          <h2 className="font-bold text-base">私の政治哲学</h2>
          <button
            onClick={onClose}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            閉じる
          </button>
        </div>

        <div className="px-8 py-8 space-y-10">
          {sections.map((s, i) => (
            <section key={s.key} className="space-y-3">
              <div className="flex items-baseline gap-3">
                <span className="text-xs font-bold text-muted-foreground w-4 tabular-nums">{i + 1}</span>
                <h3 className="font-bold">{s.title}</h3>
              </div>
              <div className="ml-7">
                {s.key === 'belief' ? (
                  <p className="text-lg font-medium leading-relaxed">{statement[s.key]}</p>
                ) : (
                  <div className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
                    {statement[s.key]}
                  </div>
                )}
              </div>
            </section>
          ))}

          {sections.length === 0 && (
            <p className="text-center text-muted-foreground py-10">まだ何も書かれていません</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PhilosophyStatement() {
  const { answers } = useQuizStore();
  const { belief, worldview, stances, philosophy, setField, initStances } = usePoliticalStatementStore();
  const [activeSection, setActiveSection] = useState<SectionKey>('belief');
  const [showPreview, setShowPreview] = useState(false);

  const statement = { belief, worldview, stances, philosophy };

  // Auto-generate stances draft on first open
  useEffect(() => {
    const draft = generateStancesDraft(answers);
    if (draft) initStances(draft);
  }, [answers, initStances]);

  const handleInsert = useCallback((text: string) => {
    const current = statement[activeSection];
    const newText = current.trim() ? `${current}\n\n${text}` : text;
    setField(activeSection, newText);
  }, [activeSection, statement, setField]);

  const totalChars = Object.values(statement).reduce((s, v) => s + charCount(v), 0);

  return (
    <>
      {showPreview && (
        <PreviewModal statement={statement} onClose={() => setShowPreview(false)} />
      )}

      <div className="flex h-full overflow-hidden">

        {/* ── Canvas (left 60%) ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-8 py-8 space-y-1 pb-20">

            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-xl font-bold tracking-tight">私の政治哲学</h1>
                <p className="text-xs text-muted-foreground mt-1">
                  あなた自身の言葉で、政治的立場を記述する
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground tabular-nums">{totalChars} 字</span>
                <button
                  onClick={() => setShowPreview(true)}
                  className="text-xs px-3 py-1.5 border rounded-md hover:bg-black hover:text-white transition-colors"
                >
                  プレビュー
                </button>
              </div>
            </div>

            {/* Sections */}
            {SECTIONS.map((section) => {
              const isActive = activeSection === section.key;
              const value = statement[section.key];

              return (
                <div
                  key={section.key}
                  className={`group rounded-xl border transition-all duration-150 ${
                    isActive
                      ? 'border-black/30 shadow-sm'
                      : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <div className="px-5 pt-5 pb-3">
                    {/* Section header */}
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-[10px] font-bold text-muted-foreground tabular-nums w-4">
                        {section.index}
                      </span>
                      <h2 className="text-sm font-bold">{section.title}</h2>
                      {value.trim().length > 0 && (
                        <span className="text-[10px] text-muted-foreground ml-auto tabular-nums">
                          {charCount(value)} 字
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground ml-6 mb-3">{section.subtitle}</p>

                    {/* Textarea */}
                    <textarea
                      className={`w-full resize-none text-sm leading-relaxed outline-none bg-transparent
                        placeholder:text-muted-foreground/40 transition-all
                        ${isActive ? '' : 'cursor-pointer'}`}
                      rows={isActive ? section.rows : Math.min(3, section.rows)}
                      placeholder={section.placeholder}
                      value={value}
                      onFocus={() => setActiveSection(section.key)}
                      onChange={e => setField(section.key, e.target.value)}
                    />
                  </div>

                  {/* Active indicator bar */}
                  {isActive && (
                    <div className="h-0.5 bg-black/80 rounded-b-xl mx-5 mb-px" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Reference Panel (right 40%) ── */}
        <div className="w-80 xl:w-96 shrink-0 border-l overflow-y-auto bg-slate-50/50">
          <div className="px-5 py-6">

            {/* Panel header */}
            <div className="mb-5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                参照パネル
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {SECTIONS.find(s => s.key === activeSection)?.title} の補助資料
              </p>
            </div>

            {/* Panel tabs */}
            <div className="flex gap-1 mb-5 flex-wrap">
              {SECTIONS.map(s => (
                <button
                  key={s.key}
                  onClick={() => setActiveSection(s.key)}
                  className={`text-[10px] px-2 py-1 rounded transition-colors ${
                    activeSection === s.key
                      ? 'bg-black text-white'
                      : 'bg-white border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {s.index}. {s.title}
                </button>
              ))}
            </div>

            {/* Panel content */}
            <ReferencePanel
              activeSection={activeSection}
              onInsert={handleInsert}
              answers={answers}
            />
          </div>
        </div>
      </div>
    </>
  );
}
