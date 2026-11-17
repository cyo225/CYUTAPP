import React from 'react';
import { StudentProfile } from '../types';
import { X, LogOut } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  profile,
  onLogout,
}) => {
  if (!isOpen) return null;

  const roleLabel =
    profile.role === 'teacher' ? '教師身分' : profile.role === 'merchant' ? '特約商家身分' : '學生身分';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 dark:bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">帳號資訊 · {roleLabel}</h3>
          <button
            onClick={onClose}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-12 h-12 rounded-full border border-slate-300 dark:border-slate-700 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{profile.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {profile.studentNo} · {profile.department}
                </div>
                {profile.role === 'student' && (
                  <div className="text-xs text-accent font-bold font-mono tabular-nums mt-0.5">
                    可用點數：{profile.points} PTS · 連續簽到：{profile.streakDays} 天
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover shadow-accent text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>登出並切換登入模式</span>
          </button>
        </div>
      </div>
    </div>
  );
};
