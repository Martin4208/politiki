'use client';

import { useRouter } from 'next/navigation';

export default function Evaluation() {
    const router = useRouter();

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-2xl mx-auto px-6 py-12 space-y-12">
                <button
                    onClick={() => router.push('/about')}
                    className="flex items-center px-4 py-2.5 rounded-lg text-sm border hover:bg-accent hover:cursor-pointer transition-colors"
                    >
                    戻る
                </button>
                
                <h1 className="text-3xl font-bold tracking-tight">評価について</h1>
                <div className="p-4  bg-card space-y-4">
                    <div className="space-y-1.5">
                        <h3 className="text-sm font-bold flex items-center gap-2">
                                {/* <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" /> */}
                            達成
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed pl-3.5">
                            法案が成立し、かつ公約の主要要素をカバーしている。
                        </p>
                    </div>

                    <div className="pt-3 space-y-1.5">
                        <h3 className="text-sm font-bold flex items-center gap-2">
                            {/* <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" /> */}
                            進行中
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed pl-3.5">
                            関連法案はあるが、まだ成立していない（審議中など）。
                        </p>
                    </div>

                    <div className="pt-3 space-y-1.5">
                        <h3 className="text-sm font-bold flex items-center gap-2">
                            {/* <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" /> */}
                            一部達成
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed pl-3.5">
                            法案は成立したが、公約の一部しかカバーしていない。
                        </p>
                    </div>

                    <div className="pt-3 space-y-1.5">
                        <h3 className="text-sm font-bold flex items-center gap-2">
                            {/* <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" /> */}
                            未着手
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed pl-3.5">
                            関連する法案自体が存在しない。
                        </p>
                    </div>

                    <div className="pt-3 space-y-1.5">
                        <h3 className="text-sm font-bold flex items-center gap-2">
                            {/* <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" /> */}
                            逆行
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed pl-3.5">
                            公約と逆方向の法案。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}