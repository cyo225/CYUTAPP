import React, { useState } from 'react';
import { Course, TodoItem, TodoType } from '../types';
import {
  Calendar,
  CheckCircle2,
  Circle,
  ExternalLink,
  Plus,
  Key,
  RefreshCw,
  Columns,
  List,
} from 'lucide-react';

interface AcademicHubProps {
  courses: Course[];
  todos: TodoItem[];
  tronclassConnected: boolean;
  tronclassToken?: string;
  onUpdateTronclassToken: (token: string) => void;
  onToggleTodo: (todoId: string) => void;
  onAddTodo: (todo: Omit<TodoItem, 'id' | 'completed'>) => void;
}

export const AcademicHub: React.FC<AcademicHubProps> = ({
  courses,
  todos,
  tronclassConnected,
  tronclassToken,
  onUpdateTronclassToken,
  onToggleTodo,
  onAddTodo,
}) => {
  // View toggle: 'matrix' (五天一起顯示) vs 'daily' (一天一天詳細顯示)
  const [timetableView, setTimetableView] = useState<'matrix' | 'daily'>('matrix');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [todoFilter, setTodoFilter] = useState<TodoType | 'all'>('all');
  const [isEditingToken, setIsEditingToken] = useState(false);
  const [inputToken, setInputToken] = useState(tronclassToken || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New todo form state
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState(courses[0]?.name || '計算機網路與分散式系統');
  const [newType, setNewType] = useState<TodoType>('assignment');
  const [newDueDate, setNewDueDate] = useState('2026-11-20 23:59');
  const [newUrgent, setNewUrgent] = useState(false);

  const days = [
    { num: 1, short: '週一', label: '週一 Mon' },
    { num: 2, short: '週二', label: '週二 Tue' },
    { num: 3, short: '週三', label: '週三 Wed' },
    { num: 4, short: '週四', label: '週四 Thu' },
    { num: 5, short: '週五', label: '週五 Fri' },
  ];

  const periods = [
    { period: 1, time: '08:10 - 09:00' },
    { period: 2, time: '09:10 - 10:00' },
    { period: 3, time: '10:10 - 11:00' },
    { period: 4, time: '11:10 - 12:00' },
    { period: 5, time: '13:30 - 14:20' },
    { period: 6, time: '14:25 - 15:15' },
    { period: 7, time: '15:25 - 16:15' },
    { period: 8, time: '16:20 - 17:10' },
  ];

  const filteredTodos = todos.filter((t) => {
    if (todoFilter === 'all') return true;
    return t.type === todoFilter;
  });

  const handleSyncTronclass = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1000);
  };

  const handleSaveToken = () => {
    onUpdateTronclassToken(inputToken);
    setIsEditingToken(false);
  };

  const handleCreateTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTodo({
      title: newTitle,
      courseName: newCourse,
      courseCode: 'CUSTOM',
      type: newType,
      dueDate: newDueDate,
      urgent: newUrgent,
      pointsReward: 5, // Uniformly 5 points per assignment/task
    });
    setNewTitle('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Main Grid: Timetable + Unified To-Do Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Weekly Timetable (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#E50914]" />
              <h3 className="text-lg font-bold text-white">每週課表</h3>
            </div>

            {/* View Switcher: 5-Day Matrix vs Day-by-Day Detailed */}
            <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setTimetableView('matrix')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                  timetableView === 'matrix'
                    ? 'bg-[#E50914] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>五天一起顯示</span>
              </button>
              <button
                type="button"
                onClick={() => setTimetableView('daily')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                  timetableView === 'daily'
                    ? 'bg-[#E50914] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>逐日詳細顯示</span>
              </button>
            </div>
          </div>

          {timetableView === 'matrix' ? (
            /* 5-Day Matrix View */
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-x-auto netflix-scrollbar">
              <table className="w-full min-w-[600px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80">
                    <th className="p-2.5 text-[11px] font-bold text-slate-400 w-20">節次</th>
                    {days.map((d) => (
                      <th
                        key={d.num}
                        className="p-2.5 text-xs font-bold text-slate-200 text-center border-l border-slate-800/80"
                      >
                        {d.short}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {periods.map((p) => (
                    <tr key={p.period} className="border-b border-slate-800/70 last:border-b-0">
                      <td className="p-2.5 align-top bg-slate-950/40">
                        <div className="text-xs font-bold text-white">第 {p.period} 節</div>
                        <div className="text-[10px] font-mono tabular-nums text-slate-500">
                          {p.time}
                        </div>
                      </td>
                      {days.map((d) => {
                        const course = courses.find(
                          (c) =>
                            c.dayOfWeek === d.num &&
                            p.period >= c.startPeriod &&
                            p.period <= c.endPeriod
                        );

                        return (
                          <td
                            key={d.num}
                            className="p-1.5 border-l border-slate-800/80 align-top min-w-[96px]"
                          >
                            {course ? (
                              <div
                                className="p-2 rounded-xl bg-slate-950/90 border border-slate-800 h-full"
                                style={{ borderTopColor: course.color, borderTopWidth: '3px' }}
                              >
                                <div className="text-[11px] font-bold text-white leading-snug line-clamp-2">
                                  {course.name}
                                </div>
                                <div className="text-[10px] font-mono text-amber-400 font-semibold mt-1">
                                  {course.classroom}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">
                                  {course.professor}
                                </div>
                              </div>
                            ) : (
                              <div className="h-12 flex items-center justify-center text-[10px] text-slate-700">
                                —
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Day-by-Day Detailed View */
            <div className="space-y-4">
              <div className="flex gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
                {days.map((d) => (
                  <button
                    key={d.num}
                    onClick={() => setSelectedDay(d.num)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      selectedDay === d.num
                        ? 'bg-[#E50914] text-white shadow-md shadow-red-950/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              <div className="space-y-2.5">
                {periods.map((p) => {
                  const dayCourses = courses.filter(
                    (c) =>
                      c.dayOfWeek === selectedDay &&
                      p.period >= c.startPeriod &&
                      p.period <= c.endPeriod
                  );
                  const course = dayCourses[0];

                  return (
                    <div
                      key={p.period}
                      className={`flex items-center p-3 rounded-xl border transition-all ${
                        course
                          ? 'bg-slate-900/90 border-slate-700/80'
                          : 'bg-slate-950/40 border-slate-900'
                      }`}
                    >
                      <div className="w-20 md:w-24 shrink-0 text-left border-r border-slate-800 pr-3">
                        <div className="text-xs font-bold text-white">第 {p.period} 節</div>
                        <div className="text-[10px] font-mono text-slate-500 tabular-nums">
                          {p.time}
                        </div>
                      </div>

                      <div className="pl-4 flex-1">
                        {course ? (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: course.color }}
                                />
                                <h4 className="text-sm font-bold text-white">{course.name}</h4>
                                <span className="text-[10px] font-mono text-slate-400">
                                  ({course.code})
                                </span>
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5">
                                {course.professor} · {course.credits} 學分 · {course.building}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 rounded bg-slate-800 text-xs font-mono font-bold text-amber-400 border border-slate-700">
                                {course.classroom}
                              </span>

                              {course.tronclassUrl && (
                                <a
                                  href={course.tronclassUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                                  title="開啟 Tronclass 課程"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-600">無課程安排</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Unified To-Do Queue (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#E50914]" />
              <h3 className="text-lg font-bold text-white">作業與待辦任務</h3>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#E50914] text-white rounded-lg hover:bg-red-600 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增任務</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto netflix-scrollbar pb-1">
            {[
              { id: 'all', label: `全部 (${todos.length})` },
              { id: 'assignment', label: '作業' },
              { id: 'quiz', label: '測驗小考' },
              { id: 'past_exam', label: '考古題' },
              { id: 'material', label: '教材' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTodoFilter(tab.id as TodoType | 'all')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  todoFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Todo Items List */}
          <div className="space-y-2.5 max-h-[580px] overflow-y-auto netflix-scrollbar pr-1">
            {filteredTodos.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-500 text-xs">
                目前沒有待辦事項。點擊「新增任務」建立項目，完成作業可獲得 +5 點數獎勵。
              </div>
            ) : (
              filteredTodos.map((todo) => {
                const typeLabels: Record<TodoType, string> = {
                  assignment: '作業',
                  quiz: '線上測驗',
                  past_exam: '歷屆考古題',
                  material: '重點教材',
                  announcement: '重要公告',
                };

                return (
                  <div
                    key={todo.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      todo.completed
                        ? 'bg-slate-950/60 border-slate-800/60 opacity-60'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => onToggleTodo(todo.id)}
                        className="mt-0.5 text-slate-400 hover:text-[#E50914] transition"
                      >
                        {todo.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                        ) : (
                          <Circle className="w-5 h-5 hover:text-[#E50914]" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="font-semibold text-slate-300">
                            {typeLabels[todo.type]}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">{todo.courseName}</span>
                          {todo.urgent && !todo.completed && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-red-400 font-bold">即將截止</span>
                            </>
                          )}
                        </div>

                        <h4
                          className={`text-sm font-bold mt-1 text-white leading-snug ${
                            todo.completed ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {todo.title}
                        </h4>

                        {todo.description && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {todo.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                          <span className="font-mono tabular-nums">截止: {todo.dueDate}</span>
                          {!todo.completed && (
                            <span className="text-amber-400 font-bold font-mono tabular-nums">
                              +5 點數獎勵
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Tronclass Connection Status, Token Settings & Instant Sync */}
      <div className="pt-6 border-t border-slate-800/90 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/75 border border-slate-800">
          <div className="flex items-center gap-3">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                tronclassConnected ? 'bg-emerald-500' : 'bg-slate-500'
              }`}
            />
            <div>
              <div className="text-xs font-bold text-white">
                {tronclassConnected ? 'Tronclass API 已連線' : 'Tronclass 尚未連結 API Token'}
              </div>
              <div className="text-[11px] text-slate-400">
                可在此設定個人 Tronclass 授權 Token 並即時重新抓取最新課表與作業
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsEditingToken(!isEditingToken)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition"
            >
              <Key className="w-3.5 h-3.5 text-[#E50914]" />
              <span>自備 Token 設定</span>
            </button>

            <button
              onClick={handleSyncTronclass}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#E50914] hover:bg-red-600 text-white rounded-xl transition shadow-md shadow-red-950/40 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? '抓取同步中...' : '即時重新抓取'}</span>
            </button>
          </div>
        </div>

        {isEditingToken && (
          <div className="p-4 rounded-xl bg-slate-900 border border-red-900/60 shadow-lg">
            <div className="text-xs font-bold text-white mb-2">
              輸入 Tronclass 個人授權 Token / 學生 Session：
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                placeholder="貼上 tronclass_jwt_token 或連線 Cookie..."
                className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-[#E50914]"
              />
              <button
                onClick={handleSaveToken}
                className="px-4 py-2 text-xs font-bold bg-[#E50914] text-white rounded-lg hover:bg-red-600 transition"
              >
                儲存並驗證
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Custom Todo Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">新增待辦任務</h3>
            <form onSubmit={handleCreateTodo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">任務標題</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="例如：演算法作業 3、微積分複習小考..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">對應課程</label>
                <select
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-[#E50914]"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                  <option value="其他校園事項">其他校園事項</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">類型</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as TodoType)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="assignment">課堂作業</option>
                    <option value="quiz">線上小考</option>
                    <option value="past_exam">歷屆考古題</option>
                    <option value="material">教材研讀</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">截止時間</label>
                  <input
                    type="text"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    placeholder="YYYY-MM-DD HH:mm"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="urgentCheck"
                  checked={newUrgent}
                  onChange={(e) => setNewUrgent(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-[#E50914] focus:ring-0"
                />
                <label htmlFor="urgentCheck" className="text-xs text-slate-300">
                  標記為緊急任務 (置頂提醒)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#E50914] text-white rounded-lg hover:bg-red-600 transition"
                >
                  建立任務 (+5 點)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
