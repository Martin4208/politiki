'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export function ForgotPassword() {
    const router = useRouter();
    const supabase = createClient();
    const [email, setEmail] = useState('');

    const handleSendEmail = async () => {
        await supabase.auth.resetPasswordForEmail(
            email, {
                redirectTo: `${window.location.origin}/change_password`,
            }
        );
        router.push('/check_email_forgot_password');
    }

    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            <div className="mb-6 flex">
                <div 
                    className="flex items-center p-2 pr-4 rounded-full cursor-pointer hover:bg-accent group transition-colors"
                    onClick={() => window.history.back()}
                >
                    {/* アイコン部分 */}
                    <ArrowLeft 
                    className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" 
                    />
                    
                    {/* テキスト部分 */}
                    <span className="ml-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    ログインに戻る
                    </span>
                </div>
            </div>
            <div className="py-2">
                <div className="text-2xl">
                    パスワードをリセット
                </div>
                <div className="text-sm text-muted-foreground">
                    登録に使用したメールアドレスにパスワードリセットのメールをお送りします。
                </div>
            </div>
            <div className="py-5">
                <h1>メールアドレスを入力してください：</h1>
                <Input
                    type="email"
                    name="email"
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <Button
                onClick={handleSendEmail}
            >
                送信
            </Button>
        </div>
    )
}