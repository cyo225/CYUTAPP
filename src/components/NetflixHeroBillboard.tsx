import React from 'react';
import { Course, TodoItem, StudentProfile, NavigationTab } from '../types';
import { Play, Sparkles, Flame, Award, ArrowRight } from 'lucide-react';

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
  const currentCourse = courses[0];
  const pendingTodos = todos.filter((t) => !t.completed);
  const urgentTodo = pendingTodos.find((t) => t.urgent) || pendingTodos[0];
  const isTeacher = profile.role === 'teacher';

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-r from-[#0B0F17] via-[#111827] to-[#1E293B] shadow-2xl mb-8">
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#E50914]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 p-6 md:p-10 flex flex-col justify-between min-h-[340px]">
        {/* Top Metadata & Points Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400 font-medium">
            <span className="text-[#E50914] font-bold">朝陽科技大學</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>{profile.semester || '115 學年度第 1 學期'}</span>
          </div>

          {profile.role === 'student' && (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenCheckIn}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-950/60 border border-red-800/80 text-red-200 hover:bg-red-900/60 transition"
              >
                <Flame className="w-3.5 h-3.5 text-[#E50914]" />
                <span>連續簽到 {profile.streakDays} 天</span>
              </button>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800/80 border border-slate-700 text-amber-400">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono tabular-nums">{profile.points.toLocaleString()} 點</span>
              </div>
            </div>
          )}
        </div>

        {/* Hero Title & Course Highlight */}
        <div className="my-6 max-w-3xl">
          <div className="text-xs font-semibold text-[#E50914] tracking-wide mb-1">
            {profile.department} · {profile.name}
          </div>

          <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {isTeacher
              ? '教師智慧授課與 AI 命題中心'
              : currentCourse
              ? currentCourse.name
              : '開始規劃你的朝陽校園生活'}
          </h1>

          <p className="mt-3 text-sm md:text-base text-slate-300 line-clamp-2 leading-relaxed">
            {isTeacher ? (
              '上傳教材講義或成績單，立即啟用 AI 自動出題、結構化課綱整理與班級成績加權試算。'
            ) : currentCourse ? (
              <span>
                授課教授：<strong className="text-white">{currentCourse.professor}</strong> ·
                上課教室：<strong className="text-amber-400 font-mono">{currentCourse.classroom}</strong>{' '}
                ({currentCourse.building}) · 時段：
                <strong className="text-slate-200 font-mono">{currentCourse.timeRange}</strong>
              </span>
            ) : (
              '管理個人每週課表與作業任務，使用雙模式 AI 學習導師與合作商家市集優惠。'
            )}
          </p>

          {!isTeacher && urgentTodo && (
            <div className="mt-4 flex items-center gap-2 p-2.5 px-3.5 rounded-xl bg-slate-900/80 border border-slate-800 max-w-xl">
              <div className="text-xs text-slate-300 truncate">
                <strong className="text-red-400 font-semibold">待辦截止：</strong>{' '}
                {urgentTodo.courseName} — {urgentTodo.title}
              </div>
              <span className="text-[11px] font-mono text-slate-400 ml-auto whitespace-nowrap">
                {urgentTodo.dueDate.split(' ')[0]}
              </span>
            </div>
          )}
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('academic')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E50914] text-white text-sm font-bold shadow-lg shadow-red-950/60 hover:bg-red-600 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{isTeacher ? '檢視授課課表' : '進入課表與任務'}</span>
          </button>

          <button
            onClick={() => onNavigate('ai-tutor')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white text-sm font-semibold backdrop-blur-md active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{isTeacher ? '開啟教師 AI 教材工坊' : '召喚 AI 課業導師'}</span>
          </button>

          <button
            onClick={() => onNavigate('campus-3d')}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-slate-300 hover:text-white text-sm font-medium transition"
          >
            <span>探索 3D 校園地圖</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
