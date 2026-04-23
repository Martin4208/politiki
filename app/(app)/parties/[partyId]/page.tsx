'use client';

import { useMemo } from 'react';
import { parties } from '@/lib/parties';
import { politicalThoughts } from '@/lib/philosophy/politics';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useQuizStore } from '@/stores/quizStore';
import { stances_for_quick_questions } from '@/types/party-stance-data';
import { questions } from '@/lib/quiz/quick/questions';

const TO_STANCE_ID: Record<string, string> = {
    centrist_reform_alliance: 'cra',
    jrp: 'ishin',
};

const STANCE_STYLE: Record<number, { label: string; bg: string; text: string; bar: string }> = {
    5: { label: '強く賛成', bg: 'bg-blue-100', text: 'text-blue-700', bar: 'bg-blue-500' },
    4: { label: '賛成',     bg: 'bg-blue-50',  text: 'text-blue-600', bar: 'bg-blue-300' },
    3: { label: 'どちらでもない', bg: 'bg-gray-100', text: 'text-gray-600', bar: 'bg-gray-300' },
    2: { label: '反対',     bg: 'bg-red-50',   text: 'text-red-600',  bar: 'bg-red-300' },
    1: { label: '強く反対', bg: 'bg-red-100',  text: 'text-red-700',  bar: 'bg-red-500' },
};

const allStances = stances_for_quick_questions[0];

