'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
// supabase
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function Register() {
    const router = useRouter()
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    // const [agreedToTerms, setAgreedToTerms] = useState(false);

    const handleRegister = async () => {
        if (loading) return;
        setErrorMessage('');
        setLoading(true);
        const supabase = createClient();

        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
            // メール確認OFF時：Supabaseがエラーで重複を通知
            if (error.code === 'user_already_exists' || error.message.toLowerCase().includes('already registered')) {
                setErrorMessage('このメールアドレスはすでに登録されています。ログインしてください。');
            } else {
                setErrorMessage('登録に失敗しました。入力内容を確認してください');
            }
            setLoading(false);
            return;
        }

        // メール確認ON時：Supabaseはエラーを返さず identities が空になる
        if (data.user?.identities?.length === 0) {
            setErrorMessage('このメールアドレスはすでに登録されています。ログインしてください。');
            setLoading(false);
            return;
        }

        router.push('/check_email_register');
    }

    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            <h1 className="text-2xl">新規登録</h1>
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
                    </div>
                    <Input
                        type="password"
                        name="password"
                        style={{ height: 50, fontSize: "1.2rem" }}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {/* <div className="py-4">
                    <div style={{ height: '100px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px' }}>
                        利用規約全文...
                    </div>

                    <label className="mt-4 flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                        />
                        <span className="font-bold underline cursor-pointer">利用規約</span>に同意する
                    </label>
                </div> */}
                
                <Button
                    className=""
                    color="primary"
                    onClick={() => handleRegister()}
                >
                    登録
                </Button>
                {errorMessage && (
                    <div className="mt-2">
                        <p className="text-red-500 text-sm">{errorMessage}</p>
                        {errorMessage.includes('すでに登録') && (
                            <span
                                className="text-sm font-bold cursor-pointer hover:underline"
                                onClick={() => router.push('/login')}
                            >
                                ログインはこちら
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}