import { GoogleGenAI } from '@google/genai';

export type TutorMode = 'guiding' | 'direct';
export type TeacherAITaskType = 'quiz' | 'outline' | 'grades';

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
  const effectiveKey = apiKey?.trim() || (import.meta.env.VITE_GEMINI_API_KEY as string) || '';

  if (!effectiveKey) {
    return `請先在輸入框下方的【配置 BYOK 金鑰】輸入您的 Google Gemini API Key，即可啟用即時 AI 智能對話與考題萃取功能！`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: effectiveKey });
    const systemInstruction = mode === 'guiding' ? GUIDING_SYSTEM_INSTRUCTION : DIRECT_SYSTEM_INSTRUCTION;

    let promptText = userMessage;
    if (contextDocument) {
      promptText = `【參考教材/考古題背景資料】：\n${contextDocument}\n\n【提問】：\n${userMessage}`;
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '未知錯誤';
    return `AI 連線回應失敗: ${message || '請確認您的 API Key 是否正確且具備 Gemini 2.5 Flash 存取權限。'}`;
  }
}

export async function extractKeyNotes(
  apiKey: string | undefined,
  sourceText: string
): Promise<string> {
  const effectiveKey = apiKey?.trim() || (import.meta.env.VITE_GEMINI_API_KEY as string) || '';

  if (!effectiveKey) {
    return `### 講義與考古題重點自動萃取 (離線預覽)
1. **核心概念矩陣**：提煉文檔中反覆出現的關鍵定義與技術原理。
2. **必考公式與推導**：標註時間複雜度與演算法邊界條件。
3. **經典範題陷阱**：期中評量常考觀念辨析。
*(請於對話輸入框下方配置 BYOK API Key 以獲取全篇即時深度 AI 萃取)*`;
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '未知錯誤';
    return `萃取分析失敗: ${message || '請確認網路與 API Key。'}`;
  }
}

function calculateDeterministicGrades(rawCsvOrText: string): string {
  const lines = rawCsvOrText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const parsedRows: { name: string; scores: number[]; avg: number; passed: boolean }[] = [];

  for (const line of lines) {
    // Skip header lines containing non-numeric labels like 姓名, 學號, 期中
    const parts = line.split(/[,\t;]+/).map((p) => p.trim());
    if (parts.length < 2) continue;
    const nums = parts
      .slice(1)
      .map((v) => Number(v))
      .filter((n) => !Number.isNaN(n) && n >= 0 && n <= 100);
    if (nums.length === 0) continue;

    // Equal weight if 2+ columns, or 30% / 35% / 35% if 3 scores
    let avg = 0;
    if (nums.length === 3) {
      avg = Number((nums[0] * 0.3 + nums[1] * 0.35 + nums[2] * 0.35).toFixed(1));
    } else {
      avg = Number((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1));
    }
    parsedRows.push({
      name: parts[0],
      scores: nums,
      avg,
      passed: avg >= 60,
    });
  }

  if (parsedRows.length === 0) {
    return '無法解析有效成績列。請上傳包含「學號/姓名, 分數1, 分數2, 分數3」的 CSV 或文字資料。';
  }

  const classAvg = (parsedRows.reduce((acc, r) => acc + r.avg, 0) / parsedRows.length).toFixed(1);
  const passCount = parsedRows.filter((r) => r.passed).length;
  const maxScore = Math.max(...parsedRows.map((r) => r.avg));
  const minScore = Math.min(...parsedRows.map((r) => r.avg));

  const tableRows = parsedRows
    .map(
      (r) =>
        `- **${r.name}**：原始成績 [${r.scores.join(', ')}] → 加權總分 **${r.avg}** 分（${
          r.passed ? '及格' : '不及格 / 預警'
        }）`
    )
    .join('\n');

  return `### 班級學生成績統計報告（自動解析 ${parsedRows.length} 筆）
- **班級平均**：${classAvg} 分
- **及格人數 / 比率**：${passCount} / ${parsedRows.length} 人（${Math.round(
    (passCount / parsedRows.length) * 100
  )}%）
- **最高分 / 最低分**：${maxScore} 分 / ${minScore} 分
*(預設 3 欄採平時 30% + 期中 35% + 期末 35% 加權；其餘採等權平均)*

#### 個別學生試算明細
${tableRows}`;
}

