import React, { useState } from 'react';
import {
  askGeminiTutor,
  extractKeyNotes,
  runTeacherAITask,
  TeacherAITaskType,
  TutorMode,
} from '../services/geminiService';
import { UserRole } from '../types';
import {
  Sparkles,
  Send,
  Key,
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
} from 'lucide-react';

interface AITutorViewProps {
  role: UserRole;
  apiKey?: string;
  onSaveApiKey: (key: string) => void;
}

export const AITutorView: React.FC<AITutorViewProps> = ({ role, apiKey, onSaveApiKey }) => {
  const isTeacher = role === 'teacher';
  const [mode, setMode] = useState<TutorMode>('guiding');
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'extract' | 'teacher-tools'>(
    isTeacher ? 'teacher-tools' : 'chat'
  );
  const [inputKey, setInputKey] = useState(apiKey || '');
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<
    { id: string; role: 'user' | 'model'; content: string; timestamp: string }[]
  >([
    {
      id: 'init-msg',
      role: 'model',
      content: isTeacher
        ? '您好，歡迎使用朝陽教師 AI 助手。可直接提問教學規劃，或切換至「教師教材 AI 工坊」上傳講義與成績單。'
        : '你好！我是你的朝陽 AI 學習導師。目前預設為「提示引導模式」，可隨時於對話輸入框下方切換為「直接解答模式」或配置 BYOK 金鑰。',
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

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || isGenerating) return;

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

    const response = await askGeminiTutor(apiKey, text, mode, history);

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
    setIsExtracting(true);
    const result = await extractKeyNotes(apiKey, extractInput);
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
        setTeacherMaterialText(`【已載入檔案：${file.name} (${Math.round(file.size / 1024)} KB)】\n請在此補充教材關鍵段落或成績清單內容。`);
      }
    };
    reader.readAsText(file);
  };

  const handleRunTeacherAI = async () => {
    if (!teacherMaterialText.trim() || isRunningTeacherTask) return;
    setIsRunningTeacherTask(true);
    const output = await runTeacherAITask(
      apiKey,
      teacherTask,
      teacherMaterialText,
      teacherExtraPrompt
    );
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
      {/* Sub-tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {isTeacher && (
            <button
              onClick={() => setActiveSubTab('teacher-tools')}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
                activeSubTab === 'teacher-tools'
                  ? 'bg-[#E50914] text-white shadow-md shadow-red-950/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
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
                ? 'bg-[#E50914] text-white shadow-md shadow-red-950/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AI 即時對話</span>
          </button>

          <button
            onClick={() => setActiveSubTab('extract')}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
              activeSubTab === 'extract'
                ? 'bg-[#E50914] text-white shadow-md shadow-red-950/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>教材重點萃取</span>
          </button>
        </div>

        <button
          onClick={() => setShowKeyModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl transition"
        >
          <Key className="w-3.5 h-3.5 text-[#E50914]" />
          <span>{apiKey ? 'BYOK 金鑰已配置' : '配置 BYOK 金鑰'}</span>
        </button>
      </div>

      {/* TEACHER EXCLUSIVE AI WORKSPACE */}
      {isTeacher && activeSubTab === 'teacher-tools' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-bold text-white">教師教材上傳與 AI 任務選擇</h3>
              <button
                type="button"
                onClick={() => loadTeacherSample(teacherTask)}
                className="text-xs font-semibold text-[#E50914] hover:underline"
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
                    ? 'bg-[#E50914]/15 border-[#E50914] text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <ClipboardList className="w-4 h-4 text-[#E50914]" />
                <span>AI 自動出題</span>
              </button>

              <button
                type="button"
                onClick={() => setTeacherTask('outline')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                  teacherTask === 'outline'
                    ? 'bg-[#E50914]/15 border-[#E50914] text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>整理上課大綱</span>
              </button>

              <button
                type="button"
                onClick={() => setTeacherTask('grades')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                  teacherTask === 'grades'
                    ? 'bg-[#E50914]/15 border-[#E50914] text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span>計算學生成績</span>
              </button>
            </div>

            {/* File Upload Input */}
            <label className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-950 border border-dashed border-slate-700 hover:border-[#E50914]/70 cursor-pointer transition">
              <div className="flex items-center gap-2.5 min-w-0">
                <Upload className="w-4 h-4 text-[#E50914] shrink-0" />
                <span className="text-xs text-slate-200 truncate">
                  {teacherMaterialName
                    ? `已載入檔案：${teacherMaterialName}`
                    : '點擊上傳課程教材檔案（支援 .txt / .md / .csv / .json）'}
                </span>
              </div>
              <span className="text-[11px] font-bold text-[#E50914] shrink-0">選擇檔案</span>
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
              className="w-full p-3.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono leading-relaxed focus:outline-none focus:border-[#E50914] resize-none"
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
              className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#E50914]"
            />

            <button
              type="button"
              onClick={handleRunTeacherAI}
              disabled={isRunningTeacherTask || !teacherMaterialText.trim()}
              className="w-full py-3 rounded-xl bg-[#E50914] hover:bg-red-600 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition"
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

          <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col min-h-[520px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">教師 AI 產出結果</h3>
              {teacherResult && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(teacherResult);
                    setTeacherCopied(true);
                    setTimeout(() => setTeacherCopied(false), 2000);
                  }}
                  className="flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700"
                >
                  {teacherCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{teacherCopied ? '已複製' : '複製結果'}</span>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto netflix-scrollbar p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
              {teacherResult ? (
                teacherResult
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-12">
                  <GraduationCap className="w-9 h-9 mb-2 opacity-40 text-[#E50914]" />
                  <p className="text-xs">上傳教材或成績檔案後，點擊執行即可於此檢視 AI 產出</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 1: Interactive Chat (Mode Switcher & BYOK located BELOW input bar) */}
      {activeSubTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 flex flex-col h-[620px] rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
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
                        ? 'bg-[#E50914] text-white'
                        : 'bg-slate-800 text-red-400 border border-slate-700'
                    }`}
                  >
                    {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-[#E50914] text-white rounded-tr-none'
                        : 'bg-slate-950/90 text-slate-200 border border-slate-800/80 rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>
                    <div
                      className={`text-[10px] mt-2 font-mono ${
                        m.role === 'user' ? 'text-red-200 text-right' : 'text-slate-500'
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>
                </div>
              ))}

              {isGenerating && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-red-400 border border-slate-700 flex items-center justify-center">
                    <Bot className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                    AI 正在組織思路中...
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Bar + Mode Switcher & BYOK Controls Directly BELOW */}
            <div className="p-3.5 bg-slate-950 border-t border-slate-800 space-y-2.5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  placeholder="輸入課業疑惑、程式碼問題或考題概念..."
                  disabled={isGenerating}
                  className="flex-1 px-4 py-2.5 text-xs md:text-sm bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                />
                <button
                  type="submit"
                  disabled={isGenerating || !inputPrompt.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#E50914] hover:bg-red-600 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>送出</span>
                </button>
              </form>

              {/* Mode Switcher & BYOK Trigger relocated BELOW input box */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setMode('guiding')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      mode === 'guiding'
                        ? 'bg-[#E50914] text-white'
                        : 'text-slate-400 hover:text-white'
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
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>直接解答模式</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowKeyModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl transition"
                >
                  <Key className="w-3.5 h-3.5 text-[#E50914]" />
                  <span>{apiKey ? '金鑰已配置' : '配置 BYOK 金鑰'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Starters */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mb-3">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>熱門提問範例</span>
              </h4>
              <div className="space-y-2">
                {sampleQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800/80 text-xs text-slate-300 hover:text-white transition leading-snug line-clamp-2"
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
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col h-[540px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#E50914]" />
                <span>貼入教材文字、考題講義或大綱</span>
              </h3>
              <button
                onClick={() =>
                  setExtractInput(
                    `計算機網路期中考古題重點：\n1. Explain the differences between TCP and UDP protocols.\n2. What is ARP? How does it resolve IP to MAC?\n3. Describe Go-Back-N vs Selective Repeat.`
                  )
                }
                className="text-xs text-[#E50914] font-semibold hover:underline"
              >
                帶入範例
              </button>
            </div>

            <textarea
              value={extractInput}
              onChange={(e) => setExtractInput(e.target.value)}
              placeholder="在此貼上講義段落、作業題目或期中考題..."
              className="flex-1 p-3.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono leading-relaxed resize-none focus:outline-none focus:border-[#E50914]"
            />

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleExtractNotes}
                disabled={isExtracting || !extractInput.trim()}
                className="px-6 py-2.5 rounded-xl bg-[#E50914] hover:bg-red-600 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-2 transition"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isExtracting ? 'animate-spin' : ''}`} />
                <span>{isExtracting ? '萃取中...' : '自動生成精華筆記與考點'}</span>
              </button>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col h-[540px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>AI 萃取結果</span>
              </h3>
              {extractResult && (
                <button
                  onClick={handleCopyResult}
                  className="flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? '已複製' : '複製筆記'}</span>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto netflix-scrollbar p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs leading-relaxed whitespace-pre-wrap">
              {extractResult ? (
                extractResult
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center">
                  <BookOpen className="w-8 h-8 mb-2 opacity-40 text-[#E50914]" />
                  <span>左側貼入內容後點擊生成</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BYOK Key Config Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Key className="w-5 h-5 text-[#E50914]" />
              <span>BYOK 金鑰設定</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              您的 Google Gemini API Key 僅儲存於個人瀏覽器 LocalStorage，不會上傳至第三方伺服器。
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  關閉
                </button>
                <button
                  onClick={() => {
                    onSaveApiKey(inputKey);
                    setShowKeyModal(false);
                  }}
                  className="px-5 py-2 text-xs font-bold bg-[#E50914] text-white rounded-lg hover:bg-red-600 transition"
                >
                  儲存啟用
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
