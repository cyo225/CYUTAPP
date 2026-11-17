import React from 'react';
import { motion } from 'motion/react';
import { CHECKIN_CYCLE_REWARDS } from '../utils/demoData';
import { StudentProfile } from '../types';
import { Flame, CheckCircle2, X, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DailyCheckInModalProps {
  isOpen: boolean;
  profile: StudentProfile;
  onClaim: () => void;
  onCloseWithoutClaim: () => void;
}

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({
  isOpen,
  profile,
  onClaim,
  onCloseWithoutClaim,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const alreadyClaimedToday = profile.lastCheckInDate === todayStr;
  // 7-day cycle index (0..6)
  const completedInCycle = profile.streakDays % 7;
  const activeCycleDay = alreadyClaimedToday
    ? completedInCycle === 0 && profile.streakDays > 0
      ? 7
      : completedInCycle
    : completedInCycle + 1;

  const todayReward = CHECKIN_CYCLE_REWARDS[Math.min(6, Math.max(0, activeCycleDay - 1))];

  const handleClaim = () => {
    if (alreadyClaimedToday) return;
    onClaim();
    const accentHex =
      getComputedStyle(document.documentElement).getPropertyValue('--accent-bright').trim() ||
      '#0EA5E9';
    confetti({
      particleCount: 75,
      spread: 65,
      origin: { y: 0.55 },
      colors: [accentHex, '#F59E0B', '#FFFFFF'],
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 dark:bg-black/80 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-xl rounded-3xl bg-white dark:bg-gradient-to-b dark:from-[#131A29] dark:to-[#0B0F17] border border-slate-200 dark:border-slate-800 p-6 md:p-7 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-accent-soft rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-accent">
              <Flame className="w-4 h-4" />
              <span>每日簽到獎勵 · 7 天週期循環</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              {alreadyClaimedToday ? '今日已完成簽到' : `今日簽到可領 +${todayReward.points} 點`}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {alreadyClaimedToday
                ? `目前已連續簽到 ${profile.streakDays} 天，明天登入繼續累積週期獎勵。`
                : '第 3 天加碼多給 10 點、第 7 天額外多給 20 點；若未領取而關閉，下次開啟 App 時會再次提醒。'}
            </p>
          </div>
          <button
            onClick={onCloseWithoutClaim}
            aria-label="關閉簽到視窗"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 7-Day Cycle Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-6">
          {CHECKIN_CYCLE_REWARDS.map((item) => {
            const isClaimedInCycle = alreadyClaimedToday
              ? item.day <= activeCycleDay
              : item.day < activeCycleDay;
            const isTargetToday = !alreadyClaimedToday && item.day === activeCycleDay;

            return (
              <div
                key={item.day}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isTargetToday
                    ? 'bg-accent-soft border-accent glow-accent'
                    : isClaimedInCycle
                    ? 'bg-emerald-50 dark:bg-slate-900/90 border-emerald-300 dark:border-emerald-800/60'
                    : 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800/80 opacity-85'
                }`}
              >
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">第 {item.day} 天</div>
                <div className="text-sm font-extrabold text-amber-600 dark:text-amber-400 font-mono tabular-nums mt-1">
                  +{item.points}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                  {item.day === 3 ? '多給 10 點' : item.day === 7 ? '額外 +20' : '基礎遞增'}
                </div>
                {isClaimedInCycle && (
                  <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">已領</div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800/80">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Gift className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
            <span>
              累積滿 <strong className="text-slate-900 dark:text-white font-mono tabular-nums">2,000 點</strong> 即可於學生市集抽取美食優惠券
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {!alreadyClaimedToday ? (
              <>
                <button
                  onClick={onCloseWithoutClaim}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition"
                >
                  稍後再領
                </button>
                <button
                  onClick={handleClaim}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-accent hover:bg-accent-hover rounded-xl shadow-accent transition active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>領取今日 +{todayReward.points} 點</span>
                </button>
              </>
            ) : (
              <button
                onClick={onCloseWithoutClaim}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl transition"
              >
                關閉
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
