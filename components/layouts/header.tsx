'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';

export function Header() {
    const router = useRouter();
    const { user } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="relative border-b bg-white">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
                {/* ロゴ */}
                <Button
                    variant="ghost"
                    className="text-xl sm:text-2xl font-bold tracking-wider hover:bg-transparent p-0 h-auto"
                    onClick={() => router.push('/')}
                >
                    POLITIKI
                </Button>

                {/* PC: 横並びボタン */}
                <div className="hidden sm:flex gap-4">
                    <Button
                        onClick={() => router.push('/about/eval_data')}
                        className="text-sm font-medium bg-black hover:bg-gray-800 transition-colors"
                    >
                        評価・データについて
                    </Button>
                    <Button
                        onClick={() => router.push('/about')}
                        className="text-sm font-medium bg-black hover:bg-gray-800 transition-colors"
                    >
                        このアプリについて
                    </Button>
                </div>

                {/* スマホ: ハンバーガー */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="sm:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="メニュー"
                >
                    <div className="flex flex-col justify-center gap-1.5 w-5 h-5">
                        <span className={`block h-0.5 w-full bg-black transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                        <span className={`block h-0.5 w-full bg-black transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
                        <span className={`block h-0.5 w-full bg-black transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                    </div>
                </button>
            </div>

            {/* スマホ: ドロップダウンメニュー */}
            {menuOpen && (
                <div className="sm:hidden border-t bg-white px-4 py-2">
                    <button
                        onClick={() => { router.push('/about/data'); setMenuOpen(false); }}
                        className="w-full text-left px-3 py-3 text-sm rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        評価・データについて
                    </button>
                    <button
                        onClick={() => { router.push('/about'); setMenuOpen(false); }}
                        className="w-full text-left px-3 py-3 text-sm rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        このアプリについて
                    </button>
                </div>
            )}
        </header>
    );
}