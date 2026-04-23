'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CheckEmailRegister() {
    const router = useRouter();
    //const [email, setEmail] = useState('');

    return (
        <div className="max-w-3xl mx-auto px-6 py-12">

            <div className="py-2">
                <div className="text-2xl">
                    新規登録完了
                </div>
                <div className="text-sm text-muted-foreground">
                    登録に使用したメールアドレスに確認のメールをお送りします。メールのURLをクリックして認証をしてください。
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