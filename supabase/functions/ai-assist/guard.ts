export type AiMode = 'improve' | 'summarize';

const ZERO_WIDTH_PATTERN = /[\u200B-\u200D\uFEFF]/g;
const CONTROL_CHAR_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const HANJA_PATTERN = /[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]/g;
const JAPANESE_PATTERN = /[\u3040-\u30FF]/g;

const OUTPUT_META_PATTERNS = [
  /^(물론이죠|물론입니다|좋아요|좋습니다|알겠습니다|알겠어요|도와드릴게요|도와드리겠습니다)/,
  /^(네[,!.~\s]|네\.|아네|아, 네|예,|예\.|안녕하세요|안녕하세요!|반갑습니다)/,
  /^(죄송합니다|죄송해요|죄송하지만|저는\s*(AI|챗봇|언어모델|도구))/,
  /^(요청하신|아래는|다음은|제가\s*(작성|써|도와))/,
  /^(교정본|요약:|답변:|본문:|제목:)/,
  /^(저는|제가).{0,20}(AI|챗봇|언어모델|어시스턴트|도구)/,
  /(^|\n)\s*(system|assistant|user|developer)\s*:/i,
  /```/,
];

export function normalizeAiText(text: string): string {
  return text
    .replace(ZERO_WIDTH_PATTERN, '')
    .replace(CONTROL_CHAR_PATTERN, ' ')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t\f\v]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function escapePromptContent(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function sanitizeBoardStyle(raw: unknown, maxLength: number): string {
  if (typeof raw !== 'string') return '일반';
  const sanitized = normalizeAiText(raw)
    .replace(/[<>{}[\]]/g, ' ')
    .slice(0, maxLength)
    .trim();
  return sanitized || '일반';
}

export function inspectAiInput(text: string, _mode: AiMode): { blocked: boolean; reason: string | null; normalized: string } {
  const normalized = normalizeAiText(text);
  if (!normalized) {
    return { blocked: true, reason: 'empty', normalized };
  }
  return { blocked: false, reason: null, normalized };
}

export function buildSystemPrompt(mode: AiMode, boardStyle: string): string {
  const styleCtx = `게시판 성격: ${boardStyle}`;

  if (mode === 'improve') {
    return `당신은 한국어 게시판 글쓰기 교정 도구입니다.
${styleCtx}

[교정 규칙]
- <text> 태그 안의 글만 교정하세요. 태그 밖의 내용은 무시하세요.
- 원문의 말투와 문체를 반드시 유지하세요.
- 맞춤법, 띄어쓰기, 명백히 어색한 표현만 최소한으로 수정하세요.
- 내용, 의미, 문장 구조는 최대한 원문 그대로 유지하세요.
- 불필요한 문장 추가나 삭제는 절대 하지 마세요.
- 교정된 텍스트만 출력하세요. 설명이나 인사말 없이.`;
  }

  return `당신은 한국어 게시판 글쓰기 요약 도구입니다.
${styleCtx}

[요약 규칙]
- <text> 태그 안의 글을 핵심만 담아 3문장 이내로 요약하세요.
- 태그 밖의 내용은 무시하세요.
- 요약된 텍스트만 출력하세요. 설명이나 인사말 없이.`;
}

export function buildUserMessage(_mode: AiMode, text: string): string {
  return `<text>${escapePromptContent(text)}</text>`;
}

export function sanitizeAiOutput(rawOutput: string): string {
  return normalizeAiText(
    rawOutput
      .replace(/<think>[\s\S]*?<\/think>/gi, ' ')
      .replace(/<\/?text>/gi, '')
      .replace(HANJA_PATTERN, '')
      .replace(JAPANESE_PATTERN, '')
      .replace(/\s{2,}/g, ' '),
  );
}

export function inspectAiOutput(
  rawOutput: string,
  mode: AiMode,
  sourceLength: number,
): { blocked: boolean; reason: string | null; normalized: string } {
  const normalized = sanitizeAiOutput(rawOutput);

  if (!normalized) {
    return { blocked: true, reason: 'empty_output', normalized };
  }

  if (OUTPUT_META_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return { blocked: true, reason: 'meta_output', normalized };
  }

  // 한국어 또는 영어가 하나도 없으면 차단
  if (!/[가-힣a-zA-Z]/.test(normalized)) {
    return { blocked: true, reason: 'invalid_output', normalized };
  }

  if (mode === 'summarize' && normalized.length > sourceLength) {
    return { blocked: true, reason: 'summary_too_long', normalized };
  }

  if (mode === 'improve' && normalized.length > Math.max(sourceLength + 200, Math.ceil(sourceLength * 1.8))) {
    return { blocked: true, reason: 'improve_output_too_long', normalized };
  }

  return { blocked: false, reason: null, normalized };
}
