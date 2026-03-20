import { supabase } from '@/lib/supabase';

export type AiMode = 'improve' | 'summarize';

export async function aiAssist(text: string, mode: AiMode): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('로그인이 필요합니다');

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assist`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ text, mode }),
    }
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? 'AI 요청에 실패했습니다');
  }

  const data = await res.json() as { result: string };
  return data.result;
}
