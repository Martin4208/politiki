'use client';

import { Input } from '@/components/ui/input';
import { useAuth } from '@/providers/auth-provider';
import { Avatar } from '@/utils/get-avatar';
import { useState, useEffect } from 'react';

export default function Profile() {
    const { user } = useAuth();
    const [name, setName] = useState('');

    // user は非同期取得のため useEffect で初期化
    useEffect(() => {
        if (user?.email) {
            setName(user.email.split('@')[0]);
        }
    }, [user]);

    // 1. Guard: If user is null, show a loading state
    if (!user) {
        return <div className="p-6">読み込み中...</div>;
    }


    // async function updateName() {
    //     const error = await fetch('/api/user', {
    //         method: 'PATCH',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify({ name })
    //     })
    //     console.log(error)
    // }

    return (
        <div className="max-w-2xl mx-auto px-6 py-12 space-y-5">
            <h1>プロフィール</h1>
            <div>
                <h2>アカウント</h2>
            </div>
            <div>
                <p>メールアドレス</p>
                <Input
                    value={user.email ?? ''}
                    disabled
                />
            </div>
            <div>
                <p>表示名</p>
                <Input 
                    value={name}
                    readOnly
                />
            </div>
            {/* <button
                className="border rounded-md hover:bg-slate-100 cursor-pointer px-3 py-1"
                onClick={updateName}
            >
                Update name
            </button> */}
            <div>
                <p>プロフィール画像</p>
                <Avatar name={name || 'User'} />
            </div>
            <div 
                className=""
            >
                <h1
                    className="text-2xl font-bold border-b text-red-600"
                >
                    アカウントを削除する
                </h1>
                <div>
                    <p>一度削除したアカウントは復元できません。</p>
                    <button
                        className="border border-red-300 rounded-md px-3 py-1
                                hover:bg-red-600 hover:text-white
                                cursor-pointer text-red-600 text-sm font-medium transition-all"
                    >
                        アカウントを削除する
                    </button>
                </div>
            </div>
        </div>
    )
} 