export default function PartyDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { answers } = useQuizStore();

    const partyId = params.partyId as string;
    const party = parties.find(p => p.id === partyId);

    const stanceId = TO_STANCE_ID[partyId] ?? partyId;
    const partyStances = allStances[stanceId];

    const similarity = useMemo(() => {
        if (!partyStances) return null;
        let totalDiff = 0;
        let count = 0;
        for (const q of questions) {
            const userAnswer = answers[String(q.id)];
            if (userAnswer == null) continue;
            const ps = partyStances[q.learnSlug]?.stance;
            if (ps == null) continue;
            totalDiff += Math.abs(userAnswer - ps);
            count++;
        }
        if (count === 0) return null;
        return Math.round(Math.max(0, (1 - totalDiff / count / 4) * 100));
    }, [answers, partyStances]);

    // カテゴリ順を保ちながらグループ化
    const groupedStances = useMemo(() => {
        const seen = new Set<string>();
        const groups: { category: string; items: { question: typeof questions[0]; stance: 1 | 2 | 3 | 4 | 5 | null; note: string }[] }[] = [];
        for (const q of questions) {
            if (!seen.has(q.category)) {
                seen.add(q.category);
                groups.push({ category: q.category, items: [] });
            }
            const entry = partyStances?.[q.learnSlug];
            groups[groups.length - 1].items.push({
                question: q,
                stance: (entry?.stance ?? null) as 1 | 2 | 3 | 4 | 5 | null,
                note: entry?.note ?? '',
            });
        }
        return groups;
    }, [partyStances]);

    const allAvailablePhilosophies = [
        ...(politicalThoughts?.categories || []).flatMap(c => c.philosophies || []),
    ];

    if (!partyId) return <div>政党が見つかりません</div>;
    if (!party) return <div className="p-10 text-center">政党が見つかりません</div>;

    const tags = party.philosophical_tags || [];
    const relatedPhilosophies = tags.map(tagId => {
        return allAvailablePhilosophies.find(p => p.id === tagId);
    }).filter((p): p is NonNullable<typeof p> => !!p);

    const answeredCount = Object.keys(answers).length;

    return (
        <div className="h-screen overflow-y-auto max-w-3xl mx-auto p-6 space-y-8 pb-24">

            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mb-0"
            >
                一覧に戻る
            </Button>

            {/* ヘッダーセクション */}
            <section className="text-center space-y-6 pt-6 pb-10 border-b">
                <div className="relative flex justify-center items-center mx-auto w-100 h-60 rounded-xl shadow-lg overflow-hidden border-4" style={{ borderColor: party.color }}>
                    {party.logoUrl ? (
                        <Image
                            src={party.logoUrl}
                            alt={`${party.name}の旗`}
                            fill
                            className="object-cover"
                            unoptimized
                            priority
                        />
                    ) : (
                        <div className="absolute inset-0 flex justify-center items-center text-white font-black text-4xl uppercase tracking-tighter" style={{ backgroundColor: party.color }}>
                            {party.shortName}
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/5 opacity-30" />
                </div>

                <div className="space-y-3">
                    <div className="inline-block px-4 py-1 rounded-full text-white text-xs font-bold uppercase tracking-widest"
                        style={{ backgroundColor: party.color }}>
                        {party.status}
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-slate-900">{party.name}</h1>
                    <p className="text-xl text-muted-foreground font-medium max-w-xl mx-auto leading-relaxed">
                        {party.description}
                    </p>
                </div>
            </section>

            {/* 一致度カード */}
            <Card className="bg-slate-900 text-white overflow-hidden border-none">
                <CardHeader>
                    <CardTitle className="text-lg font-light">あなたとの政策一致度</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {similarity !== null ? (
                        <>
                            <div className="text-5xl font-bold" style={{ color: party.color }}>{similarity}%</div>
                            <Progress value={similarity} className="h-2 bg-slate-700" />
                            <p className="text-sm text-slate-400">
                                {answeredCount}問の回答をもとに算出した政策スタンスの一致度です。
                            </p>
                        </>
                    ) : (
                        <div className="space-y-2">
                            <div className="text-5xl font-bold text-slate-500">—</div>
                            <p className="text-sm text-slate-400">
                                クイック診断を回答すると、この政党との一致度が表示されます。
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 哲学の柱 */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold border-b pb-2">この政党を支える「哲学の柱」</h2>
                <div className="grid gap-4">
                    {relatedPhilosophies.map((philo) => (
                        <Card key={philo.id} className="border-l-4" style={{ borderLeftColor: party.color }}>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg">{philo.name}</CardTitle>
                                    <Badge variant="outline">{philo.core_value}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="text-sm font-semibold text-slate-600">【論理の核】</p>
                                <p className="text-sm leading-relaxed">{philo.logic}</p>
                                <div className="bg-slate-50 p-3 rounded text-sm italic text-slate-500">
                                    「{philo.output_template}」
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* 主要政策 */}
            {party.key_policy && (
                <section className="bg-slate-50 p-6 rounded-xl border-dashed border-2">
                    <h2 className="text-lg font-bold mb-3">2026年 最重要マニフェスト</h2>
                    <p className="text-sm leading-relaxed">{party.key_policy}</p>
                </section>
            )}

            {/* 政策スタンス一覧 */}
            {partyStances ? (
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold border-b pb-2">政策スタンス</h2>
                    {groupedStances.map(({ category, items }) => (
                        <div key={category} className="space-y-2">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">{category}</h3>
                            <div className="space-y-2">
                                {items.map(({ question, stance, note }) => {
                                    const style = stance != null ? STANCE_STYLE[stance] : null;
                                    return (
                                        <div key={question.id} className="border rounded-xl p-4 space-y-2">
                                            {/* 質問文 + スタンスバッジ */}
                                            <div className="flex items-start justify-between gap-3">
                                                <p className="text-sm font-medium leading-snug flex-1">{question.text}</p>
                                                {style ? (
                                                    <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                                                        {style.label}
                                                    </span>
                                                ) : (
                                                    <span className="shrink-0 text-[11px] text-muted-foreground border rounded-full px-2.5 py-0.5">
                                                        データなし
                                                    </span>
                                                )}
                                            </div>

                                            {/* スタンスバー */}
                                            {stance != null && style && (
                                                <div className="flex gap-0.5 h-1.5">
                                                    {[1, 2, 3, 4, 5].map(v => (
                                                        <div
                                                            key={v}
                                                            className={`flex-1 rounded-sm ${v <= stance ? style.bar : 'bg-gray-100'}`}
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            {/* 根拠・注記 */}
                                            {note && (
                                                <p className="text-xs text-muted-foreground leading-relaxed">{note}</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </section>
            ) : (
                <section className="border border-dashed rounded-xl p-6 text-center space-y-1">
                    <p className="text-sm font-medium">この政党の政策スタンスデータはまだありません</p>
                </section>
            )}
        </div>
    );
}
