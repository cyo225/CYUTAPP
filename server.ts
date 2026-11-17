import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import type { BusRouteInfo } from './src/types/index.ts';
import {
  CYUT_ROUTE_TEMPLATES,
  GLOBAL_SERVICE_END_MINUTES,
  OVERNIGHT_CUTOFF_MINUTES,
  evaluateCyutTransit,
  evaluateRouteSchedule,
  getTaiwanClock,
} from './src/utils/transitEngine.ts';

interface TdxTokenCache {
  accessToken: string;
  expiresAt: number;
}

interface TdxEtaItem {
  PlateNumb?: string;
  StopName?: { Zh_tw?: string };
  RouteName?: { Zh_tw?: string };
  SubRouteName?: { Zh_tw?: string };
  Direction?: number;
  EstimateTime?: number;
  StopStatus?: number; // 0: Normal, 1: Not yet departed, 2: No stop, 3: Last bus passed, 4: Not operating today
  NextBusTime?: string;
}

let tdxTokenCache: TdxTokenCache | null = null;

async function getTdxAccessToken(clientId: string, clientSecret: string): Promise<string> {
  if (tdxTokenCache && Date.now() < tdxTokenCache.expiresAt - 60_000) {
    return tdxTokenCache.accessToken;
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(
    'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token',
    {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    }
  );

  if (!res.ok) {
    throw new Error(`TDX token error: ${res.status}`);
  }

  const data = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) {
    throw new Error('Missing TDX access_token');
  }

  tdxTokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 86400) * 1000,
  };
  return data.access_token;
}

