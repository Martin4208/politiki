'use client'

import Link from 'next/link'
import Dashboard from './(app)/dashboard/page';
import { useAuth } from '../providers/auth-provider';
import { useSearchParams, useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import PledgeTrackerPage from './(app)/pledge_tracker/page';
import RepairPage from './repair';

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams();
  const isGuest = searchParams.get('guest') === 'true';

  const { user } = useAuth();
  
  if (user) return <Dashboard />

  return (
    <>
      {true && (
        <RepairPage />
      )}
      
      {false && (
        <PledgeTrackerPage />
      )}
      {/*
        <div className="pt-70">
         <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold">
            あなたの政治的価値観を知る
          </h1>

        <p className="text-gray-500">
          いくつかの質問に答えて、あなたの政治プロフィールを確認しましょう。
        </p>

          <Link
            href="/questions/quick"
            className="px-6 py-3 bg-black text-white"
          >
            診断を始める
          </Link>
        </div>

      {isGuest && (
        <div className="max-w-3xl mx-auto px-6 py-12">
          <Alert className="bg-amber-50 border-amber-200">
            <LogIn className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">ゲストモードで表示中</AlertTitle>
            <AlertDescription className="text-amber-700 flex items-center justify-between">
              回答結果はブラウザを閉じると消えてしまいます。保存するにはアカウントを作成してください。
              <Button 
                size="sm" variant="outline" className="ml-4 border-amber-300"
                onClick={() => router.push('/login')}
              >  
                ログイン・登録
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )} 
    </div>*/}
    </>
  )
}