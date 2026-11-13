import React from 'react';
import { motion } from 'motion/react';
import { NavigationTab, StudentProfile } from '../types';
import { LogOut, Download, User } from 'lucide-react';
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
  const { isInstallable, install } = usePWAInstall();

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
          { id: 'rewards', label: '學生市集' },
          { id: 'campus-life', label: '校園生活' },
          { id: 'campus-3d', label: '3D 地圖' },
          { id: 'social', label: '社群' },
        ];

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F17]/95 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Redesigned Futuristic Neon Crimson Brand Wordmark + Expansion Hub Trigger */}
        <motion.button
          type="button"
          onClick={onOpenDrawer}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.94 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          aria-label="展開校園生態系擴充選單"
          title="點擊開啟校園功能擴充選單"
          className="flex items-center gap-2.5 group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914] rounded-xl shrink-0 min-h-[44px] pr-1 cursor-pointer"
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
              className="absolute inset-0 rounded-xl bg-[#E50914]/30 blur-[7px] pointer-events-none"
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
              className="absolute -inset-[2px] rounded-[14px] border border-dashed border-[#E50914]/45 group-hover:border-[#E50914]/85 transition-colors pointer-events-none"
            />

            {/* Main Hexagonal Crimson C Container */}
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#1B2233] via-[#0F141F] to-[#070A10] border border-[#E50914]/75 shadow-[0_0_16px_rgba(229,9,20,0.48)] group-hover:shadow-[0_0_24px_rgba(229,9,20,0.85)] transition-all flex items-center justify-center">
              <svg
                viewBox="0 0 40 40"
                className="w-5 h-5 drop-shadow-[0_0_8px_rgba(229,9,20,0.9)]"
                fill="none"
              >
                <path
                  d="M20 4L34 12V28L20 36L6 28V12L20 4Z"
                  stroke="#E50914"
                  strokeWidth="2.6"
                  strokeLinejoin="round"
                />
                <path
                  d="M25.5 15.2C24.2 13.8 22.3 13 20.1 13C15.9 13 12.8 16 12.8 20C12.8 24 15.9 27 20.1 27C22.4 27 24.3 26.1 25.6 24.7"
                  stroke="#FFFFFF"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
                <circle cx="27" cy="20" r="2.2" fill="#E50914" />
              </svg>
            </div>
          </div>

          <span className="text-lg font-extrabold tracking-wider text-white whitespace-nowrap shrink-0">
            CAMPUS{' '}
            <span className="text-[#E50914] drop-shadow-[0_0_10px_rgba(229,9,20,0.65)]">
              CYUT
            </span>
          </span>
        </motion.button>

        {/* Zone 2: Clean Single-Line Text Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`whitespace-nowrap shrink-0 transition-colors py-1.5 ${
                activeTab === item.id
                  ? 'text-[#E50914] font-bold border-b-2 border-[#E50914]'
                  : 'hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary Action Zone */}
        <div className="flex items-center gap-2.5 shrink-0">
          {isInstallable && (
            <button
              onClick={install}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-[#E50914]" />
              <span>安裝 PWA</span>
            </button>
          )}

          {profile.isLoggedIn ? (
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl p-1 pr-2.5">
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 hover:opacity-85 transition text-left"
              >
                <div className="w-7 h-7 rounded-full bg-slate-700 overflow-hidden border border-slate-600 shrink-0">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-white leading-tight whitespace-nowrap">
                    {profile.name}
                  </div>
                  <div className="text-[10px] text-[#E50914] font-semibold font-mono tabular-nums leading-tight whitespace-nowrap">
                    {profile.role === 'student'
                      ? `${profile.points} PTS`
                      : profile.role === 'teacher'
                      ? '教師帳號'
                      : '特約商家'}
                  </div>
                </div>
              </button>
              <button
                onClick={onLogout}
                title="登出帳號"
                className="text-slate-400 hover:text-white p-1.5 rounded-lg transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition whitespace-nowrap"
            >
              <User className="w-3.5 h-3.5" />
              <span>登入</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
