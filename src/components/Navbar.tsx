import React from 'react';
import { NavigationTab, StudentProfile } from '../types';
import { 
  Compass, 
  Sparkles, 
  Rocket, 
  User, 
  LogOut, 
  Download, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface NavbarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  profile: StudentProfile;
  onOpenAuth: () => void;
  onQuickLoadDemo: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  profile,
  onOpenAuth,
  onQuickLoadDemo,
  onLogout,
}) => {
  const { isInstallable, install, isIOS } = usePWAInstall();

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F17]/95 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark (Top Bar Contract: Single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => onTabChange('overview')}
            className="flex items-center gap-2 group text-left focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-[#E50914] flex items-center justify-center font-bold text-white shadow-lg shadow-red-950/40 group-hover:scale-105 transition-transform">
              C
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-white whitespace-nowrap">
                CAMPUS <span className="text-[#E50914]">CYUT</span>
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Clean single-line text links) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => onTabChange('overview')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'overview'
                ? 'text-[#E50914] font-semibold border-b-2 border-[#E50914]'
                : 'hover:text-white'
            }`}
          >
            校園總覽
          </button>
          <button
            onClick={() => onTabChange('academic')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'academic'
                ? 'text-[#E50914] font-semibold border-b-2 border-[#E50914]'
                : 'hover:text-white'
            }`}
          >
            課表與教務
          </button>
          <button
            onClick={() => onTabChange('ai-tutor')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              activeTab === 'ai-tutor'
                ? 'text-[#E50914] font-semibold border-b-2 border-[#E50914]'
                : 'hover:text-white'
            }`}
          >
            <span>AI 學習導師</span>
            <span className="text-[10px] bg-red-950/80 text-red-400 border border-red-800/60 px-1.5 py-0.2 rounded-full">
              BYOK
            </span>
          </button>
          <button
            onClick={() => onTabChange('rewards')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'rewards'
                ? 'text-[#E50914] font-semibold border-b-2 border-[#E50914]'
                : 'hover:text-white'
            }`}
          >
            點數與美食市場
          </button>
          <button
            onClick={() => onTabChange('campus-life')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'campus-life'
                ? 'text-[#E50914] font-semibold border-b-2 border-[#E50914]'
                : 'hover:text-white'
            }`}
          >
            校園生活與公車
          </button>
          <button
            onClick={() => onTabChange('campus-3d')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1 ${
              activeTab === 'campus-3d'
                ? 'text-[#E50914] font-semibold border-b-2 border-[#E50914]'
                : 'hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[#E50914]" />
            <span>3D 校園地圖</span>
          </button>
          <button
            onClick={() => onTabChange('social')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'social'
                ? 'text-[#E50914] font-semibold border-b-2 border-[#E50914]'
                : 'hover:text-white'
            }`}
          >
            社交朋友圈
          </button>
        </nav>

        {/* Zone 3: Primary Action Zone */}
        <div className="flex items-center gap-2.5 shrink-0">

          {/* In-App PWA Install Trigger */}
          {isInstallable && (
            <button
              onClick={install}
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
            >
              <Download className="w-3 h-3 text-[#E50914]" />
              <span>安裝 PWA</span>
            </button>
          )}

          {/* Profile / Account Trigger */}
          {profile.isLoggedIn ? (
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-lg p-1 pr-2.5">
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 hover:opacity-80 transition text-left"
              >
                <div className="w-7 h-7 rounded-full bg-slate-700 overflow-hidden border border-slate-600">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-white leading-tight">{profile.name}</div>
                  <div className="text-[10px] text-[#E50914] font-medium font-mono tabular-nums leading-tight">
                    {profile.points} PTS
                  </div>
                </div>
              </button>
              <button
                onClick={onLogout}
                title="登出帳號"
                className="text-slate-400 hover:text-white p-1 rounded transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
            >
              <User className="w-3.5 h-3.5" />
              <span>學生登入</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
