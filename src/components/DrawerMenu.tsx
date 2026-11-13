import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavigationTab, StudentProfile } from '../types';
import {
  X,
  Bus,
  Home,
  Calendar,
  Clock,
  Utensils,
  Wrench,
  ChevronRight,
  Layers,
} from 'lucide-react';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  profile: StudentProfile;
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.28,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

export const DrawerMenu: React.FC<DrawerMenuProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  profile,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const homeTab: NavigationTab = profile.role === 'merchant' ? 'merchant-portal' : 'overview';

  const handleNavigate = (tab: NavigationTab) => {
    onSelectTab(tab);
    onClose();
  };

  const reservedModules = [
    {
      id: 'res-calendar',
      title: '校園行事曆',
      desc: '期中期末週、停修截止與重要校務時程',
      icon: Calendar,
    },
    {
      id: 'res-leave',
      title: '線上請假系統',
      desc: '請假申請、缺曠時數即時預警提醒',
      icon: Clock,
    },
    {
      id: 'res-cafeteria',
      title: '學餐人流即時監測',
      desc: '一餐、二餐與波浪廣場座位擁擠度分析',
      icon: Utensils,
    },
    {
      id: 'res-repair',
      title: '智慧教室報修',
      desc: '教室投影機、冷氣與網路設備快速報修',
      icon: Wrench,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex">
          {/* Backdrop Darkening Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Frosted Glass Obsidian Slide-out Drawer */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="校園生態系擴充選單"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{
              duration: 0.32,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative z-10 w-[86vw] max-w-[340px] h-full bg-[#0B0F17]/92 backdrop-blur-2xl border-r border-slate-800/90 shadow-[16px_0_48px_rgba(0,0,0,0.65)] flex flex-col overflow-hidden"
          >
            {/* Subtle Crimson Top Accent Glow */}
            <div
              className="pointer-events-none absolute -top-24 -left-24 w-64 h-64 rounded-full bg-[#E50914]/15 blur-3xl"
              aria-hidden="true"
            />

            {/* Drawer Header */}
            <div className="relative flex items-center justify-between px-5 py-4 border-b border-slate-800/80">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1B2233] via-[#0F141F] to-[#070A10] border border-[#E50914]/60 shadow-[0_0_14px_rgba(229,9,20,0.35)] flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 40 40" className="w-5 h-5" fill="none">
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
                <div className="min-w-0">
                  <div className="text-sm font-extrabold tracking-wider text-white truncate">
                    CAMPUS <span className="text-[#E50914]">CYUT</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    朝陽智慧校園擴充中心
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="關閉側邊選單"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Drawer Body */}
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="flex-1 overflow-y-auto px-4 py-5 space-y-6 netflix-scrollbar"
            >
              {/* User Identity Row */}
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-slate-900/70 border border-slate-800/80"
              >
                <img
                  src={profile.avatar}
                  alt={profile.name || '使用者頭像'}
                  className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white truncate">
                    {profile.name || '朝陽使用者'}
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {profile.department}
                    {profile.studentNo ? ` · ${profile.studentNo}` : ''}
                  </div>
                </div>
              </motion.div>

              {/* Quick Home Link */}
              <motion.div variants={itemVariants}>
                <button
                  type="button"
                  onClick={() => handleNavigate(homeTab)}
                  className={`w-full min-h-[46px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                    activeTab === homeTab
                      ? 'bg-slate-800/90 text-white border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/90 border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Home className="w-4 h-4 text-slate-400" />
                    <span>{profile.role === 'merchant' ? '返回商家後台' : '返回主畫面總覽'}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </motion.div>

              {/* Active Expansion Hub Feature */}
              <motion.div variants={itemVariants} className="space-y-2.5">
                <div className="px-1 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#E50914]" />
                    <span>校園生態系功能入口</span>
                  </span>
                  <span className="text-[11px] font-medium text-emerald-400">
                    已啟用 1 項
                  </span>
                </div>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNavigate('transit')}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3.5 ${
                    activeTab === 'transit'
                      ? 'bg-gradient-to-r from-[#E50914]/20 via-red-950/30 to-slate-900 border-[#E50914]/70 shadow-[0_0_24px_rgba(229,9,20,0.2)]'
                      : 'bg-slate-900/85 border-slate-800 hover:border-red-800/70 hover:bg-slate-900'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition ${
                      activeTab === 'transit'
                        ? 'bg-[#E50914] text-white shadow-lg shadow-red-950/60'
                        : 'bg-red-950/60 text-[#E50914] border border-red-900/50'
                    }`}
                  >
                    <Bus className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-white truncate">
                        大眾運輸交通工具系統
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      131 / 132 / 151 副線 / 158 即時到站與轉乘
                    </p>
                  </div>
                </motion.button>
              </motion.div>

              {/* Reserved Expansion Architecture Slots */}
              <motion.div variants={itemVariants} className="space-y-2.5 pt-2 border-t border-slate-800/70">
                <div className="px-1 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">
                    預留擴充架構模組
                  </span>
                  <span className="text-[11px] text-slate-500">後續陸續整合</span>
                </div>

                <div className="space-y-2">
                  {reservedModules.map((mod) => {
                    const Icon = mod.icon;
                    return (
                      <motion.div
                        key={mod.id}
                        variants={itemVariants}
                        className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center gap-3 opacity-75"
                      >
                        <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-300 truncate">
                              {mod.title}
                            </span>
                            <span className="text-[10px] text-slate-500 whitespace-nowrap shrink-0">
                              即將整合
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {mod.desc}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>

            {/* Drawer Footer */}
            <div className="px-5 py-3.5 border-t border-slate-800/80 bg-slate-950/50 text-[11px] text-slate-500 flex items-center justify-between">
              <span>朝陽科技大學智慧校園中心</span>
              <span>擴充架構就緒</span>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
