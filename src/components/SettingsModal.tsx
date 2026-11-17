import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AppSettings,
  FontSizeScale,
  GoogleAccountBinding,
  NotificationSettings,
  StudentProfile,
  ThemeAccent,
  ThemeMode,
} from '../types';
import { ACCENT_THEME_OPTIONS, FONT_SIZE_OPTIONS } from '../utils/themeSettings';
import {
  X,
  User,
  Palette,
  Bell,
  LogOut,
  KeyRound,
  Sun,
  Moon,
  Check,
  Type,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Store,
  Sparkles,
  BookOpen,
  Megaphone,
  Clock,
  Users,
  BellRing,
  Eye,
  EyeOff,
  ChevronRight,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  settings: AppSettings;
  googleAccount: GoogleAccountBinding | null;
  onUpdateSettings: (updater: (prev: AppSettings) => AppSettings) => void;
  onLogout: () => void;
  onUpdatePassword: (newPassword: string) => void;
  onUpdateTronclassToken: (token: string) => void;
  onGoogleSignIn: (account: GoogleAccountBinding) => void;
  onGoogleSignOut: () => void;
  onTestClassReminder: () => void;
}

type SettingsCategory = 'account' | 'personalization' | 'notifications';

const ToggleSwitch: React.FC<{
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
  label: string;
}> = ({ checked, disabled = false, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border transition-all duration-200 focus-ring-accent ${
      disabled
        ? 'opacity-45 cursor-not-allowed bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
        : checked
        ? 'bg-accent border-transparent shadow-accent'
        : 'bg-slate-300 dark:bg-slate-700 border-slate-300 dark:border-slate-600'
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  settings,
  googleAccount,
  onUpdateSettings,
  onLogout,
  onUpdatePassword,
  onUpdateTronclassToken,
  onGoogleSignIn,
  onGoogleSignOut,
  onTestClassReminder,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsCategory>('personalization');
  const [showSecurityPanel, setShowSecurityPanel] = useState(false);

  // Account Password / Token inputs
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwdFields, setShowPwdFields] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);

  const [tokenInput, setTokenInput] = useState(profile.tronclassToken || '');
  const suggestedGoogleEmail = profile.studentNo
    ? profile.studentNo.includes('@')
      ? profile.studentNo
      : `${profile.studentNo}@gm.cyut.edu.tw`
    : 'student@gm.cyut.edu.tw';
  const [googleEmailInput, setGoogleEmailInput] = useState(
    googleAccount?.email || suggestedGoogleEmail
  );
  const [googleBindError, setGoogleBindError] = useState<string | null>(null);

  const roleMeta =
    profile.role === 'teacher'
      ? { label: '教師模式', icon: Briefcase }
      : profile.role === 'merchant'
      ? { label: '商家模式', icon: Store }
      : { label: '學生模式', icon: GraduationCap };

  const RoleIcon = roleMeta.icon;

  const setColorMode = (mode: ThemeMode) => {
    onUpdateSettings((prev) => ({ ...prev, colorMode: mode }));
  };

  const setAccentTheme = (accent: ThemeAccent) => {
    onUpdateSettings((prev) => ({ ...prev, accentTheme: accent }));
  };

  const setFontSize = (fontSize: FontSizeScale) => {
    onUpdateSettings((prev) => ({ ...prev, fontSize }));
  };

  const toggleNotificationKey = (key: keyof NotificationSettings, value: boolean) => {
    onUpdateSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);
    if (!newPwd.trim() || newPwd.trim().length < 6) {
      setPwdError('新密碼長度至少需 6 個字元');
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError('兩次輸入的新密碼不一致');
      return;
    }
    onUpdatePassword(newPwd.trim());
    setCurrentPwd('');
    setNewPwd('');
    setConfirmPwd('');
    setPwdSuccess('登入密碼已更新完成');
  };

  const handleTokenSave = () => {
    if (!tokenInput.trim()) return;
    onUpdateTronclassToken(tokenInput.trim());
  };

  const handleGoogleBind = () => {
    const clean = (googleEmailInput || suggestedGoogleEmail).trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setGoogleBindError('請輸入有效的 Google 帳號電子郵件');
      return;
    }
    setGoogleBindError(null);
    onGoogleSignIn({
      email: clean,
      name: profile.name || '朝陽使用者',
      connectedAt: new Date().toLocaleDateString('zh-TW'),
    });
  };

  const categories: {
    id: SettingsCategory;
    label: string;
    shortLabel: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'account', label: '帳號設置', shortLabel: '帳號', icon: User },
    { id: 'personalization', label: '個人化設置', shortLabel: '個人化', icon: Palette },
    { id: 'notifications', label: '通知設定', shortLabel: '通知', icon: Bell },
  ];

  const notifMasterOn = settings.notifications.masterEnabled;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/65 dark:bg-black/75 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Settings Modal Container */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="系統設定中心"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-[#0E1420] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/70">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-accent-soft border border-accent-soft flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-accent" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                    系統設定中心
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    帳號管理 · 主題配色 · 智慧校園通知偏好
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="關閉設定視窗"
                className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800 transition focus-ring-accent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Navigation Bar (Responsive: horizontal tabs on mobile, sidebar on desktop) */}
            <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
              <nav
                aria-label="設定分類"
                className="md:w-52 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-2.5 md:p-4 grid grid-cols-3 md:flex md:flex-col gap-1.5"
              >
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeTab === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveTab(cat.id)}
                      className={`min-h-[44px] px-3 py-2.5 rounded-xl flex items-center justify-center md:justify-start gap-2.5 text-xs sm:text-sm font-bold transition-all ${
                        isActive
                          ? 'bg-accent shadow-accent'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="hidden sm:inline truncate">{cat.label}</span>
                      <span className="sm:hidden truncate">{cat.shortLabel}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Main Category Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 netflix-scrollbar">
                {/* =========================================================
                    1. 帳號設置 (Account Settings)
                   ========================================================= */}
                {activeTab === 'account' && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <User className="w-4 h-4 text-accent" />
                        <span>帳號設置</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        檢視目前登入身分資訊、切換其他身分模式或管理密碼與授權 Token。
                      </p>
                    </div>

                    {/* Current Logged-in Identity Card */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={profile.avatar}
                          alt={profile.name || '使用者頭像'}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-accent-soft shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                              {profile.name || '朝陽使用者'}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-accent-soft border border-accent-soft text-[11px] font-bold text-accent">
                              <RoleIcon className="w-3 h-3" />
                              {roleMeta.label}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-300 font-mono truncate">
                            帳號 / Email：{profile.studentNo || '尚未設定'}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {profile.department}
                            {profile.semester ? ` · ${profile.semester}` : ''}
                          </div>
                        </div>
                      </div>

                      {profile.role === 'student' && (
                        <div className="flex items-center gap-4 sm:flex-col sm:items-end shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200 dark:border-slate-800">
                          <div className="text-xs text-slate-500 dark:text-slate-400">累計點數</div>
                          <div className="text-lg font-black font-mono tabular-nums text-accent">
                            {profile.points.toLocaleString()} PTS
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setShowSecurityPanel((prev) => !prev)}
                        className={`min-h-[52px] px-4 py-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition ${
                          showSecurityPanel
                            ? 'bg-accent-soft border-accent text-slate-900 dark:text-white'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-accent text-slate-800 dark:text-slate-100'
                        }`}
                      >
                        <span className="flex items-center gap-3 min-w-0">
                          <span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center shrink-0">
                            <KeyRound className="w-4 h-4 text-accent" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-bold truncate">
                              修改密碼 / Token
                            </span>
                            <span className="block text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              更新登入密碼與 Tronclass Token
                            </span>
                          </span>
                        </span>
                        <ChevronRight
                          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                            showSecurityPanel ? 'rotate-90 text-accent' : ''
                          }`}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onLogout();
                        }}
                        className="min-h-[52px] px-4 py-3 rounded-2xl border border-rose-300 dark:border-rose-900/70 bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-left flex items-center justify-between gap-3 transition"
                      >
                        <span className="flex items-center gap-3 min-w-0">
                          <span className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0">
                            <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-bold text-rose-700 dark:text-rose-300 truncate">
                              切換身分 / 登出
                            </span>
                            <span className="block text-[11px] text-rose-600/80 dark:text-rose-400/80 truncate">
                              返回登入閘道切換學生、教師或商家
                            </span>
                          </span>
                        </span>
                        <ChevronRight className="w-4 h-4 text-rose-500 shrink-0" />
                      </button>
                    </div>

                    {/* Google Account Authorization Binding Card */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                              <path
                                fill="#4285F4"
                                d="M23.52 12.27c0-.85-.08-1.68-.22-2.48H12v4.69h6.46c-.28 1.5-1.12 2.77-2.38 3.62v3.01h3.85c2.25-2.07 3.59-5.13 3.59-8.84z"
                              />
                              <path
                                fill="#34A853"
                                d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.85-3.01c-1.07.72-2.44 1.15-4.08 1.15-3.14 0-5.8-2.12-6.75-4.97H1.27v3.11C3.24 21.3 7.31 24 12 24z"
                              />
                              <path
                                fill="#FBBC05"
                                d="M5.25 14.27A7.22 7.22 0 0 1 4.87 12c0-.79.14-1.55.38-2.27V6.62H1.27A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.27 5.38l3.98-3.11z"
                              />
                              <path
                                fill="#EA4335"
                                d="M12 4.76c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.24 2.7 1.27 6.62l3.98 3.11c.95-2.85 3.61-4.97 6.75-4.97z"
                              />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                                Google 帳號授權綁定狀態
                              </span>
                              {googleAccount ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                                  <Check className="w-3 h-3" />
                                  已授權綁定
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-bold">
                                  尚未綁定
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                              {googleAccount
                                ? `目前綁定：${googleAccount.email}（授權日期 ${googleAccount.connectedAt}）`
                                : '一鍵綁定 Google 帳號即可啟用 AI 導師與教師 AI 教材工坊'}
                            </p>
                          </div>
                        </div>

                        {googleAccount && (
                          <button
                            type="button"
                            onClick={onGoogleSignOut}
                            className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 hover:border-rose-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0 transition"
                          >
                            解除綁定
                          </button>
                        )}
                      </div>

                      {!googleAccount && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="email"
                              value={googleEmailInput}
                              onChange={(e) => {
                                setGoogleEmailInput(e.target.value);
                                setGoogleBindError(null);
                              }}
                              placeholder={suggestedGoogleEmail}
                              className="flex-1 min-w-0 min-h-[42px] px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-accent"
                            />
                            <button
                              type="button"
                              onClick={handleGoogleBind}
                              className="min-h-[42px] px-4 py-2 rounded-xl bg-white dark:bg-slate-100 hover:bg-slate-100 dark:hover:bg-white text-slate-900 border border-slate-300 dark:border-transparent text-xs font-extrabold flex items-center justify-center gap-2 shrink-0 shadow-sm transition"
                            >
                              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                  fill="#4285F4"
                                  d="M23.52 12.27c0-.85-.08-1.68-.22-2.48H12v4.69h6.46c-.28 1.5-1.12 2.77-2.38 3.62v3.01h3.85c2.25-2.07 3.59-5.13 3.59-8.84z"
                                />
                                <path
                                  fill="#34A853"
                                  d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.85-3.01c-1.07.72-2.44 1.15-4.08 1.15-3.14 0-5.8-2.12-6.75-4.97H1.27v3.11C3.24 21.3 7.31 24 12 24z"
                                />
                                <path
                                  fill="#FBBC05"
                                  d="M5.25 14.27A7.22 7.22 0 0 1 4.87 12c0-.79.14-1.55.38-2.27V6.62H1.27A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.27 5.38l3.98-3.11z"
                                />
                                <path
                                  fill="#EA4335"
                                  d="M12 4.76c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.24 2.7 1.27 6.62l3.98 3.11c.95-2.85 3.61-4.97 6.75-4.97z"
                                />
                              </svg>
                              <span>使用 Google 帳號一鍵授權</span>
                            </button>
                          </div>
                          {googleBindError && (
                            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                              {googleBindError}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Expandable Password & Token Security Panel */}
                    {showSecurityPanel && (
                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-5">
                        {/* Change Local Password */}
                        <form onSubmit={handlePasswordSubmit} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-accent" />
                              <span>變更登入密碼</span>
                            </h4>
                            <button
                              type="button"
                              onClick={() => setShowPwdFields((v) => !v)}
                              className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1"
                            >
                              {showPwdFields ? (
                                <>
                                  <EyeOff className="w-3.5 h-3.5" />
                                  <span>隱藏</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>顯示密碼</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <input
                              type={showPwdFields ? 'text' : 'password'}
                              value={currentPwd}
                              onChange={(e) => setCurrentPwd(e.target.value)}
                              placeholder="目前密碼 (選填)"
                              className="min-h-[42px] px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accent"
                            />
                            <input
                              type={showPwdFields ? 'text' : 'password'}
                              value={newPwd}
                              onChange={(e) => setNewPwd(e.target.value)}
                              placeholder="新密碼 (至少 6 碼)"
                              className="min-h-[42px] px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accent"
                            />
                            <input
                              type={showPwdFields ? 'text' : 'password'}
                              value={confirmPwd}
                              onChange={(e) => setConfirmPwd(e.target.value)}
                              placeholder="確認新密碼"
                              className="min-h-[42px] px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accent"
                            />
                          </div>

                          {pwdError && (
                            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                              {pwdError}
                            </p>
                          )}
                          {pwdSuccess && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                              {pwdSuccess}
                            </p>
                          )}

                          <button
                            type="submit"
                            className="min-h-[40px] px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-xs font-bold shadow-accent transition"
                          >
                            儲存新密碼
                          </button>
                        </form>

                        {/* Tronclass Authorization Token */}
                        {profile.role !== 'merchant' && (
                          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                              Tronclass 授權存取 Token
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={tokenInput}
                                onChange={(e) => setTokenInput(e.target.value)}
                                placeholder="貼上朝陽 Tronclass OAuth Token..."
                                className="flex-1 min-w-0 min-h-[42px] px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-accent"
                              />
                              <button
                                type="button"
                                onClick={handleTokenSave}
                                className="min-h-[42px] px-4 rounded-xl bg-accent hover:bg-accent-hover text-xs font-bold shrink-0 transition"
                              >
                                更新 Token
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* =========================================================
                    2. 個人化設置 (Personalization Settings)
                   ========================================================= */}
                {activeTab === 'personalization' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <Palette className="w-4 h-4 text-accent" />
                        <span>個人化設置</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        即時調整深淺外觀模式、全站主題重點色彩與字體閱讀比例。
                      </p>
                    </div>

                    {/* 2.1 Dark / Light Mode Toggle */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center shrink-0">
                            {settings.colorMode === 'dark' ? (
                              <Moon className="w-4 h-4 text-accent" />
                            ) : (
                              <Sun className="w-4 h-4 text-accent" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white">
                              外觀顯示模式
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              目前使用：{settings.colorMode === 'dark' ? '深色模式 (Dark Mode)' : '淺色模式 (Light Mode)'}
                            </div>
                          </div>
                        </div>

                        <ToggleSwitch
                          checked={settings.colorMode === 'dark'}
                          onChange={(isDark) => setColorMode(isDark ? 'dark' : 'light')}
                          label="切換深色與淺色模式"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setColorMode('dark')}
                          className={`min-h-[44px] px-3.5 py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition ${
                            settings.colorMode === 'dark'
                              ? 'bg-accent-soft border-accent text-accent'
                              : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-accent'
                          }`}
                        >
                          <Moon className="w-4 h-4" />
                          <span>深色模式 Dark</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setColorMode('light')}
                          className={`min-h-[44px] px-3.5 py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition ${
                            settings.colorMode === 'light'
                              ? 'bg-accent-soft border-accent text-accent'
                              : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-accent'
                          }`}
                        >
                          <Sun className="w-4 h-4" />
                          <span>淺色模式 Light</span>
                        </button>
                      </div>
                    </div>

                    {/* 2.2 Accent Theme Color Picker (5 presets, Ocean Blue default) */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">
                            系統主題色彩
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            切換後，全站主要按鈕、邊框光暈與標題重點色將立即連動變更
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {ACCENT_THEME_OPTIONS.map((theme) => {
                          const selected = settings.accentTheme === theme.id;
                          return (
                            <button
                              key={theme.id}
                              type="button"
                              onClick={() => setAccentTheme(theme.id)}
                              className={`min-h-[54px] p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition ${
                                selected
                                  ? 'bg-white dark:bg-slate-950 border-accent glow-accent'
                                  : 'bg-white/80 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span
                                  className="w-7 h-7 rounded-full shrink-0 shadow-md flex items-center justify-center ring-2 ring-white dark:ring-slate-900"
                                  style={{ backgroundColor: theme.swatch }}
                                >
                                  {selected && <Check className="w-4 h-4 text-white" />}
                                </span>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                                      {theme.name}
                                    </span>
                                    {theme.isDefault && (
                                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent-soft text-accent">
                                        預設
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                    {theme.nameEn}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2.3 Global Font Size Scale */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center shrink-0">
                          <Type className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">
                            全局字體大小調整
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            即時調整全系統介面的文字與按鈕大小比例
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2.5">
                        {FONT_SIZE_OPTIONS.map((opt) => {
                          const selected = settings.fontSize === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setFontSize(opt.id)}
                              className={`min-h-[56px] p-2.5 rounded-xl border text-center flex flex-col items-center justify-center gap-0.5 transition ${
                                selected
                                  ? 'bg-accent border-transparent shadow-accent'
                                  : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-accent'
                              }`}
                            >
                              <span className="text-xs font-extrabold">{opt.label}</span>
                              <span
                                className={`text-[10px] font-mono ${
                                  selected ? 'text-white/85' : 'text-slate-500 dark:text-slate-400'
                                }`}
                              >
                                {opt.px}px
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Live Sample Preview */}
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-accent">
                            即時字體與配色預覽
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-200 mt-0.5">
                            朝陽科技大學 · Campus Life CYUT 智慧校園日常
                          </p>
                        </div>
                        <span className="px-3 py-1.5 rounded-lg bg-accent text-xs font-bold shrink-0">
                          重點按鈕
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* =========================================================
                    3. 通知設定 (Notification Settings)
                   ========================================================= */}
                {activeTab === 'notifications' && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <Bell className="w-4 h-4 text-accent" />
                        <span>通知設定</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        管理全站推播總開關，或依照學習、商家、課表與社群分類自訂提醒項目。
                      </p>
                    </div>

                    {/* Master Notification Toggle */}
                    <div
                      className={`p-4 rounded-2xl border transition flex items-center justify-between gap-4 ${
                        notifMasterOn
                          ? 'bg-accent-soft border-accent-soft'
                          : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            notifMasterOn
                              ? 'bg-accent shadow-accent'
                              : 'bg-slate-300 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          <BellRing className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                            總通知開關
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            {notifMasterOn
                              ? '已開啟所有已勾選的細項推播通知'
                              : '已暫停全部系統通知（細項設定保留中）'}
                          </div>
                        </div>
                      </div>
                      <ToggleSwitch
                        checked={notifMasterOn}
                        onChange={(v) => toggleNotificationKey('masterEnabled', v)}
                        label="開啟或關閉總通知"
                      />
                    </div>

                    {/* 4 Granular Notification Items */}
                    <div className="space-y-3">
                      {/* Item 1 */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                            <BookOpen className="w-4 h-4 text-accent" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-slate-900 dark:text-white">
                              作業、公告、教材與線上測驗通知
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              Tronclass 新作業發布、教師課程公告、補充教材與線上測驗截止提醒
                            </p>
                          </div>
                        </div>
                        <ToggleSwitch
                          checked={notifMasterOn && settings.notifications.academicAlerts}
                          disabled={!notifMasterOn}
                          onChange={(v) => toggleNotificationKey('academicAlerts', v)}
                          label="作業公告教材與線上測驗通知"
                        />
                      </div>

                      {/* Item 2 */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                            <Megaphone className="w-4 h-4 text-accent" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-slate-900 dark:text-white">
                              商家新活動與優惠券通知
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              朝陽特約合作商家最新限時折扣、新店上架與票券即將到期提醒
                            </p>
                          </div>
                        </div>
                        <ToggleSwitch
                          checked={notifMasterOn && settings.notifications.merchantPromoAlerts}
                          disabled={!notifMasterOn}
                          onChange={(v) => toggleNotificationKey('merchantPromoAlerts', v)}
                          label="商家新活動與優惠券通知"
                        />
                      </div>

                      {/* Item 3: 15-minute class reminder with live preview trigger */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                              <Clock className="w-4 h-4 text-accent" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-slate-900 dark:text-white">
                                課表提醒通知（上課前 15 分鐘）
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                於每堂課開始前 15 分鐘自動推播課程名稱、上課時間與教室編號
                              </p>
                            </div>
                          </div>
                          <ToggleSwitch
                            checked={notifMasterOn && settings.notifications.classReminder15m}
                            disabled={!notifMasterOn}
                            onChange={(v) => toggleNotificationKey('classReminder15m', v)}
                            label="課表上課前15分鐘提醒通知"
                          />
                        </div>

                        <div className="pl-12">
                          <button
                            type="button"
                            disabled={!notifMasterOn || !settings.notifications.classReminder15m}
                            onClick={onTestClassReminder}
                            className="min-h-[36px] px-3 py-1.5 rounded-xl border border-accent-soft bg-accent-soft text-accent text-xs font-bold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition"
                          >
                            試發課前 15 分鐘推播預覽
                          </button>
                        </div>
                      </div>

                      {/* Item 4 */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                            <Users className="w-4 h-4 text-accent" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-slate-900 dark:text-white">
                              社群互動通知
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              朋友圈動態按讚留言、系所交流、校際聯誼、揪團與物品交流回覆通知
                            </p>
                          </div>
                        </div>
                        <ToggleSwitch
                          checked={notifMasterOn && settings.notifications.socialAlerts}
                          disabled={!notifMasterOn}
                          onChange={(v) => toggleNotificationKey('socialAlerts', v)}
                          label="社群互動通知"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