async function fetchLiveTdxTaichungRoutes(clientId: string, clientSecret: string) {
  const now = new Date();
  const clock = getTaiwanClock(now);
  const basePayload = evaluateCyutTransit(now);

  // Enforce strict 22:30 cutoff even before calling external TDX API
  if (
    clock.totalMinutes >= GLOBAL_SERVICE_END_MINUTES ||
    clock.totalMinutes < OVERNIGHT_CUTOFF_MINUTES
  ) {
    return basePayload;
  }

  const token = await getTdxAccessToken(clientId, clientSecret);
  const filter = encodeURIComponent(
    "contains(StopName/Zh_tw,'朝陽科技大學') or contains(StopName/Zh_tw,'吉峰路口')"
  );
  const url = `https://tdx.transportdata.tw/api/basic/v2/Bus/EstimatedTimeOfArrival/City/Taichung?$filter=${filter}&$format=JSON`;

  const res = await fetch(url, {
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`TDX ETA error: ${res.status}`);
  }

  const items = (await res.json()) as TdxEtaItem[];
  const mappedRoutes: BusRouteInfo[] = CYUT_ROUTE_TEMPLATES.map((tpl) => {
    const fallback = evaluateRouteSchedule(tpl, clock);
    if (fallback.status === 'ended') {
      return fallback;
    }

    const candidates = items.filter((item) => {
      const subName = item.SubRouteName?.Zh_tw || '';
      const routeName = item.RouteName?.Zh_tw || '';
      const rName = subName || routeName;
      const stopZh = item.StopName?.Zh_tw || '';
      const routeMatch =
        tpl.route === '151 副線'
          ? rName.includes('151')
          : routeName === tpl.tdxRouteName || rName === tpl.tdxRouteName;
      // Strictly match TDX Direction (0 = 去程 往朝陽科大, 1 = 返程 朝陽發車下山往市區/北屯/高鐵)
      const dirMatch = item.Direction === tpl.tdxDirection;
      const stopMatch = stopZh.includes('朝陽') || stopZh.includes('吉峰路口');
      return routeMatch && dirMatch && stopMatch;
    });

    // Prioritize exact 朝陽科技大學(校門口) / 朝陽科技大學 stop, and 151副/151延 for 151 副線
    candidates.sort((a, b) => {
      const score = (item: TdxEtaItem) => {
        let s = 0;
        const stopZh = item.StopName?.Zh_tw || '';
        const rName = item.SubRouteName?.Zh_tw || item.RouteName?.Zh_tw || '';
        if (stopZh.includes('校門口')) s += 40;
        else if (stopZh.includes('朝陽科技大學')) s += 25;
        else if (stopZh.includes('朝陽')) s += 15;
        if (tpl.route === '151 副線' && (rName.includes('副') || rName.includes('延') || rName === '151A')) {
          s += 10;
        }
        return s;
      };
      return score(b) - score(a);
    });

    const matched = candidates[0];

    if (!matched) {
      return fallback;
    }

    // TDX StopStatus: 3 = Last bus passed, 4 = Not operating today
    if (matched.StopStatus === 3 || matched.StopStatus === 4) {
      return {
        ...fallback,
        stopName: matched.StopName?.Zh_tw || fallback.stopName,
        status: 'ended',
        nextBusMinutes: -1,
        secondBusMinutes: undefined,
        nextDepartureTime: `明日 ${fallback.firstDeparture}`,
        plateNumber: undefined,
        currentStop: 'TDX 即時回報：末班車已過，今日營運已結束',
      };
    }

    if (matched.StopStatus === 2) {
      return {
        ...fallback,
        stopName: matched.StopName?.Zh_tw || fallback.stopName,
        status: 'unscheduled',
        nextBusMinutes: -1,
        secondBusMinutes: undefined,
        plateNumber: undefined,
        currentStop: 'TDX 即時回報：交管不停靠或暫不停靠本站',
      };
    }

    if (matched.StopStatus === 1) {
      const nextDep = matched.NextBusTime
        ? new Date(matched.NextBusTime).toLocaleTimeString('zh-TW', {
            timeZone: 'Asia/Taipei',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
          })
        : fallback.nextDepartureTime;
      return {
        ...fallback,
        stopName: matched.StopName?.Zh_tw || fallback.stopName,
        status: 'unscheduled',
        nextBusMinutes: -1,
        secondBusMinutes: undefined,
        plateNumber: undefined,
        nextDepartureTime: nextDep ? `${nextDep} 發車` : fallback.nextDepartureTime,
        currentStop: 'TDX 即時回報：車輛尚未從發車站發車',
      };
    }

    if (typeof matched.EstimateTime === 'number') {
      const mins = Math.max(0, Math.round(matched.EstimateTime / 60));
      const status: BusRouteInfo['status'] =
        mins <= 1 ? 'arriving' : mins <= 4 ? 'approaching' : 'scheduled';
      return {
        ...fallback,
        stopName: matched.StopName?.Zh_tw || fallback.stopName,
        status,
        nextBusMinutes: mins,
        secondBusMinutes: undefined,
        plateNumber: matched.PlateNumb || fallback.plateNumber,
        currentStop:
          status === 'arriving'
            ? `TDX 即時回報：車輛即將抵達「${matched.StopName?.Zh_tw || tpl.stopName}」`
            : `TDX 即時回報：預估約 ${mins} 分鐘抵達「${matched.StopName?.Zh_tw || tpl.stopName}」`,
      };
    }

    return fallback;
  });

  return {
    ...basePayload,
    source: 'tdx' as const,
    routes: mappedRoutes,
    allEnded: mappedRoutes.every((r) => r.status === 'ended'),
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/transit/cyut', async (_req: Request, res: Response) => {
    const clientId = process.env.TDX_CLIENT_ID;
    const clientSecret = process.env.TDX_CLIENT_SECRET;

    if (clientId && clientSecret) {
      try {
        const liveData = await fetchLiveTdxTaichungRoutes(clientId, clientSecret);
        res.json(liveData);
        return;
      } catch (err) {
        console.warn('TDX API fetch failed, falling back to strict Taiwan schedule:', err);
      }
    }

    res.json(evaluateCyutTransit(new Date()));
  });

  // Server-side Gemini AI endpoints (Google-authenticated users invoke via backend proxy)
  const createServerGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  app.post('/api/ai/tutor', async (req: Request, res: Response) => {
    const ai = createServerGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: '伺服器尚未設定 GEMINI_API_KEY 環境變數，請於 Settings > Secrets 面板確認授權金鑰。',
      });
      return;
    }

    const { userMessage, mode, conversationHistory = [], contextDocument } = req.body as {
      userMessage?: string;
      mode?: 'guiding' | 'direct';
      conversationHistory?: { role: 'user' | 'model'; parts: { text: string }[] }[];
      contextDocument?: string;
    };

    if (!userMessage || !userMessage.trim()) {
      res.status(400).json({ error: '請輸入提問內容' });
      return;
    }

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

    try {
      const promptText = contextDocument
        ? `【參考教材/考古題背景資料】：\n${contextDocument}\n\n【提問】：\n${userMessage}`
        : userMessage;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: [
          ...conversationHistory,
          {
            role: 'user',
            parts: [{ text: promptText }],
          },
        ],
        config: {
          systemInstruction:
            mode === 'direct' ? DIRECT_SYSTEM_INSTRUCTION : GUIDING_SYSTEM_INSTRUCTION,
        },
      });

      res.json({ text: response.text || '導師思考中，請稍候重試。' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'AI 服務連線失敗';
      res.status(502).json({ error: `AI 連線回應失敗：${msg}` });
    }
  });

  app.post('/api/ai/extract', async (req: Request, res: Response) => {
    const ai = createServerGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: '伺服器尚未設定 GEMINI_API_KEY 環境變數，請於 Settings > Secrets 面板確認授權金鑰。',
      });
      return;
    }

    const { sourceText } = req.body as { sourceText?: string };
    if (!sourceText || !sourceText.trim()) {
      res.status(400).json({ error: '請貼入教材或考題內容' });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `請分析以下這份朝陽科大課程教材/歷屆考古題內容，自動提取出精華重點。
請以結構化 Markdown 輸出：
1. 【核心概念與關鍵名詞】(3-5 點)
2. 【期中期末高頻必考重點 / 陷阱題】(2-3 點)
3. 【速記閃卡 (Q&A 複習題)】(2 題附解析)

內容如下：
${sourceText}`,
      });

      res.json({ text: response.text || '萃取完成，無輸出內容。' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '未知錯誤';
      res.status(502).json({ error: `萃取分析失敗：${msg}` });
    }
  });

  app.post('/api/ai/teacher-task', async (req: Request, res: Response) => {
    const ai = createServerGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: '伺服器尚未設定 GEMINI_API_KEY 環境變數，請於 Settings > Secrets 面板確認授權金鑰。',
      });
      return;
    }

    const { taskType, materialContent, extraPrompt } = req.body as {
      taskType?: 'quiz' | 'outline' | 'grades';
      materialContent?: string;
      extraPrompt?: string;
    };

    if (!materialContent || !materialContent.trim()) {
      res.status(400).json({ error: '請提供教材或成績內容' });
      return;
    }

    try {
      let prompt = '';
      if (taskType === 'grades') {
        prompt = `你是朝陽科技大學的教學助理 AI。請根據以下教師上傳的班級成績紀錄，協助：
1. 依配分權重（${extraPrompt || '預設平時 30%、期中 35%、期末 35%'}）精算每位學生加權總分與班級平均、及格率統計。
2. 列出需期中預警輔導的學生名單與學習建議。
3. 提供整體班級評量難度回饋。

原始上傳成績內容：
${materialContent}`;
      } else if (taskType === 'quiz') {
        prompt = `請身為朝陽科技大學教授專屬命題 AI，根據教師上傳的教材內容自動設計一份專業測驗試卷（繁體中文 Markdown 格式）：
包含：
1. 單選題 3 題（每題 4 個選項）
2. 簡答 / 申論題 2 題
3. 完整標準答案與教師命題解析（含核心考點對應）
額外指令：${extraPrompt || '難度適中，兼顧基礎觀念與實務應用'}

教師上傳教材內容如下：
${materialContent}`;
      } else {
        prompt = `請身為朝陽科技大學課程規劃 AI，根據教師上傳的教材內容整理出結構清晰的上課大綱（繁體中文 Markdown 格式）：
包含：
1. 課程學習目標（Learning Objectives）
2. 分段授課時間軸與重點摘要（100 分鐘課程規劃）
3. 課堂互動提問與課後作業建議
額外指令：${extraPrompt || '條理分明，適合投影授課與匯入 Tronclass 公告'}

教師上傳教材內容如下：
${materialContent}`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
      });

      res.json({ text: response.text || 'AI 產出完成，無內容。' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '未知錯誤';
      res.status(502).json({ error: `教師 AI 工具執行失敗：${msg}` });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Campus Life CYUT server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
