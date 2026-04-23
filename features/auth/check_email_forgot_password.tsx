'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CheckEmailForgotPassword() {
    const router = useRouter();
    //const [email, setEmail] = useState('');

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
                    パスワードリセットに戻る
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
                <div className="bg-gray-200 border border-gray-400 rounded-md">
                    メールが届くのに数分かかる場合があります。
                </div>
            </div>
            
            <Button
                onClick={() => router.push('/login')}
            >
                ログインへ
            </Button>
        </div>
    )
}