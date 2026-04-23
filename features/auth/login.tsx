'use client'

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

// supabase
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function Login() {
    const supabase = createClient();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async () => {
        setErrorMessage('');
        const { data, error } = await supabase.auth.signInWithPassword({
            email, password
        })
        if (error) {
            setErrorMessage('メールアドレスまたはパスワードが正しくありません');
            return;
        }
        router.push('/');
    }

    const handleForgotPassword = () => {
        router.push('/forgot_password');
    }
    

    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            <h1 className="text-2xl">ログイン</h1>
            <div>
                <div className="py-4">
                    <h1 className="font-bold">メールアドレス</h1>
                    <Input
                        type="email"
                        name="email"
                        style={{ height: 50, fontSize: "1.2rem" }}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="py-4 flex flex-col gap">
                    <div className="flex justify-between items-end">
                        <h1 className="font-bold">パスワード</h1>
                        <div
                        className="text-sm cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                        onClick={handleForgotPassword}
                        >
                        パスワードを忘れた
                        </div>
                    </div>
                    <Input
                        type="password"
                        name="password"
                        style={{ height: 50, fontSize: "1.2rem" }}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="flex justify-between items-end">
                    <Button
                        color="primary"
                        onClick={() => handleLogin()}
                    >
                        ログイン
                    </Button>
                    <div className="text-sm text-muted-foreground">
                        アカウントをお持ちでないですか？ 
                        <span 
                            className="text-black font-bold text-sm cursor-pointer hover:text-foreground transition-colors"
                            onClick={() => router.push('/register')}
                        >
                            新規登録
                        </span>
                    </div>
                </div>
                {errorMessage && (
                    <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
                )}
            </div>
        </div>
    )
}