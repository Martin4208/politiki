'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import {
  LayoutGrid, ClipboardList, Building2, BookOpen, GitCompare,
  PanelRight, LucideIcon, User, LogOut, DollarSign, Activity
} from 'lucide-react';
import { Avatar } from '@/utils/get-avatar';
import { Button } from '@/components/ui/button';

// --- 型定義 ---
type NavItem = {
  id: number;
  name: string | null;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  avatar?: boolean;
};

const NAV: NavItem[] = [
  // { id: 1, name: 'ダッシュボード', href: '/', icon: LayoutGrid },
  // { id: 2, name: '診断', href: '/questions', icon: ClipboardList },
  // { id: 3, name: '政党', href: '/parties', icon: Building2 },
  // { id: 5, name: '学ぶ', href: '/learn', icon: BookOpen },
  // { id: 7, name: '財政', href: '/finance', icon: DollarSign },
  // { id: 8, name: '争点', href: '/issue', icon: GitCompare },
  { id: 9, name: 'トラッカー', href: '/pledge_tracker', icon: Activity }
];

// Currently not using
// const SETTINGS_NAV: NavItem = { id: 99, name: 'Settings', href: '#', icon: Settings };

// --- 設定モーダルコンポーネント ---
// const SettingsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
//       {/* 背景レイヤー */}
//       <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
//       {/* モーダル本体 */}
//       <div className="relative w-full max-w-md bg-background border rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in duration-200">
//         <div className="flex items-center justify-between p-4 border-b">
//           <h2 className="text-lg font-semibold">Settings</h2>
//           <button onClick={onClose} className="p-1 hover:bg-accent rounded-md transition-colors">
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         <div className="p-2">
//           {/* アカウントセクション */}
//           <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
//             Account
//           </div>
//           <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-accent rounded-md transition-colors">
//             <User className="w-4 h-4" /> <span>Profile Settings</span>
//           </button>
//           <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-accent rounded-md transition-colors">
//             <Shield className="w-4 h-4" /> <span>Privacy & Security</span>
//           </button>

//           <div className="my-2 border-t" />

//           {/* アプリ設定セクション */}
//           <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
//             Preferences
//           </div>
//           <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-accent rounded-md transition-colors">
//             <Bell className="w-4 h-4" /> <span>Notifications</span>
//           </button>
          
//           <div className="my-2 border-t" />

//           {/* ログアウト */}
//           <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors">
//             <LogOut className="w-4 h-4" /> <span>Log out</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// --- ナビゲーションボタン ---
const NavButton = ({ 
  item, 
  open, 
  isActive, 
  onClick 
}: { 
  item: NavItem; 
  open: boolean; 
  isActive: boolean;
  onClick: () => void;
}) => {
  const { name, icon: Icon, avatar } = item;

  return (
    <div className="relative flex items-center group">
      <button
        onClick={onClick}
        className={`
          w-full flex items-center rounded-md
          text-sm font-medium transition-all text-left cursor-pointer
          ${open ? 'px-3 py-2 gap-3' : 'justify-center py-2'} 
          ${isActive
            ? 'bg-accent text-black'
            : 'text-muted-foreground  hover:bg-accent'}
        `}
      >
        {avatar ? (
          <Avatar name={name ?? ''} />
        ) : (
          Icon && <Icon className="w-4 h-4 shrink-0" />
        )}
        {open && <span>{name}</span>}
      </button>

      {!open && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap z-50 opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
          {avatar ? '設定' : name}
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-gray-900" />
        </div>
      )}
    </div>
  );
};

// --- メインコンポーネント ---
export function Sidebar() {
  const router = useRouter();
  const { user } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const name = user?.email?.split('@')[0] ?? null
  const USER_NAV: NavItem = {
    id: 100,
    name: name,
    avatar: true,
    href: '#'
  };

  const checkActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const handleProfileSettings = () => {
    router.push('/settings/profile');
  }

  const handleLogout = () => {
    router.push('/logout');
  }
  
  
  return (
    <div
      className={`
        h-full flex flex-col border-r bg-background relative
        transition-all duration-300
        ${open ? 'w-40' : 'w-20'}
      `}
    >
      {/* toggle */}
      <div className={`flex mt-5 ${open ? 'justify-end pr-2' : 'justify-center'}`}>
        <div 
          className="p-2 rounded-full cursor-pointer hover:bg-accent group transition-colors"
          onClick={() => setOpen(!open)}
        >
          <PanelRight
            className="w-5 h-5 text-muted-foreground group-hover:text-foreground"
          />
        </div>
      </div>
      
      {/* メインナビゲーション */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 mt-4">
        {NAV.map((item) => (
          <NavButton 
            key={item.id} 
            item={item} 
            open={open} 
            isActive={checkActive(item.href)}
            onClick={() => router.push(item.href)}
          />
        ))}
      </nav>

      {false && (
        <>
          {/* 下部の設定セクション */}
          {user ? (
            <div className="px-3 py-4 border-t relative">
              {/* user info */}
              {/* {user && (
                <div 
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className={`flex items-center mb-2 ${open ? 'gap-2 px-2 py-1' : 'justify-center'}`}
                >
                  <Avatar name={name} />

                  {open && (
                    <span className="text-sm truncate">
                      {name}
                    </span>
                  )}
                </div>
              )} */}
              <NavButton 
                item={USER_NAV} 
                open={open} 
                isActive={isSettingsOpen}
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              />

              {/* --- 設定ポップオーバー (Settingsの隣に出現) --- */}
              {isSettingsOpen && (
                <>
                  {/* 透明なクリック判定レイヤー（これがあることで外をクリックして閉じられる） */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsSettingsOpen(false)} 
                  />
                  
                  <div className={`
                    absolute left-full bottom-4 ml-2 w-56 z-50
                    bg-background border rounded-lg shadow-xl p-2
                    animate-in fade-in slide-in-from-left-2 duration-200
                  `}>
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
                      アカウント
                    </div>
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                      onClick={handleProfileSettings}
                    >
                      <User className="w-4 h-4" /> <span>プロフィール</span>
                    </button>

                    <div className="my-1 border-t" />

                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
                      アプリ
                    </div>
                    <div className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground">
                      準備中...
                    </div>

                    <div className="my-1 border-t" />

                    <button
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" /> <span>ログアウト</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="px-3 py-4 border-t relative flex flex-col">
              {open ? (
                <div className="text-sm text-muted-foreground pb-5">
                  ログインをすることで、質問の回答が保存され、政策のグラフや政党との類似度を見ることができます。
                </div>
              ) : (
                <div></div>
              )}
              <Button
                className="justify-center items-center py-5"
                onClick={() => router.push('/login')}
              >
                ログイン
              </Button>
            </div>
          )}
        </>
      )}
      
    </div>
  );
}