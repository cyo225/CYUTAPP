import React, { useMemo, useState } from 'react';
import { Course, TodoItem, StudentProfile, NavigationTab } from '../types';
import {
  Flame,
  Award,
  ArrowRight,
  Calendar,
  Compass,
  QrCode,
  Maximize2,
  X,
  Clock,
  MapPin,
  UserCheck,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

interface NetflixHeroBillboardProps {
  profile: StudentProfile;
  courses: Course[];
  todos: TodoItem[];
  onNavigate: (tab: NavigationTab) => void;
  onOpenCheckIn: () => void;
  onOpenCouponLottery?: () => void;
}

interface NextClassStatus {
  course: Course;
  badgeText: string;
  countdownText: string;
  isLiveNow: boolean;
}

const DAY_LABELS = ['', '週一', '週二', '週三', '週四', '週五'];

function parseCourseStartEnd(timeRange: string): { startMins: number; endMins: number } {
  const match = timeRange.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!match) return { startMins: 8 * 60 + 30, endMins: 10 * 60 + 15 };
  return {
    startMins: Number(match[1]) * 60 + Number(match[2]),
    endMins: Number(match[3]) * 60 + Number(match[4]),
  };
}

function formatCountdownMinutes(totalMinutes: number): string {
  if (totalMinutes <= 0) return '即將開始';
  if (totalMinutes < 60) return `還有 ${totalMinutes} 分鐘`;
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hrs < 24) {
    return mins > 0 ? `還有 ${hrs} 小時 ${mins} 分` : `還有 ${hrs} 小時`;
  }
  const days = Math.floor(hrs / 24);
  const remHrs = hrs % 24;
  return remHrs > 0 ? `距離上課 ${days} 天 ${remHrs} 小時` : `距離上課 ${days} 天`;
}

// Deterministic pseudo-barcode bars from student/faculty ID string
function generateBarcodeWidths(seedText: string): number[] {
  const safe = (seedText || 's11007042').padEnd(8, '0');
  const bars: number[] = [];
  for (let i = 0; i < 36; i++) {
    const code = safe.charCodeAt(i % safe.length);
    const pattern = ((code * (i + 7) + i * 13) % 4) + 1;
    bars.push(pattern);
  }
  return bars;
}

