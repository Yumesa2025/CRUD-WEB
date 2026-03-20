// @ts-nocheck — Deno runtime, not Node.js
import { createClient } from 'jsr:@supabase/supabase-js@2';

const MINIMAX_API_URL = 'https://api.minimax.io/v1/text/chatcompletion_v2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// In-memory rate limit store: { userId -> [timestamp, ...] }
const rateLimitStore = new Map<string, number[]>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const limit = 10;

  const timestamps = (rateLimitStore.get(userId) ?? []).filter(
    (t) => now - t < windowMs
  );

  if (timestamps.length >= limit) return false;

  timestamps.push(now);
  rateLimitStore.set(userId, timestamps);
  return true;
}

const PROMPTS: Record<string, string> = {
  improve: '아래 글을 자연스럽고 읽기 좋게 교정해줘. 내용은 바꾸지 말고 표현과 문법만 개선해줘. 교정된 텍스트만 출력해.',
  summarize: '아래 글을 핵심만 담아 3문장 이내로 요약해줘. 요약된 텍스트만 출력해.',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // JWT 검증
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Rate limit
  if (!checkRateLimit(user.id)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded. 분당 10회만 가능합니다.' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Request body
  const { text, mode } = await req.json() as { text: string; mode: string };

  if (!text || !mode || !PROMPTS[mode]) {
    return new Response(JSON.stringify({ error: 'Invalid request: text and mode(improve|summarize) required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const minimaxKey = Deno.env.get('MINIMAX_API_KEY');
  if (!minimaxKey) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Minimax API 호출
  const mmRes = await fetch(MINIMAX_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${minimaxKey}`,
    },
    body: JSON.stringify({
      model: 'MiniMax-M2.1',
      messages: [
        { role: 'system', content: PROMPTS[mode] },
        { role: 'user', content: text },
      ],
    }),
  });

  if (!mmRes.ok) {
    const errText = await mmRes.text();
    return new Response(JSON.stringify({ error: `Minimax API error: ${errText}` }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const mmData = await mmRes.json();
  const result = mmData?.choices?.[0]?.message?.content ?? '';

  return new Response(JSON.stringify({ result }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
