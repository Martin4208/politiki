'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function ChangePassword() {
    const router = useRouter();
    
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSendNewPassword = async () => {
        setErrorMessage('');
        setSuccessMessage('');
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
            setErrorMessage('パスワードの変更に失敗しました。再度お試しください');
            return;
        }
        setSuccessMessage('パスワードを変更しました');
        setTimeout(() => router.push('/login'), 1500);
    }

    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            <div className="py-2">
                <div className="text-2xl">新しいパスワードを設定</div>
                <div className="text-sm text-muted-foreground mt-1">
                    新しいパスワードを入力してください。
                </div>
            </div>

            <div className="py-5">
                <h1 className="font-bold">新しいパスワード</h1>
                <Input
                    type="password"
                    name="password"
                    style={{ height: 50, fontSize: "1.2rem" }}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <Button onClick={handleSendNewPassword}>
                変更する
            </Button>

            {errorMessage && (
                <p className="text-red-500 text-sm mt-4">{errorMessage}</p>
            )}
            {successMessage && (
                <p className="text-green-500 text-sm mt-4">{successMessage}</p>
            )}
        </div>
    )
}