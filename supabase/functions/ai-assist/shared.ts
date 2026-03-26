export type AiMode = 'improve' | 'summarize' | 'write';

export const ALLOWED_MODES: AiMode[] = ['improve', 'summarize', 'write'];

export const MAX_TEXT_LENGTH = 2000;
export const MAX_PROMPT_LENGTH = 500;
export const MAX_BOARD_STYLE_LENGTH = 50;
