// @ts-nocheck — Deno runtime, not Node.js
import { createClient } from 'jsr:@supabase/supabase-js@2';
import {
  ALLOWED_MODES,
  type AiMode,
  MAX_BOARD_STYLE_LENGTH,
  MAX_TEXT_LENGTH,
} from './shared.ts';
import {
  buildSystemPrompt,
  buildUserMessage,
  inspectAiInput,
  sanitizeAiOutput,
  sanitizeBoardStyle,
} from './guard.ts';

const MINIMAX_API_URL = 'https://api.minimax.io/v1/text/chatcompletion_v2';

const allowedOrigin = Deno.env.get('ALLOWED_ORIGIN');
if (!allowedOrigin) {
  console.error('ALLOWED_ORIGIN 환경변수가 설정되지 않았습니다. 배포 설정을 확인하세요.');
}

const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const adminSupabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

async function checkRateLimit(userId: string): Promise<boolean> {
  const { data, error } = await adminSupabase.rpc('check_ai_rate_limit', { p_user_id: userId });
  if (error) {
    console.error('rate limit check error:', error);
    return false;
  }
  return data === true;
}

function jsonResponse(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse(401, { error: 'Unauthorized' });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return jsonResponse(401, { error: 'Unauthorized' });
  }

  if (!(await checkRateLimit(user.id))) {
    return jsonResponse(429, {
      error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
    });
  }

  let body: { text?: unknown; mode?: unknown; boardStyle?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, { error: '잘못된 요청 형식입니다.' });
  }

  const { text, mode, boardStyle: rawBoardStyle } = body;

  if (typeof text !== 'string' || typeof mode !== 'string') {
    return jsonResponse(400, { error: '잘못된 요청입니다.' });
  }

  if (!(ALLOWED_MODES as string[]).includes(mode)) {
    return jsonResponse(400, { error: '유효하지 않은 mode입니다.' });
  }

  const validMode = mode as AiMode;
  const maxLength = MAX_TEXT_LENGTH;

  if (!text.trim()) {
    return jsonResponse(400, { error: '텍스트를 입력해주세요.' });
  }

  if (text.length > maxLength) {
    return jsonResponse(400, {
      error: `입력이 너무 깁니다. 최대 ${maxLength}자까지 가능합니다.`,
    });
  }

  const inputInspection = inspectAiInput(text, validMode);
  if (inputInspection.blocked) {
    console.warn('ai-assist blocked input', {
      userId: user.id,
      mode: validMode,
      reason: inputInspection.reason,
      length: inputInspection.normalized.length,
    });
    return jsonResponse(400, {
      error: 'AI 보조는 게시글 작성과 직접 관련된 요청만 처리할 수 있습니다.',
    });
  }

  const boardStyle = sanitizeBoardStyle(rawBoardStyle, MAX_BOARD_STYLE_LENGTH);

  const minimaxKey = Deno.env.get('MINIMAX_API_KEY');
  if (!minimaxKey) {
    return jsonResponse(500, { error: '서버 설정 오류입니다.' });
  }

  const mmRes = await fetch(MINIMAX_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${minimaxKey}`,
    },
    body: JSON.stringify({
      model: 'MiniMax-M2.1',
      messages: [
        { role: 'system', content: buildSystemPrompt(validMode, boardStyle) },
        { role: 'user', content: buildUserMessage(validMode, inputInspection.normalized) },
      ],
    }),
  });

  if (!mmRes.ok) {
    const errText = await mmRes.text();
    console.error(`Minimax API error (${mmRes.status}):`, errText);
    return jsonResponse(502, {
      error: 'AI 요청에 실패했습니다. 잠시 후 다시 시도해주세요.',
    });
  }

  const mmData = await mmRes.json();
  const rawOutput: string = mmData?.choices?.[0]?.message?.content ?? '';

  const result = sanitizeAiOutput(rawOutput);

  if (!result) {
    return jsonResponse(502, { error: 'AI 요청에 실패했습니다. 잠시 후 다시 시도해주세요.' });
  }

  return jsonResponse(200, { result });
});
