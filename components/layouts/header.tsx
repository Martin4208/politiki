'use client'

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';

export function Header() {
    const router = useRouter();
    const { user } = useAuth();

    return (
        <header className="flex items-center justify-between px-6 py-4 border-b bg-white">
            {/* 左側：ロゴ */}
            <Button 
                variant="ghost"
                className="text-2xl font-bold tracking-wider hover:bg-transparent p-0 h-auto"
                onClick={() => router.push('/')}
            >
                POLITIKI
            </Button>

            <div className="flex gap-6">
                {/* 右側：データについて */}
                <div>
                    <Button
                        onClick={() => router.push('/about/data')}
                        className="text-sm font-medium bg-black hover:bg-gray-800 transition-colors"
                    >
                        データについて
                    </Button>
                </div>
            
                {/* 右側：本アプリについて */}
                <div>
                    <Button
                        onClick={() => router.push('/about')}
                        className="text-sm font-medium bg-black hover:bg-gray-800 transition-colors"
                    >
                        このアプリについて
                    </Button>
                </div>
            </div>
            
            

            {/* 右側：ボタン群 */}
            {false && (
                <>
                {user ? (
                ''
            ) : (
                <div className="flex items-center gap-6">
                    <Button
                        onClick={() => router.push('/login')}
                        className="text-sm font-medium bg-black hover:bg-gray-800 transition-colors"
                    >
                        ログイン
                    </Button>

                    <Button
                        onClick={() => router.push('/register')}
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