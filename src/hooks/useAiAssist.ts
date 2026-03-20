import { useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { aiAssist, type AiMode } from '@/services/ai.service';
import { addToastAtom } from '@/stores/uiStore';

export function useAiAssist() {
  const addToast = useSetAtom(addToastAtom);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mutation = useMutation({
    mutationFn: ({ text, mode }: { text: string; mode: AiMode }) =>
      aiAssist(text, mode),
    onError: (error: Error) => {
      addToast({ variant: 'error', title: 'AI 오류', description: error.message });
    },
  });

  const trigger = (text: string, mode: AiMode): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        mutation.mutateAsync({ text, mode }).then(resolve).catch(reject);
      }, 300);
    });
  };

  return { trigger, isPending: mutation.isPending };
}
