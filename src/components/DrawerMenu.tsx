import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CampusLifeSection, NavigationTab, StudentProfile } from '../types';
import {
  X,
  Bus,
  Home,
  Calendar,
  Utensils,
  Wrench,
  QrCode,
  ShieldAlert,
  BookMarked,
  ChevronRight,
  Layers,
  Settings,
  Gift,
} from 'lucide-react';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: NavigationTab;
  activeLifeSection: CampusLifeSection;
  onSelectTab: (tab: NavigationTab) => void;
  onSelectCampusSystem: (section: CampusLifeSection) => void;
  onOpenCouponLottery?: () => void;
  onOpenSettings: () => void;
  profile: StudentProfile;
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.25,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

export const DrawerMenu: React.FC<DrawerMenuProps> = ({
  isOpen,
  onClose,
  activeTab,
  activeLifeSection,
  onSelectTab,
  onSelectCampusSystem,
  onOpenCouponLottery,
  onOpenSettings,
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

  const handleNavigateTab = (tab: NavigationTab) => {
    onSelectTab(tab);
    onClose();
  };

  const handleNavigateSystem = (section: CampusLifeSection) => {
    onSelectCampusSystem(section);
    onClose();
  };

  const handleOpenSettings = () => {
    onClose();
    onOpenSettings();
  };

  const campusSystems: {
    id: string;
    title: string;
    desc: string;
    icon: React.ComponentType<{ className?: string }>;
    isActive: boolean;
    onClick: () => void;
  }[] = [
    {
      id: 'sys-transit',
      title: '大眾運輸交通工具系統',
      desc: '台中公車即時動態 · 131 / 132 / 151副線 / 158',
      icon: Bus,
      isActive: activeTab === 'transit',
      onClick: () => handleNavigateTab('transit'),
    },
    {
      id: 'sys-cafeteria',
      title: '學餐人流系統',
      desc: '餐廳擁擠程度辨識 · 即時座位密度',
      icon: Utensils,
      isActive: activeTab === 'campus-life' && activeLifeSection === 'cafeteria',
      onClick: () => handleNavigateSystem('cafeteria'),
    },
    {
      id: 'sys-repair',
      title: '校園報修系統',
      desc: '一鍵報修與賺取點數 (+50 PTS)',
      icon: Wrench,
      isActive: activeTab === 'campus-life' && activeLifeSection === 'repair',
      onClick: () => handleNavigateSystem('repair'),
    },
    {
      id: 'sys-locker',
      title: '教室借還數位化系統',
      desc: '智慧自取櫃 QR Code 與備用鑰匙取件',
      icon: QrCode,
      isActive: activeTab === 'campus-life' && activeLifeSection === 'locker',
      onClick: () => handleNavigateSystem('locker'),
    },
    {
      id: 'sys-calendar',
      title: '行事曆系統',
      desc: '年級事項、停修截止與假期提醒',
      icon: Calendar,
      isActive: activeTab === 'campus-life' && activeLifeSection === 'calendar',
      onClick: () => handleNavigateSystem('calendar'),
    },
    {
      id: 'sys-emergency',
      title: '緊急事件通報整合系統',
      desc: '24H 校安中心、警衛室與醫護專線',
      icon: ShieldAlert,
      isActive: activeTab === 'campus-life' && activeLifeSection === 'emergency',
      onClick: () => handleNavigateSystem('emergency'),
    },
    {
      id: 'sys-library',
      title: '圖書館系統',
      desc: '波生紀念圖書館自習座位與借閱狀態',
      icon: BookMarked,
      isActive: activeTab === 'campus-life' && activeLifeSection === 'library',
      onClick: () => handleNavigateSystem('library'),
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
            className="fixed inset-0 bg-slate-950/55 dark:bg-black/65 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Frosted Glass Slide-out Drawer */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="朝陽校園系統選單"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{
              duration: 0.32,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative z-10 w-[86vw] max-w-[350px] h-full bg-white/95 dark:bg-[#0B0F17]/94 backdrop-blur-2xl border-r border-slate-200 dark:border-slate-800/90 shadow-[16px_0_48px_rgba(15,23,42,0.2)] dark:shadow-[16px_0_48px_rgba(0,0,0,0.65)] flex flex-col overflow-hidden"
          >
            {/* Subtle Dynamic Top Accent Glow */}
            <div
              className="pointer-events-none absolute -top-24 -left-24 w-64 h-64 rounded-full bg-accent-soft blur-3xl"
              aria-hidden="true"
            />

            {/* Drawer Header */}
            <div className="relative flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800/80">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-gradient-to-br dark:from-[#1B2233] dark:via-[#0F141F] dark:to-[#070A10] border border-accent-soft glow-accent flex items-center justify-center shrink-0">
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
                <div className="min-w-0">
                  <div className="text-sm font-extrabold tracking-wider text-slate-900 dark:text-white truncate">
                    CAMPUS <span className="text-accent">CYUT</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    朝陽校園核心系統中心
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="關閉側邊選單"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition focus-ring-accent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Drawer Body */}
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="flex-1 overflow-y-auto px-4 py-4 space-y-5 netflix-scrollbar"
            >
              {/* User Identity Row */}
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80"
              >
                <img
                  src={profile.avatar}
                  alt={profile.name || '使用者頭像'}
                  className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-700 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {profile.name || '朝陽使用者'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {profile.department}
                    {profile.studentNo ? ` · ${profile.studentNo}` : ''}
                  </div>
                </div>
              </motion.div>

              {/* Quick Home & Points Lottery Links */}
              <motion.div variants={itemVariants} className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleNavigateTab(homeTab)}
                  className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                    activeTab === homeTab
                      ? 'bg-slate-200/80 dark:bg-slate-800/90 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/90 border border-slate-200 dark:border-slate-800/60'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Home className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span>{profile.role === 'merchant' ? '返回商家後台' : '返回主畫面總覽'}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onOpenCouponLottery) {
                      onOpenCouponLottery();
                      onClose();
                    } else {
                      handleNavigateTab('rewards');
                    }
                  }}
                  className="w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 hover:border-amber-400 transition"
                >
                  <span className="flex items-center gap-3">
                    <Gift className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <span>點數換優惠券・美食商城</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-amber-500" />
                </button>
              </motion.div>

              {/* Campus Utility Systems Hub */}
              <motion.div variants={itemVariants} className="space-y-2">
                <div className="px-1 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-accent" />
                    <span>校園核心公用系統</span>
                  </span>
                  <span className="text-[11px] font-mono tabular-nums text-slate-500">
                    {campusSystems.length} 項服務
                  </span>
                </div>

                <div className="space-y-2">
                  {campusSystems.map((sys) => {
                    const Icon = sys.icon;
                    return (
                      <motion.button
                        key={sys.id}
                        variants={itemVariants}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={sys.onClick}
                        className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                          sys.isActive
                            ? 'bg-accent-soft border-accent glow-accent'
                            : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800/90 hover:border-accent hover:bg-white dark:hover:bg-slate-900'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition ${
                            sys.isActive
                              ? 'bg-accent shadow-accent'
                              : 'bg-white dark:bg-slate-950 text-accent border border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {sys.title}
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {sys.desc}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>

            {/* Drawer Footer with Animated Settings Gear Button */}
            <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-950/60 text-[11px] text-slate-500 flex items-center justify-between gap-2">
              <span className="truncate">朝陽科技大學智慧校園中心</span>
              <motion.button
                type="button"
                onClick={handleOpenSettings}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                aria-label="開啟系統設定中心"
                className="group min-h-[38px] px-3 py-1.5 rounded-xl bg-accent-soft border border-accent-soft text-accent font-bold flex items-center gap-1.5 shrink-0 hover:glow-accent transition focus-ring-accent"
              >
                <motion.span
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  className="inline-flex items-center justify-center group-hover:scale-110 transition-transform"
                >
                  <Settings className="w-3.5 h-3.5" />
                </motion.span>
                <span>系統設定</span>
              </motion.button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
