'use client';

import { parties } from '@/lib/parties';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function Parties() {
    const router = useRouter();

    return (
        <div className="min-h-screen">
            <div className="max-w-4xl mx-auto p-4 space-y-4 overflow-y-auto h-screen pb-32">
                <h1 className="text-2xl font-bold mb-6">政党・勢力一覧 (2026)</h1>
                
                {parties.map((party) => (
                    <Card
                        key={party.id}
                        className="transition-all hover:shadow-md border-l-8"
                        style={{ borderLeftColor: party.color }} // 政党色を左端のラインで表現
                    >
                        <CardHeader className="flex flex-row justify-between items-start space-y-0">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <CardTitle className="text-xl">{party.name}</CardTitle>
                                    <span className="text-xs px-2 py-0.5 rounded-full border" 
                                          style={{ color: party.color, borderColor: party.color }}>
                                        {party.shortName}
                                    </span>
                                </div>
                                <CardDescription className="font-medium text-slate-600">
                                    {party.status}
                                </CardDescription>
                            </div>
                            <div className="text-right text-xs text-muted-foreground">
                                衆院:{party.seats.representatives} / 参院:{party.seats.councillors}
                            </div>
                        </CardHeader>

                        <CardContent>
                            <p className="text-sm text-slate-700 mb-4 line-clamp-2">
                                {party.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-1 mb-4">
                                {party.philosophical_tags.map((tag) => (
                                    <span key={tag} className="bg-slate-100 text-[10px] px-2 py-0.5 rounded text-slate-500">
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            <Button
                                className="w-full sm:w-auto text-white"
                                style={{ backgroundColor: party.color }} // ボタン背景を政党色に
                                onClick={() => router.push(`/parties/${party.id}`)}
                            >
                                詳しく
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}