export const NetflixHeroBillboard: React.FC<NetflixHeroBillboardProps> = ({
  profile,
  courses,
  todos,
  onNavigate,
  onOpenCheckIn,
  onOpenCouponLottery,
}) => {
  const [showIDModal, setShowIDModal] = useState(false);

  const isTeacher = profile.role === 'teacher';
  const pendingTodos = todos.filter((t) => !t.completed);
  const urgentTodo = pendingTodos.find((t) => t.urgent) || pendingTodos[0];

  const nextClass = useMemo<NextClassStatus | null>(() => {
    if (courses.length === 0) return null;
    const now = new Date();
    const jsDay = now.getDay(); // 0 Sun .. 6 Sat
    const currentWeekDay = jsDay === 0 ? 7 : jsDay; // 1 Mon .. 7 Sun
    const nowMins = now.getHours() * 60 + now.getMinutes();

    // 1. Check if currently in a class right now
    const ongoing = courses.find((c) => {
      if (c.dayOfWeek !== currentWeekDay) return false;
      const { startMins, endMins } = parseCourseStartEnd(c.timeRange);
      return nowMins >= startMins && nowMins <= endMins;
    });
    if (ongoing) {
      const { endMins } = parseCourseStartEnd(ongoing.timeRange);
      const leftMins = Math.max(1, endMins - nowMins);
      return {
        course: ongoing,
        badgeText: '目前上課中',
        countdownText: `剩餘 ${leftMins} 分鐘下課`,
        isLiveNow: true,
      };
    }

    // 2. Find nearest upcoming class later this week or wrap around to next week
    let best: { course: Course; deltaMins: number } | null = null;
    for (const c of courses) {
      const { startMins } = parseCourseStartEnd(c.timeRange);
      let dayDelta = c.dayOfWeek - currentWeekDay;
      if (dayDelta < 0 || (dayDelta === 0 && startMins <= nowMins)) {
        dayDelta += 7;
      }
      const deltaMins = dayDelta * 1440 + (startMins - nowMins);
      if (!best || deltaMins < best.deltaMins) {
        best = { course: c, deltaMins };
      }
    }

    if (!best) return null;
    const dayTag =
      best.course.dayOfWeek === currentWeekDay ? '今日下一節' : `${DAY_LABELS[best.course.dayOfWeek]} 下一節`;

    return {
      course: best.course,
      badgeText: dayTag,
      countdownText: formatCountdownMinutes(best.deltaMins),
      isLiveNow: false,
    };
  }, [courses]);

  const barcodeWidths = useMemo(
    () => generateBarcodeWidths(profile.studentNo || 's11007042'),
    [profile.studentNo]
  );

  const idLabel = profile.studentNo || (isTeacher ? 't940218' : 's11007042');
  const displayDept = profile.department || '資訊工程系 (資工系)';
  const displayName = profile.name || (isTeacher ? '陳特聘教授' : '林朝陽');

  return (
    <>
      <div className="relative w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-[#0B0F17] dark:via-[#111827] dark:to-[#1E293B] shadow-lg dark:shadow-2xl mb-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-soft rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-accent-soft rounded-full blur-3xl pointer-events-none opacity-60" />

        <div className="relative z-10 p-5 sm:p-7 md:p-8 space-y-6">
          {/* Top Metadata & Streak / Points Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium flex items-center gap-2">
              <span className="text-accent font-extrabold">朝陽科技大學</span>
              <span aria-hidden="true">·</span>
              <span>{profile.semester || '大三第1學期'}</span>
            </div>

            {profile.role !== 'merchant' && (
              <div className="flex flex-wrap items-center gap-2">
                {profile.role === 'student' && (
                  <button
                    type="button"
                    onClick={onOpenCheckIn}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-accent-soft border border-accent-soft text-accent hover:opacity-90 transition"
                  >
                    <Flame className="w-3.5 h-3.5 text-accent" />
                    <span>連續簽到 {profile.streakDays} 天</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    onOpenCouponLottery ? onOpenCouponLottery() : onNavigate('rewards')
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-slate-800/80 hover:border-amber-400 border border-amber-200 dark:border-slate-700 text-amber-600 dark:text-amber-400 transition"
                  title="點擊立即前往優惠券點數兌換商城"
                >
                  <Award className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  <span className="font-mono tabular-nums">
                    {profile.points.toLocaleString()} 點 · 換優惠券
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Core Grid: Electronic Student/Faculty ID Card + Live Next Class Dynamic */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left (5 cols): Electronic Student/Faculty ID Recognition Zone */}
            <button
              type="button"
              onClick={() => setShowIDModal(true)}
              aria-label="點擊放大電子學生證條碼與 QR Code"
              className="lg:col-span-5 text-left group rounded-2xl p-5 bg-white/95 dark:bg-slate-950/85 border border-slate-200 dark:border-slate-800 hover:border-accent shadow-sm dark:shadow-xl transition-all flex flex-col justify-between gap-4 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={profile.avatar}
                    alt={displayName}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-accent-soft shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-accent">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>{isTeacher ? '朝陽電子教職員證' : '朝陽電子學生證'}</span>
                    </div>
                    <div className="text-lg font-extrabold text-slate-900 dark:text-white truncate mt-0.5">
                      {displayName}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {displayDept}
                    </div>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-accent group-hover:border-accent transition shrink-0">
                  <Maximize2 className="w-3 h-3" />
                  <span>放大條碼</span>
                </span>
              </div>

              {/* ID Number + Scannable Barcode / QR Preview */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">
                      {isTeacher ? '教職員編號' : '學號'}
                    </span>
                    <span className="font-mono font-extrabold text-slate-900 dark:text-white tracking-wider">
                      {idLabel}
                    </span>
                  </div>

                  {/* Crisp High-Contrast Barcode Strip */}
                  <div className="h-8 w-full bg-white rounded-md px-2 py-1 flex items-stretch justify-between border border-slate-200">
                    {barcodeWidths.map((w, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-950 h-full"
                        style={{
                          width: `${w}px`,
                          opacity: idx % 2 === 0 ? 1 : 0.15,
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-white border border-slate-200 shrink-0 flex flex-col items-center justify-center">
                  <QrCode className="w-9 h-9 text-slate-950" />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>圖書館借閱 / 校園門禁通行憑證</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">● 有效在籍</span>
              </div>
            </button>

            {/* Right (7 cols): Live Next Class Dynamic + Urgent Todo + Clean Navigation */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-4 rounded-2xl p-5 bg-white/80 dark:bg-slate-900/75 border border-slate-200 dark:border-slate-800">
              {nextClass ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        nextClass.isLiveNow
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-accent-soft text-accent border border-accent-soft'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{nextClass.badgeText}</span>
                    </span>

                    <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/70 px-2.5 py-1 rounded-lg tabular-nums">
                      {nextClass.countdownText}
                    </span>
                  </div>

                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                      {nextClass.course.name}
                    </h1>

                    <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-accent shrink-0" />
                        <span>
                          授課教授：<strong className="text-slate-900 dark:text-white">{nextClass.course.professor}</strong>
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>
                          教室：<strong className="font-mono text-amber-600 dark:text-amber-400">{nextClass.course.classroom}</strong>{' '}
                          <span className="text-slate-500 dark:text-slate-400">({nextClass.course.building})</span>
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5 font-mono text-xs text-slate-700 dark:text-slate-200">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{nextClass.course.timeRange}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-xs font-bold text-accent mb-1">校園生活即時動態</div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    開始規劃你的朝陽校園日常
                  </h1>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    查看個人每週課表、作業任務倒數，或開啟 3D 校園地圖快速定位上課教室。
                  </p>
                </div>
              )}

              {/* Urgent Todo Reminder Strip */}
              {!isTeacher && urgentTodo && (
                <button
                  type="button"
                  onClick={() => onNavigate('academic')}
                  className="w-full text-left flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-accent transition"
                >
                  <span className="text-xs text-slate-700 dark:text-slate-300 truncate flex-1">
                    <strong className="text-accent font-bold">待辦截止提醒：</strong>
                    {urgentTodo.courseName} — {urgentTodo.title}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
                    {urgentTodo.dueDate}
                  </span>
                </button>
              )}

              {/* Clean Practical Quick Navigation Buttons (NO heavy AI button) */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('academic')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-xs sm:text-sm font-bold shadow-accent active:scale-95 transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{isTeacher ? '檢視完整授課課表' : '進入完整課表與任務'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('campus-3d')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-semibold active:scale-95 transition-all"
                >
                  <Compass className="w-4 h-4 text-accent" />
                  <span>校園 3D 地圖</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enlarged Electronic Student/Faculty ID Modal (Library & Gate Access Simulation) */}
      {showIDModal && (
        <div
          className="fixed inset-0 z-[85] flex items-center justify-center bg-slate-950/75 dark:bg-black/85 backdrop-blur-md p-4"
          onClick={() => setShowIDModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0E1420] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="text-[11px] font-bold text-accent tracking-wider">
                  CHAOSYANG UNIVERSITY OF TECHNOLOGY
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {isTeacher ? '朝陽電子教職員證' : '朝陽科技大學電子學生證'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIDModal(false)}
                aria-label="關閉電子學生證放大視窗"
                className="min-h-[40px] min-w-[40px] rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={profile.avatar}
                alt={displayName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-accent-soft shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 space-y-1">
                <div className="text-xl font-black text-slate-900 dark:text-white">{displayName}</div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {displayDept}
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-accent">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{idLabel} · 在籍有效憑證</span>
                </div>
              </div>
            </div>

            {/* High-Contrast Scannable White Card for Library / Gate Scanner */}
            <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-inner space-y-4 text-center">
              <div className="flex justify-center">
                <div className="p-3 rounded-2xl border border-slate-200 bg-white">
                  <QrCode className="w-36 h-36 text-slate-950" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="h-12 w-full px-3 flex items-stretch justify-between">
                  {barcodeWidths.map((w, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-950 h-full"
                      style={{
                        width: `${w * 1.4}px`,
                        opacity: idx % 2 === 0 ? 1 : 0.12,
                      }}
                    />
                  ))}
                </div>
                <div className="font-mono text-sm font-black tracking-[0.25em] text-slate-950">
                  {idLabel.toUpperCase()}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
              可將螢幕對準波生紀念圖書館自助借書機、自習室閘門或校門口智慧門禁進行掃碼驗證
            </p>
          </div>
        </div>
      )}
    </>
  );
};
