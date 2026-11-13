import React from 'react';
import { Course, TodoItem, StudentProfile, NavigationTab } from '../types';
import { 
  Play, 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ChevronRight, 
  Flame, 
  Award,
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface NetflixHeroBillboardProps {
  profile: StudentProfile;
  courses: Course[];
  todos: TodoItem[];
  onNavigate: (tab: NavigationTab) => void;
  onOpenCheckIn: () => void;
}

export const NetflixHeroBillboard: React.FC<NetflixHeroBillboardProps> = ({
  profile,
  courses,
  todos,
  onNavigate,
  onOpenCheckIn,
}) => {
  // Find current or next course
  const currentCourse = courses[0];
  const pendingTodos = todos.filter(t => !t.completed);
  const urgentTodo = pendingTodos.find(t => t.urgent) || pendingTodos[0];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-r from-[#0B0F17] via-[#111827] to-[#1E293B] shadow-2xl mb-8">
      {/* Cinematic Red Ambient Light Flare */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#E50914]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 p-6 md:p-10 flex flex-col justify-between min-h-[380px]">
        {/* Top Badges Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#E50914] text-white shadow-lg shadow-red-950/60 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white" />
              CYUT CAMPUS EXCLUSIVE
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              朝陽科技大學 · 115 學年度第 1 學期
            </span>
          </div>

          {/* Gamification Points & Streak Quick Widget */}
          {profile.isLoggedIn && (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenCheckIn}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-950/60 border border-red-800/80 text-red-200 hover:bg-red-900/60 transition shadow-inner"
              >
                <Flame className="w-3.5 h-3.5 text-[#E50914]" />
                <span>連續簽到 {profile.streakDays} 天</span>
              </button>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800/80 border border-slate-700 text-amber-400">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono tabular-nums">{profile.points} 積分</span>
              </div>
            </div>
          )}
        </div>

        {/* Hero Title & Primary Class Highlight */}
        <div className="my-6 max-w-3xl">
          <div className="text-xs font-semibold text-[#E50914] tracking-widest uppercase mb-1">
            {profile.isLoggedIn ? `${profile.department} · ${profile.name} 的專屬教務動態` : '朝陽科技大學智慧校園入口'}
          </div>

          <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {currentCourse ? currentCourse.name : '開始規劃你的朝陽學術生活'}
          </h1>

          <p className="mt-3 text-sm md:text-base text-slate-300 line-clamp-2 leading-relaxed">
            {currentCourse ? (
              <span>
                授課教授：<strong className="text-white">{currentCourse.professor}</strong> · 
                上課教室：<strong className="text-amber-400 font-mono">{currentCourse.classroom}</strong> ({currentCourse.building}) · 
                時段：<strong className="text-slate-200 font-mono">{currentCourse.timeRange}</strong> (第 {currentCourse.startPeriod}-{currentCourse.endPeriod} 節)
              </span>
            ) : (
              '登入您的朝陽學生帳號，即刻同步 Tronclass 課程與作業進度，享受 BYOK 雙模式 AI 導師解惑、美食優惠折抵與 3D 校園地圖導覽。'
            )}
          </p>

          {/* Urgent To-Do Kicker */}
          {urgentTodo && (
            <div className="mt-4 flex items-center gap-2 p-2.5 px-3.5 rounded-xl bg-slate-900/80 border border-slate-800 max-w-xl">
              <span className="w-2 h-2 rounded-full bg-[#E50914]" />
              <div className="text-xs text-slate-300 truncate">
                <strong className="text-red-400 font-semibold">待辦截止：</strong> {urgentTodo.courseName} — {urgentTodo.title}
              </div>
              <span className="text-[11px] font-mono text-slate-400 ml-auto whitespace-nowrap">
                {urgentTodo.dueDate.split(' ')[0]}
              </span>
            </div>
          )}
        </div>

        {/* Bottom Dual Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('academic')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E50914] text-white text-sm font-bold shadow-lg shadow-red-950/60 hover:bg-red-600 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>進入完整課表與教務</span>
          </button>

          <button
            onClick={() => onNavigate('ai-tutor')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white text-sm font-semibold backdrop-blur-md active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>召喚 AI 課業解惑</span>
          </button>

          <button
            onClick={() => onNavigate('campus-3d')}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-slate-300 hover:text-white text-sm font-medium transition"
          >
            <span>探索 3D 校園建築</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
