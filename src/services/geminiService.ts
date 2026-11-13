import { GoogleGenAI } from '@google/genai';

export type TutorMode = 'guiding' | 'direct';

const GUIDING_SYSTEM_INSTRUCTION = `你是一位專業且富有耐心的朝陽科技大學 (CYUT) 專屬「Socratic 啟發引導型」AI 學習導師。
你的核心原則：
1. 嚴格遵守「提示引導模式」：絕對不要直接給出最終答案、完整計算數值或完整可複製的作業程式碼！
2. 採用蘇格拉底引導法（Socratic Method）：
   - 先肯定學生的問題方向。
   - 將複雜問題拆解為 2-3 個循序漸進的思考步驟。
   - 給予關鍵概念提示（例如特定演算法原理、公式、或核心邏輯）。
   - 最後拋出一個簡短的反思問題，鼓勵學生自己推導下一步。
3. 語氣溫和、專業且具備大學學術水準，繁體中文回答。適時以朝陽科大的課程與實務環境舉例。`;

const DIRECT_SYSTEM_INSTRUCTION = `你是一位專業、高效且邏輯嚴謹的朝陽科技大學 (CYUT)「直接解答與深度剖析」AI 學習助手。
你的核心原則：
1. 遵守「直接解答模式」：直接、清晰且完整地解答學生的問題與課業疑惑。
2. 包含：
   - 核心答案或結論。
   - 詳細的推導過程、計算步驟或完整註解之程式碼範例。
   - 常見易錯點與期中/期末考防陷阱提醒。
3. 繁體中文回答，條理分明，使用 Markdown 格式排版。`;

export async function askGeminiTutor(
  apiKey: string | undefined,
  userMessage: string,
  mode: TutorMode,
  conversationHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = [],
  contextDocument?: string
): Promise<string> {
  // If no custom key provided, check window or throw a helpful prompt
  const effectiveKey = apiKey?.trim() || (import.meta.env.VITE_GEMINI_API_KEY as string) || '';

  if (!effectiveKey) {
    return `⚠️ 請先在右上角【BYOK 金鑰設定】輸入您的 Google Gemini API Key，即可啟用即時 AI 智能對話與考題萃取功能！（亦可點擊頂部「一鍵帶入測試帳號」體驗功能）`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: effectiveKey });
    const systemInstruction = mode === 'guiding' ? GUIDING_SYSTEM_INSTRUCTION : DIRECT_SYSTEM_INSTRUCTION;

    let promptText = userMessage;
    if (contextDocument) {
      promptText = `【參考教材/考古題背景資料】：\n${contextDocument}\n\n【學生提問】：\n${userMessage}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        ...conversationHistory,
        {
          role: 'user',
          parts: [{ text: promptText }],
        },
      ],
      config: {
        systemInstruction,
        temperature: mode === 'guiding' ? 0.7 : 0.2,
      },
    });

    return response.text || '導師思考中，請稍候重試。';
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return `❌ AI 連線回應失敗: ${error?.message || '請確認您的 API Key 是否正確且具備 Gemini 2.5 Flash 存取權限。'}`;
  }
}

export async function extractKeyNotes(
  apiKey: string | undefined,
  sourceText: string
): Promise<string> {
  const effectiveKey = apiKey?.trim() || (import.meta.env.VITE_GEMINI_API_KEY as string) || '';

  if (!effectiveKey) {
    // Return structured offline summary if no key yet
    return `### 💡 講義與考古題重點自動萃取 (離線預覽)
1. **核心概念矩陣**：提煉文檔中反覆出現的關鍵定義與技術原理。
2. **必考公式與推導**：標註時間複雜度與演算法邊界條件。
3. **經典範題陷阱**：期中評量常考觀念辨析。
*(請配置 BYOK API Key 以獲取全篇即時深度 AI 萃取)*`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: effectiveKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `請分析以下這份朝陽科大課程教材/歷屆考古題內容，自動提取出精華重點。
請以結構化 Markdown 輸出：
1. 【核心概念與關鍵名詞】(3-5 點)
2. 【期中期末高頻必考重點 / 陷阱題】(2-3 點)
3. 【速記閃卡 (Q&A 複習題)】(2 題附解析)

內容如下：
${sourceText}`,
            },
          ],
        },
      ],
      config: {
        temperature: 0.3,
      },
    });

    return response.text || '萃取完成，無輸出內容。';
  } catch (err: any) {
    return `萃取分析失敗: ${err?.message || '請確認網路與 API Key。'}`;
  }
}
