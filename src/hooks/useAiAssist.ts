import { useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { aiAssist, type AiMode } from '@/services/ai.service';
import { addToastAtom } from '@/stores/uiStore';

export class AiAssistAbortError extends Error {
  constructor() {
    super('debounced');
    this.name = 'AbortError';
  }
}

export function useAiAssist() {
  const addToast = useSetAtom(addToastAtom);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRejectRef = useRef<((err: AiAssistAbortError) => void) | null>(null);

  const mutation = useMutation({
    mutationFn: ({ text, mode, boardStyle }: { text: string; mode: AiMode; boardStyle?: string }) =>
      aiAssist(text, mode, boardStyle),
    onError: (error: Error) => {
      addToast({ variant: 'error', title: 'AI 오류', description: error.message });
    },
  });

  const trigger = (text: string, mode: AiMode, boardStyle?: string): Promise<string> => {
    // 이전 대기 중인 Promise를 AbortError로 reject
    pendingRejectRef.current?.(new AiAssistAbortError());
    pendingRejectRef.current = null;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    return new Promise((resolve, reject) => {
      pendingRejectRef.current = reject;
      debounceTimer.current = setTimeout(() => {
        pendingRejectRef.current = null;
        mutation.mutateAsync({ text, mode, boardStyle }).then(resolve).catch(reject);
      }, 300);
    });
  };

  return { trigger, isPending: mutation.isPending };
}
