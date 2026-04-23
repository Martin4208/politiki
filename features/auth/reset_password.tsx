'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

export function ResetPassword() {
    const supabase = createClient();
    const [email, setEmail] = useState('');

    const handleSendEmail = async () => {
        await supabase.auth.resetPasswordForEmail(
            email, {
                redirectTo: `${window.location.origin}/change_password`,
            }
        );
    }

    return (
        <div>
            <h1>メールアドレスを入力してください：</h1>
            <Input
                type="email"
                name="email"
                onChange={(e) => setEmail(e.target.value)}
            />
            <Button
                onClick={handleSendEmail}
            >
                送信
            </Button>
        </div>
    )
}