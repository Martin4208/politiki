'use client'

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/auth-provider';

export function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const isActive = pathname !== '/about';
    const { user } = useAuth();

    const handleLogin = () => {
        router.push('/login')
    }

    const handleCreateAccount = () => {
        router.push('/register')
    }

    const handleAbout = () => {
        router.push('/about')
    }

    return (
        <header className="flex items-center justify-between px-6 py-4 border-b bg-white">
            {/* 左側：ロゴ */}
            <Button 
                variant="ghost"
                className="text-2xl font-bold tracking-wider hover:bg-transparent p-0 h-auto"
                onClick={() => router.push("/")}
            >
                POLITIKI
            </Button>

            {/* 右側：本アプリについて */}
            {isActive && (
                <div className="flex items-center gap-6">
                    <Button
                        onClick={handleAbout}
                        className="text-sm font-medium bg-black hover:bg-gray-800 transition-colors"
                    >
                        このアプリについて
                    </Button>
                </div>
            )}
            

            {/* 右側：ボタン群 */}
            {false && (
                <>
                {user ? (
                ''
            ) : (
                <div className="flex items-center gap-6">
                    <Button
                        onClick={handleLogin}
                        className="text-sm font-medium bg-black hover:bg-gray-800 transition-colors"
                    >
                        ログイン
                    </Button>

                    <Button
                        onClick={handleCreateAccount}
                        className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 transition-colors"
                    >
                        新規登録
                    </Button>
                </div>
            )}
                </>
            )}
            
        </header>
    )
}