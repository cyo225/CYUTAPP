import React, { useState } from 'react';
import { motion } from 'motion/react';
import { NavigationTab, StudentProfile } from '../types';
import { LogOut, Download, User, Share, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface NavbarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onOpenDrawer: () => void;
  profile: StudentProfile;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenDrawer,
  profile,
  onOpenAuth,
  onLogout,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  const navItems: { id: NavigationTab; label: string }[] =
    profile.role === 'merchant'
      ? [
          { id: 'merchant-portal', label: '商家後台' },
          { id: 'rewards', label: '預覽學生市集' },
        ]
      : profile.role === 'teacher'
      ? [
          { id: 'overview', label: '教師總覽' },
          { id: 'academic', label: '授課課表' },
          { id: 'ai-tutor', label: '教師 AI 助手' },
          { id: 'rewards', label: '學生市集' },
          { id: 'campus-3d', label: '3D 校園地圖' },
          { id: 'social', label: '校園社群' },
        ]
      : [
          { id: 'overview', label: '校園總覽' },
          { id: 'academic', label: '課表與任務' },
          { id: 'ai-tutor', label: 'AI 導師' },
          { id: 'rewards', label: '美食與優惠券商城' },
          { id: 'campus-3d', label: '3D 地圖' },
          { id: 'social', label: '社群' },
        ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0B0F17]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 md:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Dynamic Accent Brand Wordmark + Expansion Hub Trigger */}
        <motion.button
          type="button"
          onClick={onOpenDrawer}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.94 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          aria-label="展開校園生態系擴充選單"
          title="點擊開啟校園功能擴充選單"
          className="flex items-center gap-2.5 group text-left focus-ring-accent rounded-xl shrink-0 min-h-[44px] pr-1 cursor-pointer"
        >
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            {/* Idle Subtle Breathing Ambient Glow */}
            <motion.span
              aria-hidden="true"
              animate={{
                opacity: [0.3, 0.78, 0.3],
                scale: [0.94, 1.08, 0.94],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 rounded-xl bg-accent-soft blur-[7px] pointer-events-none"
            />

            {/* Subtle Rotating Halo Ring */}
            <motion.span
              aria-hidden="true"
              animate={{ rotate: 360 }}
              transition={{
                duration: 14,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute -inset-[2px] rounded-[14px] border border-dashed border-accent-soft transition-colors pointer-events-none"
            />

            {/* Main Hexagonal Accent C Container */}
            <div className="relative w-9 h-9 rounded-xl bg-slate-900 dark:bg-gradient-to-br dark:from-[#1B2233] dark:via-[#0F141F] dark:to-[#070A10] border border-accent-soft glow-accent transition-all flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="w-5 h-5" fill="none">
                <path
                  d="M20 4L34 12V28L20 36L6 28V12L20 4Z"
                  stroke="var(--accent-bright)"
                  strokeWidth="2.6"
                  strokeLinejoin="round"
                />
                <path
                  d="M25.5 15.2C24.2 13.8 22.3 13 20.1 13C15.9 13 12.8 16 12.8 20C12.8 24 15.9 27 20.1 27C22.4 27 24.3 26.1 25.6 24.7"
                  stroke="#FFFFFF"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
                <circle cx="27" cy="20" r="2.2" fill="var(--accent-bright)" />
              </svg>
            </div>
          </div>

          <span className="text-lg font-extrabold tracking-wider text-slate-900 dark:text-white whitespace-nowrap shrink-0">
            CAMPUS <span className="text-accent">CYUT</span>
          </span>
        </motion.button>

        {/* Zone 2: Clean Single-Line Text Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`whitespace-nowrap shrink-0 transition-colors py-1.5 ${
                activeTab === item.id
                  ? 'text-accent font-bold border-b-2 border-accent'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary Action Zone */}
        <div className="flex items-center gap-2.5 shrink-0">
          {!isInstalled && (isInstallable || isIOS) && (
            <button
              type="button"
              onClick={() => {
                if (isInstallable) {
                  void install();
                } else if (isIOS) {
                  setShowIOSGuide(true);
                }
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-accent" />
              <span className="hidden sm:inline">安裝 App</span>
            </button>
          )}

          {profile.isLoggedIn ? (
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-1 pr-2.5">
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 hover:opacity-85 transition text-left"
              >
                <div className="w-7 h-7 rounded-full bg-slate-300 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600 shrink-0">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight whitespace-nowrap">
                    {profile.name}
                  </div>
                  <div className="text-[10px] text-accent font-semibold font-mono tabular-nums leading-tight whitespace-nowrap">
                    {profile.role === 'student'
                      ? `${profile.points.toLocaleString()} PTS`
                      : profile.role === 'teacher'
                      ? `教師 · ${profile.points.toLocaleString()} PTS`
                      : `商家 · ${profile.points.toLocaleString()} PTS`}
                  </div>
                </div>
              </button>
              <button
                onClick={onLogout}
                title="登出帳號"
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-lg transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition whitespace-nowrap"
            >
              <User className="w-3.5 h-3.5" />
              <span>登入</span>
            </button>
          )}
        </div>
      </div>

      {/* iOS Safari Install Guide Modal */}
      {showIOSGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4"
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                在 iOS 主畫面安裝 CampusCYUT
              </h3>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ol className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <li className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-accent-soft text-accent font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <span className="flex items-center gap-1.5 flex-wrap">
                  點擊 Safari 工具列的 <Share className="w-4 h-4 text-accent inline" /> 「分享」按鈕
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-accent-soft text-accent font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <span className="flex items-center gap-1.5 flex-wrap">
                  向下捲動並選擇 <PlusSquare className="w-4 h-4 text-accent inline" /> 「加入主畫面」
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-accent-soft text-accent font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <span>點擊右上角「新增」即可獲得原生 App 體驗</span>
              </li>
            </ol>
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-xs font-bold transition"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