export async function runTeacherAITask(
  apiKey: string | undefined,
  taskType: TeacherAITaskType,
  materialContent: string,
  extraPrompt?: string
): Promise<string> {
  const effectiveKey = apiKey?.trim() || (import.meta.env.VITE_GEMINI_API_KEY as string) || '';

  if (taskType === 'grades') {
    const localStats = calculateDeterministicGrades(materialContent);
    if (!effectiveKey) {
      return `${localStats}\n\n*(配置 Gemini BYOK 金鑰後，系統可同步產出個別學生學習預警評語與配分調整建議)*`;
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
                text: `你是朝陽科技大學的教學助理 AI。請根據以下已精算的成績統計與原始資料，協助教師：
1. 確認加權邏輯（若有自訂配分要求請依此重算：${extraPrompt || '無額外配分指定'}）。
2. 列出需期中預警輔導的學生名單與建議。
3. 提供整體班級評量難度回饋。

精算初稿：
${localStats}

原始上傳成績內容：
${materialContent}`,
              },
            ],
          },
        ],
        config: { temperature: 0.2 },
      });
      return response.text || localStats;
    } catch {
      return localStats;
    }
  }

  if (!effectiveKey) {
    if (taskType === 'quiz') {
      return `### 教材自動出題預覽（未配置 BYOK 金鑰）
根據您上傳的教材片段，AI 建議考題架構如下：
1. **【單選題】**：請針對教材核心定義設計觀念辨析題（配分 20%）。
2. **【簡答題】**：要求學生比較兩種方法或流程的差異與適用情境（配分 40%）。
3. **【實作應用題】**：結合課堂案例進行步驟推導或情境分析（配分 40%）。

*(請於對話框下方配置 Gemini BYOK 金鑰，即可依據上傳檔案全文自動產出完整試題與詳解)*`;
    }
    return `### 上課大綱自動整理預覽（未配置 BYOK 金鑰）
- **第一節｜核心觀念導入**：建立教材主軸與先備知識連結。
- **第二節｜關鍵原理與架構解析**：拆解上傳講義中之重點模組與範例。
- **第三節｜實作練習與課後檢核**：安排隨堂測驗與作業重點提醒。

*(請於對話框下方配置 Gemini BYOK 金鑰，即可針對上傳檔案自動生成完整週次課綱)*`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: effectiveKey });
    const instruction =
      taskType === 'quiz'
        ? `請身為朝陽科技大學教授專屬命題 AI，根據教師上傳的教材內容自動設計一份專業測驗試卷（繁體中文 Markdown 格式）：
包含：
1. 單選題 3 題（每題 4 個選項）
2. 簡答 / 申論題 2 題
3. 完整標準答案與教師命題解析（含核心考點對應）
額外指令：${extraPrompt || '難度適中，兼顧基礎觀念與實務應用'}`
        : `請身為朝陽科技大學課程規劃 AI，根據教師上傳的教材內容整理出結構清晰的上課大綱（繁體中文 Markdown 格式）：
包含：
1. 課程學習目標（Learning Objectives）
2. 分段授課時間軸與重點摘要（100 分鐘課程規劃）
3. 課堂互動提問與課後作業建議
額外指令：${extraPrompt || '條理分明，適合投影授課與匯入 Tronclass 公告'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${instruction}\n\n教師上傳教材內容如下：\n${materialContent}`,
            },
          ],
        },
      ],
      config: { temperature: 0.35 },
    });

    return response.text || 'AI 產出完成，無內容。';
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '未知錯誤';
    return `教師 AI 工具執行失敗: ${message}`;
  }
}
