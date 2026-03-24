import { supabase } from '@/lib/supabase';

export type AiMode = 'improve' | 'summarize' | 'write';

export const BOARD_STYLES = ['일상', '정보공유', '질문', '후기', '감성글'] as const;
export type BoardStyle = typeof BOARD_STYLES[number] | string;

const ALLOWED_MODES: AiMode[] = ['improve', 'summarize', 'write'];
export const AI_TEXT_MAX_LENGTH = 2000;
export const AI_PROMPT_MAX_LENGTH = 500;
export const AI_BOARD_STYLE_MAX_LENGTH = 50;

export async function aiAssist(text: string, mode: AiMode, boardStyle: string = '일반'): Promise<string> {
  if (!ALLOWED_MODES.includes(mode)) {
    throw new Error('유효하지 않은 모드입니다.');
  }

  const maxLength = mode === 'write' ? AI_PROMPT_MAX_LENGTH : AI_TEXT_MAX_LENGTH;
  if (!text.trim()) throw new Error('텍스트를 입력해주세요.');
  if (text.length > maxLength) {
    throw new Error(`입력이 너무 깁니다. 최대 ${maxLength}자까지 가능합니다.`);
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('로그인이 필요합니다');

  const callFn = (token: string) =>
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text, mode, boardStyle }),
    });

  let res = await callFn(session.access_token);

  // 토큰 만료로 401이면 세션 갱신 후 1회 재시도
  if (res.status === 401) {
    const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError || !refreshed.session) throw new Error('로그인이 필요합니다');
    res = await callFn(refreshed.session.access_token);
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = data as { error?: string; message?: string };
    throw new Error(err.error ?? err.message ?? 'AI 요청에 실패했습니다');
  }

  const data = await res.json() as { result: string };
  return data.result;
}
