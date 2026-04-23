'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function Logout() {
    const supabase = createClient();
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogout = async () => {
        setErrorMessage('');
        const { error } = await supabase.auth.signOut();
        if (error) {
            setErrorMessage('ログアウトに失敗しました。再度お試しください');
        } else {
            router.push('/');
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            <div className="mb-6 flex">
                <div
                    className="flex items-center p-2 pr-4 rounded-full cursor-pointer hover:bg-accent group transition-colors"
                    onClick={() => window.history.back()}
                >
                    <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="ml-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        戻る
                    </span>
                </div>
            </div>

            <div className="py-2">
                <div className="text-2xl">ログアウト</div>
                <div className="text-sm text-muted-foreground mt-1">
                    本当にログアウトしますか？
                </div>
            </div>

            <div className="flex gap-3 mt-8">
                <Button
                    variant="outline"
                    onClick={() => window.history.back()}
                >
                    キャンセル
                </Button>
                <Button
                    onClick={handleLogout}
                >
                    ログアウト
                </Button>
            </div>

            {errorMessage && (
                <p className="text-red-500 text-sm mt-4">{errorMessage}</p>
            )}
        </div>
    );
}