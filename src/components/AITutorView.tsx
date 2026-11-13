import React, { useState } from 'react';
import { askGeminiTutor, extractKeyNotes, TutorMode } from '../services/geminiService';
import { 
  Sparkles, 
  Send, 
  Key, 
  ToggleLeft, 
  ToggleRight, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  CheckCircle, 
  Lightbulb, 
  Bot, 
  User, 
  Trash2,
  Copy,
  Check
} from 'lucide-react';

interface AITutorViewProps {
  apiKey?: string;
  onSaveApiKey: (key: string) => void;
}

export const AITutorView: React.FC<AITutorViewProps> = ({ apiKey, onSaveApiKey }) => {
  const [mode, setMode] = useState<TutorMode>('guiding'); // Default: guiding (提示引導模式)
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'extract'>('chat');
  const [inputKey, setInputKey] = useState(apiKey || '');
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<
    { id: string; role: 'user' | 'model'; content: string; timestamp: string }[]
  >([
    {
      id: 'init-msg',
      role: 'model',
      content: `👋 哈囉！我是你的朝陽科技大學專屬 AI 學習導師。\n\n目前處於預設的【提示引導模式】（Socratic Method）——我會拆解思路、給予提示與引導提問，協助你獨立推導出答案，加深期中期末考記憶！\n\n若你急需完整推導細節，可隨時點擊右上角切換至【直接解答模式】。今天有哪門課的教材或演算法想一起探討？`,
      timestamp: '剛剛',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Extractor state
  const [extractInput, setExtractInput] = useState('');
  const [extractResult, setExtractResult] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [copied, setCopied] = useState(false);

  const sampleQuestions = [
    '計算機網路中 TCP 三向交握 (Three-Way Handshake) 為什麼需要三次而不是兩次？',
    '演算法 Dijkstra 和 Bellman-Ford 的核心差異與適用情境是什麼？',
    '機器學習中的 Overfitting (過擬合) 要如何透過 Regularization 改善？',
    'UI/UX 設計中 Fitts\'s Law (費茨法則) 在行動 App 選單上的應用原理？',
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

    // Format history for Gemini
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

  return (
    <div className="space-y-6">
      {/* Top Controller Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#161F30] to-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E50914] flex items-center justify-center text-white shadow-lg shadow-red-950/40">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>CYUT 智慧 AI 學習助手系統</span>
            </h2>
            <div className="text-xs text-slate-400 mt-0.5">
              整合 Google Gemini 2.5 核心 · 支援學生 BYOK 自備金鑰 · 雙模式深度輔助
            </div>
          </div>
        </div>

        {/* Right Mode Toggle & Key Settings */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Dual Mode Switcher (Guiding vs Direct) */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setMode('guiding')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'guiding'
                  ? 'bg-[#E50914] text-white shadow-md shadow-red-950/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>提示引導模式 (預設)</span>
            </button>
            <button
              onClick={() => setMode('direct')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'direct'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-950/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>直接解答模式</span>
            </button>
          </div>

          {/* BYOK Settings Trigger */}
          <button
            onClick={() => setShowKeyModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition"
          >
            <Key className="w-3.5 h-3.5 text-[#E50914]" />
            <span>{apiKey ? '金鑰已配置' : '配置 BYOK 金鑰'}</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs: Live Chat vs Notes Extractor */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('chat')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition ${
            activeSubTab === 'chat'
              ? 'bg-[#E50914] text-white shadow-md shadow-red-950/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>AI 即時雙模式對話</span>
        </button>
        <button
          onClick={() => setActiveSubTab('extract')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition ${
            activeSubTab === 'extract'
              ? 'bg-[#E50914] text-white shadow-md shadow-red-950/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>自動萃取教材與考古題重點</span>
        </button>
      </div>

      {/* Mode Status Callout */}
      <div
        className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
          mode === 'guiding'
            ? 'bg-red-950/30 border-red-900/50 text-red-200'
            : 'bg-amber-950/30 border-amber-900/50 text-amber-200'
        }`}
      >
        <div className="flex items-center gap-2">
          {mode === 'guiding' ? (
            <Lightbulb className="w-4 h-4 text-[#E50914] shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>
            {mode === 'guiding'
              ? '【提示引導模式】：AI 將啟發引導思考，分解邏輯步驟，不直接爆雷答案。'
              : '【直接解答模式】：AI 將直接輸出完整正確解答、詳細推導與完整程式碼。'}
          </span>
        </div>
        <button
          onClick={() => setMode(mode === 'guiding' ? 'direct' : 'guiding')}
          className="underline font-bold hover:text-white ml-2 whitespace-nowrap"
        >
          切換為{mode === 'guiding' ? '直接解答' : '提示引導'}
        </button>
      </div>

      {/* Sub-Tab 1: Interactive Chat */}
      {activeSubTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Box (3 cols) */}
          <div className="lg:col-span-3 flex flex-col h-[600px] rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
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
                      m.role === 'user' ? 'bg-[#E50914] text-white' : 'bg-slate-800 text-red-400 border border-slate-700'
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
                    AI 導師正在組織思路與解析概念中...
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-slate-950 border-t border-slate-800">
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
                  placeholder="輸入課業疑惑、程式碼問題或考題概念 (例如：TCP 交握、動態規劃 DP 推導)..."
                  disabled={isGenerating}
                  className="flex-1 px-4 py-2.5 text-xs md:text-sm bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                />
                <button
                  type="submit"
                  disabled={isGenerating || !inputPrompt.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#E50914] hover:bg-red-600 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-red-950/50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>送出</span>
                </button>
              </form>
            </div>
          </div>

          {/* Quick Starters Panel (1 col) */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mb-3">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>朝陽熱門課業引導問答</span>
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

            <div className="p-4 rounded-2xl bg-gradient-to-br from-red-950/40 to-slate-900 border border-red-900/50 text-xs">
              <div className="font-bold text-red-300 mb-1">💡 雙模式運用建議</div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                平日複習請開啟<strong>「提示引導模式」</strong>，能鍛鍊程式與數學思維；考前一小時抱佛腳或除錯卡關時，再開啟<strong>「直接解答模式」</strong>快速掌握正解。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Notes & Past Exam Extractor */}
      {activeSubTab === 'extract' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Source Document */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col h-[560px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#E50914]" />
                <span>貼入教材文字、考題講義或大綱</span>
              </h3>
              <button
                onClick={() =>
                  setExtractInput(
                    `計算機網路期中考古題重點題型：\n1. Explain the differences between TCP and UDP protocols. When to use UDP?\n2. What is the role of ARP (Address Resolution Protocol)? How does it resolve IP to MAC address?\n3. Describe Go-Back-N (GBN) vs Selective Repeat (SR) sliding window ARQ mechanisms.\n4. Calculate the throughput of a CSMA/CD network with 1 Gbps transmission rate.`
                  )
                }
                className="text-[11px] text-[#E50914] font-semibold hover:underline"
              >
                帶入考古題範例
              </button>
            </div>

            <textarea
              value={extractInput}
              onChange={(e) => setExtractInput(e.target.value)}
              placeholder="在此貼上講義段落、Tronclass 作業題目、教授投影片筆記或期中考題..."
              className="flex-1 p-3.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono leading-relaxed resize-none focus:outline-none focus:border-[#E50914]"
            />

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleExtractNotes}
                disabled={isExtracting || !extractInput.trim()}
                className="px-6 py-2.5 rounded-xl bg-[#E50914] hover:bg-red-600 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-red-950/50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isExtracting ? 'animate-spin' : ''}`} />
                <span>{isExtracting ? 'AI 深度萃取中...' : '自動生成精華筆記與考點'}</span>
              </button>
            </div>
          </div>

          {/* Extracted Output Result */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col h-[560px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>AI 萃取結構化成果 (精華卡片)</span>
              </h3>
              {extractResult && (
                <button
                  onClick={handleCopyResult}
                  className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? '已複製' : '複製筆記'}</span>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto netflix-scrollbar p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs leading-relaxed whitespace-pre-wrap font-sans">
              {extractResult ? (
                extractResult
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center">
                  <BookOpen className="w-8 h-8 mb-2 opacity-40 text-[#E50914]" />
                  <span>左側貼入文字後，點擊「自動生成精華筆記」</span>
                  <span className="text-[11px] text-slate-600 mt-1">
                    系統將自動萃取：核心觀念矩陣、期中必考陷阱與高頻閃卡題
                  </span>
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
              <span>學生 BYOK 金鑰設定</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Campus Life CYUT 秉持自備金鑰 (Bring Your Own Key) 原則。您的 API Key 僅儲存於個人瀏覽器 LocalStorage，不會外傳任何伺服器。
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

              <div className="text-[11px] text-slate-400 bg-slate-950 p-3 rounded-lg border border-slate-800">
                📌 如何取得免費 Gemini API Key：
                <ol className="list-decimal list-inside mt-1 space-y-0.5 text-slate-300">
                  <li>前往 Google AI Studio (aistudio.google.com)</li>
                  <li>使用 Google 帳號登入並點擊「Get API Key」</li>
                  <li>複製貼入此處即可無限制對話與萃取重點</li>
                </ol>
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
