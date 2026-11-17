import React, { useState } from 'react';
import {
  askGeminiTutor,
  extractKeyNotes,
  runTeacherAITask,
  TeacherAITaskType,
  TutorMode,
} from '../services/geminiService';
import { GoogleAccountBinding, UserRole } from '../types';
import {
  Sparkles,
  Send,
  BookOpen,
  FileText,
  CheckCircle,
  Lightbulb,
  Bot,
  User,
  Copy,
  Check,
  Upload,
  Calculator,
  ClipboardList,
  GraduationCap,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

interface AITutorViewProps {
  role: UserRole;
  profileName: string;
  studentNo: string;
  googleAccount: GoogleAccountBinding | null;
  onGoogleSignIn: (account: GoogleAccountBinding) => void;
  onGoogleSignOut: () => void;
}

const GoogleLogoSvg: React.FC<{ className?: string }> = ({ className = 'w-4 h-4 shrink-0' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
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
);

export const AITutorView: React.FC<AITutorViewProps> = ({
  role,
  profileName,
  studentNo,
  googleAccount,
  onGoogleSignIn,
  onGoogleSignOut,
}) => {
  const isTeacher = role === 'teacher';
  const [mode, setMode] = useState<TutorMode>('guiding');
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'extract' | 'teacher-tools'>(
    isTeacher ? 'teacher-tools' : 'chat'
  );

  // Google Sign-In picker modal
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const defaultSuggestedEmail = studentNo
    ? `${studentNo.replace(/[^a-zA-Z0-9._-]/g, '')}@gm.cyut.edu.tw`
    : isTeacher
    ? 'faculty@gm.cyut.edu.tw'
    : 'student@gm.cyut.edu.tw';
  const [googleEmailInput, setGoogleEmailInput] = useState(
    googleAccount?.email || defaultSuggestedEmail
  );
  const [googleAuthError, setGoogleAuthError] = useState('');

  // Chat state
  const [messages, setMessages] = useState<
    { id: string; role: 'user' | 'model'; content: string; timestamp: string }[]
  >([
    {
      id: 'init-msg',
      role: 'model',
      content: isTeacher
        ? '您好，歡迎使用朝陽教師 AI 助手。完成 Google 帳號一鍵授權登入後，即可進行教學規劃對話，或使用「教師專屬 AI 教材工坊」自動出題、整理大綱與試算成績。'
        : '你好！我是你的朝陽 AI 學習導師。預設為「提示引導模式」協助你培養解題思考，考前亦可切換至「直接解答模式」快速核對步驟與公式。',
      timestamp: '剛剛',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Student Extractor state
  const [extractInput, setExtractInput] = useState('');
  const [extractResult, setExtractResult] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Teacher AI Studio state
  const [teacherTask, setTeacherTask] = useState<TeacherAITaskType>('quiz');
  const [teacherMaterialName, setTeacherMaterialName] = useState('');
  const [teacherMaterialText, setTeacherMaterialText] = useState('');
  const [teacherExtraPrompt, setTeacherExtraPrompt] = useState('');
  const [teacherResult, setTeacherResult] = useState('');
  const [isRunningTeacherTask, setIsRunningTeacherTask] = useState(false);
  const [teacherCopied, setTeacherCopied] = useState(false);

  const sampleQuestions = [
    '計算機網路中 TCP 三向交握為什麼需要三次而不是兩次？',
    '演算法 Dijkstra 和 Bellman-Ford 的差異與適用情境是什麼？',
    '機器學習 Overfitting 如何透過 Regularization 改善？',
  ];

  const handleOneClickGoogleAuth = (emailOverride?: string) => {
    const emailToBind = (emailOverride ?? googleEmailInput).trim();
    if (!emailToBind || !emailToBind.includes('@')) {
      setGoogleAuthError('請輸入有效的 Google 信箱帳號（例如 @gm.cyut.edu.tw 或 @gmail.com）');
      return;
    }
    setGoogleAuthError('');
    onGoogleSignIn({
      email: emailToBind,
      name: profileName || (isTeacher ? '朝陽教師' : '朝陽同學'),
      connectedAt: new Date().toISOString(),
    });
    setShowGoogleModal(false);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || isGenerating) return;

    if (!googleAccount) {
      setShowGoogleModal(true);
      return;
    }

    const userMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsGenerating(true);

    const history = messages.slice(1).map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }));

    const response = await askGeminiTutor(text, mode, history);

    const modelMsg = {
      id: (Date.now() + 1).toString(),
      role: 'model' as const,
      content: response,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, modelMsg]);
    setIsGenerating(false);
  };

  const handleExtractNotes = async () => {
    if (!extractInput.trim() || isExtracting) return;
    if (!googleAccount) {
      setShowGoogleModal(true);
      return;
    }
    setIsExtracting(true);
    const result = await extractKeyNotes(extractInput);
    setExtractResult(result);
    setIsExtracting(false);
  };

  const handleCopyResult = () => {
    navigator.clipboard.writeText(extractResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTeacherFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTeacherMaterialName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      if (content) {
        setTeacherMaterialText(content);
      } else {
        setTeacherMaterialText(
          `【已載入檔案：${file.name} (${Math.round(file.size / 1024)} KB)】\n請在此補充教材關鍵段落或成績清單內容。`
        );
      }
    };
    reader.readAsText(file);
  };

  const handleRunTeacherAI = async () => {
    if (!teacherMaterialText.trim() || isRunningTeacherTask) return;
    if (!googleAccount) {
      setShowGoogleModal(true);
      return;
    }
    setIsRunningTeacherTask(true);
    const output = await runTeacherAITask(teacherTask, teacherMaterialText, teacherExtraPrompt);
    setTeacherResult(output);
    setIsRunningTeacherTask(false);
  };

  const loadTeacherSample = (task: TeacherAITaskType) => {
    setTeacherTask(task);
    if (task === 'grades') {
      setTeacherMaterialName('CS315_期中成績紀錄.csv');
      setTeacherMaterialText(
        `學號姓名,平時成績,期中考,期末專題\ns11007042 林朝陽,92,88,95\ns11007015 張宇軒,78,64,72\ns11007089 李思穎,85,91,89\ns11007104 王小明,55,48,58\ns11007112 陳志豪,70,62,68`
      );
    } else {
      setTeacherMaterialName('計算機網路_第4章講義.txt');
      setTeacherMaterialText(
        `Chapter 4: Transport Layer (TCP & UDP)\n- UDP provides connectionless, best-effort delivery with minimal 8-byte header overhead.\n- TCP establishes reliable full-duplex connections via 3-way handshake (SYN, SYN-ACK, ACK).\n- Flow control uses Sliding Window, while Congestion Control uses Slow Start, AIMD, and Fast Retransmit.`
      );
    }
  };

  return (
    <div className="space-y-5">
      {/* Sub-tabs + Google One-Click Sign-In Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {isTeacher && (
            <button
              onClick={() => setActiveSubTab('teacher-tools')}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
                activeSubTab === 'teacher-tools'
                  ? 'bg-accent shadow-accent'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>教師專屬 AI 教材工坊</span>
            </button>
          )}

          <button
            onClick={() => setActiveSubTab('chat')}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
              activeSubTab === 'chat'
                ? 'bg-accent shadow-accent'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AI 即時對話</span>
          </button>

          <button
            onClick={() => setActiveSubTab('extract')}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
              activeSubTab === 'extract'
                ? 'bg-accent shadow-accent'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>教材重點萃取</span>
          </button>
        </div>

        {/* Google One-Click Auth Trigger */}
        {googleAccount ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70">
            <GoogleLogoSvg className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 truncate max-w-[180px] sm:max-w-xs">
              {googleAccount.email}
            </span>
            <button
              type="button"
              onClick={onGoogleSignOut}
              title="解除 Google 帳號授權"
              className="text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 p-1 rounded-lg transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowGoogleModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm transition"
          >
            <GoogleLogoSvg className="w-3.5 h-3.5 shrink-0" />
            <span>Google 帳號一鍵授權登入 (Sign in with Google)</span>
          </button>
        )}
      </div>

      {/* Prominent One-Click Google Sign-In Gate Banner when not signed in */}
      {!googleAccount && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-accent-soft shadow-sm dark:shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
              <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
              <span>使用 Google 帳號一鍵授權登入，立即開啟朝陽 AI 智慧助手</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              無需手動輸入複雜的 API 金鑰。點擊右側「Sign in with Google」完成朝陽 Google Workspace 或個人 Google 帳號授權，即可暢享雙模式即時解題、重點萃取與教師 AI 工坊。
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleOneClickGoogleAuth(defaultSuggestedEmail)}
            className="shrink-0 flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-extrabold transition shadow-md cursor-pointer"
          >
            <GoogleLogoSvg className="w-4 h-4 shrink-0" />
            <span>Sign in with Google</span>
          </button>
        </div>
      )}

      {/* TEACHER EXCLUSIVE AI WORKSPACE */}
      {isTeacher && activeSubTab === 'teacher-tools' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                教師教材上傳與 AI 任務選擇
              </h3>
              <button
                type="button"
                onClick={() => loadTeacherSample(teacherTask)}
                className="text-xs font-semibold text-accent hover:underline"
              >
                帶入測試範例資料
              </button>
            </div>

            {/* 3 Teacher AI Task Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTeacherTask('quiz')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                  teacherTask === 'quiz'
                    ? 'bg-accent-soft border-accent text-slate-900 dark:text-white'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ClipboardList className="w-4 h-4 text-accent" />
                <span>AI 自動出題</span>
              </button>

              <button
                type="button"
                onClick={() => setTeacherTask('outline')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                  teacherTask === 'outline'
                    ? 'bg-accent-soft border-accent text-slate-900 dark:text-white'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>整理上課大綱</span>
              </button>

              <button
                type="button"
                onClick={() => setTeacherTask('grades')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                  teacherTask === 'grades'
                    ? 'bg-accent-soft border-accent text-slate-900 dark:text-white'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Calculator className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span>計算學生成績</span>
              </button>
            </div>

            {/* File Upload Input */}
            <label className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-700 hover:border-accent cursor-pointer transition">
              <div className="flex items-center gap-2.5 min-w-0">
                <Upload className="w-4 h-4 text-accent shrink-0" />
                <span className="text-xs text-slate-700 dark:text-slate-200 truncate">
                  {teacherMaterialName
                    ? `已載入檔案：${teacherMaterialName}`
                    : '點擊上傳課程教材檔案（支援 .txt / .md / .csv / .json）'}
                </span>
              </div>
              <span className="text-[11px] font-bold text-accent shrink-0">選擇檔案</span>
              <input
                type="file"
                accept=".txt,.md,.csv,.json,.log"
                onChange={handleTeacherFileUpload}
                className="hidden"
              />
            </label>

            <textarea
              rows={8}
              value={teacherMaterialText}
              onChange={(e) => setTeacherMaterialText(e.target.value)}
              placeholder={
                teacherTask === 'grades'
                  ? '貼入或上傳學生成績 CSV（例如：學號姓名, 平時, 期中, 期末）...'
                  : '貼入或上傳課程教材講義、簡報文字內容...'
              }
              className="w-full p-3.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono leading-relaxed focus:outline-none focus:border-accent resize-none"
            />

            <input
              type="text"
              value={teacherExtraPrompt}
              onChange={(e) => setTeacherExtraPrompt(e.target.value)}
              placeholder={
                teacherTask === 'grades'
                  ? '配分權重備註（選填，預設平時30% / 期中35% / 期末35%）'
                  : '額外要求（選填，例如：出 5 題英文選擇題、適合 100 分鐘課程）'
              }
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-accent"
            />

            <button
              type="button"
              onClick={handleRunTeacherAI}
              disabled={isRunningTeacherTask || !teacherMaterialText.trim()}
              className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-40 text-xs font-bold flex items-center justify-center gap-2 shadow-accent transition"
            >
              <Sparkles className={`w-4 h-4 ${isRunningTeacherTask ? 'animate-spin' : ''}`} />
              <span>
                {isRunningTeacherTask
                  ? 'AI 運算處理中...'
                  : teacherTask === 'quiz'
                  ? '依據上傳教材自動出題'
                  : teacherTask === 'outline'
                  ? '自動整理結構化上課大綱'
                  : '立即精算成績與預警統計'}
              </span>
            </button>
          </div>

          <div className="lg:col-span-6 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none flex flex-col min-h-[520px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">教師 AI 產出結果</h3>
              {teacherResult && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(teacherResult);
                    setTeacherCopied(true);
                    setTimeout(() => setTeacherCopied(false), 2000);
                  }}
                  className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  {teacherCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{teacherCopied ? '已複製' : '複製結果'}</span>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto netflix-scrollbar p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              {teacherResult ? (
                teacherResult
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-12">
                  <GraduationCap className="w-9 h-9 mb-2 opacity-40 text-accent" />
                  <p className="text-xs">上傳教材或成績檔案後，點擊執行即可於此檢視 AI 產出</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 1: Interactive Chat */}
      {activeSubTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 flex flex-col h-[620px] rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg dark:shadow-xl">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto netflix-scrollbar p-4 space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-start gap-3 ${
                    m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      m.role === 'user'
                        ? 'bg-accent'
                        : 'bg-slate-100 dark:bg-slate-800 text-accent border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-accent rounded-tr-none shadow-accent'
                        : 'bg-slate-100 dark:bg-slate-950/90 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800/80 rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>
                    <div
                      className={`text-[10px] mt-2 font-mono ${
                        m.role === 'user' ? 'text-white/80 text-right' : 'text-slate-500'
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>
                </div>
              ))}

              {isGenerating && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-accent border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                    <Bot className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                    AI 正在組織思路中...
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Bar + Mode Switcher */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  placeholder="輸入課業疑惑、程式碼問題或考題概念..."
                  disabled={isGenerating}
                  className="flex-1 px-4 py-2.5 text-xs md:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-accent"
                />
                <button
                  type="submit"
                  disabled={isGenerating || !inputPrompt.trim()}
                  className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-40 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>送出</span>
                </button>
              </form>

              {/* Mode Switcher + Direct Answer Mode Timing Description */}
              <div className="space-y-2 pt-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setMode('guiding')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        mode === 'guiding'
                          ? 'bg-accent shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>提示引導模式</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('direct')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        mode === 'direct'
                          ? 'bg-amber-600 text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>直接解答模式</span>
                    </button>
                  </div>

                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {googleAccount
                      ? `Google 授權連線中 (${googleAccount.email})`
                      : '請先授權 Google 帳號以啟用對話'}
                  </span>
                </div>

                {/* Explicit Direct Answer Mode Usage Timing Guidance */}
                <div className="px-3 py-2 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                  <strong className="font-bold">直接解答模式 (Direct Answer Mode) 適用時機：</strong>
                  適合考前快速核對計算步驟、急需確認公式結果時使用；平時寫作業建議使用「提示引導模式」以培養獨立思考。
                </div>
              </div>
            </div>
          </div>

          {/* Quick Starters */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-3">
                <Lightbulb className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>熱門提問範例</span>
              </h4>
              <div className="space-y-2">
                {sampleQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => void handleSendMessage(q)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition leading-snug line-clamp-2"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Notes & Past Exam Extractor */}
      {activeSubTab === 'extract' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none flex flex-col h-[540px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" />
                <span>貼入教材文字、考題講義或大綱</span>
              </h3>
              <button
                onClick={() =>
                  setExtractInput(
                    `計算機網路期中考古題重點：\n1. Explain the differences between TCP and UDP protocols.\n2. What is ARP? How does it resolve IP to MAC?\n3. Describe Go-Back-N vs Selective Repeat.`
                  )
                }
                className="text-xs text-accent font-semibold hover:underline"
              >
                帶入範例
              </button>
            </div>

            <textarea
              value={extractInput}
              onChange={(e) => setExtractInput(e.target.value)}
              placeholder="在此貼上講義段落、作業題目或期中考題..."
              className="flex-1 p-3.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono leading-relaxed resize-none focus:outline-none focus:border-accent"
            />

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => void handleExtractNotes()}
                disabled={isExtracting || !extractInput.trim()}
                className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-40 font-bold text-xs flex items-center gap-2 shadow-accent transition"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isExtracting ? 'animate-spin' : ''}`} />
                <span>{isExtracting ? '萃取中...' : '自動生成精華筆記與考點'}</span>
              </button>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none flex flex-col h-[540px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span>AI 萃取結果</span>
              </h3>
              {extractResult && (
                <button
                  onClick={handleCopyResult}
                  className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copied ? '已複製' : '複製筆記'}</span>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto netflix-scrollbar p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs leading-relaxed whitespace-pre-wrap">
              {extractResult ? (
                extractResult
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center">
                  <BookOpen className="w-8 h-8 mb-2 opacity-40 text-accent" />
                  <span>左側貼入內容後點擊生成</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* One-Click Google Sign-In Modal */}
      {showGoogleModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 dark:bg-black/75 backdrop-blur-sm p-4"
          onClick={() => setShowGoogleModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-2.5">
              <GoogleLogoSvg className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                使用 Google 帳號一鍵授權登入
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              授權您的朝陽校園 Google 帳號或個人 Google 信箱，系統將自動為您完成 AI 學習助手連線授權，無須填寫任何 API 金鑰。
            </p>

            {/* Quick Campus Google Workspace Account Button */}
            <button
              type="button"
              onClick={() => handleOneClickGoogleAuth(defaultSuggestedEmail)}
              className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 transition text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <GoogleLogoSvg className="w-5 h-5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {profileName || (isTeacher ? '朝陽教師' : '朝陽同學')}（一鍵快速授權）
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                    {defaultSuggestedEmail}
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-accent text-xs font-bold shrink-0">
                立即授權
              </span>
            </button>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleOneClickGoogleAuth();
              }}
              className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  或改用其他 Google 信箱授權
                </label>
                <input
                  type="email"
                  required
                  value={googleEmailInput}
                  onChange={(e) => {
                    setGoogleEmailInput(e.target.value);
                    setGoogleAuthError('');
                  }}
                  placeholder="example@gm.cyut.edu.tw 或 @gmail.com"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-accent"
                />
              </div>

              {googleAuthError && (
                <div className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                  {googleAuthError}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-accent hover:bg-accent-hover rounded-lg shadow-accent transition"
                >
                  確認 Google 授權
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
