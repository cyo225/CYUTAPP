export type TutorMode = 'guiding' | 'direct';
export type TeacherAITaskType = 'quiz' | 'outline' | 'grades';

async function postAIJson<T>(url: string, payload: Record<string, unknown>): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data.error || `AI 服務請求失敗 (${res.status})`);
  }
  return data;
}

export async function askGeminiTutor(
  userMessage: string,
  mode: TutorMode,
  conversationHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = [],
  contextDocument?: string
): Promise<string> {
  try {
    const data = await postAIJson<{ text?: string }>('/api/ai/tutor', {
      userMessage,
      mode,
      conversationHistory,
      contextDocument,
    });
    return data.text || '導師思考中，請稍候重試。';
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '未知錯誤';
    return message;
  }
}

export async function extractKeyNotes(sourceText: string): Promise<string> {
  try {
    const data = await postAIJson<{ text?: string }>('/api/ai/extract', {
      sourceText,
    });
    return data.text || '萃取完成，無輸出內容。';
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '未知錯誤';
    return message;
  }
}

export async function runTeacherAITask(
  taskType: TeacherAITaskType,
  materialContent: string,
  extraPrompt?: string
): Promise<string> {
  try {
    const data = await postAIJson<{ text?: string }>('/api/ai/teacher-task', {
      taskType,
      materialContent,
      extraPrompt,
    });
    return data.text || 'AI 產出完成，無內容。';
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '未知錯誤';
    return message;
  }
}
