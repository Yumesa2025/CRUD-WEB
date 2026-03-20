import { useState } from 'react';
import { Sparkles, Loader2, X, PenLine, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { css } from 'styled-system/css';
import { useAiAssist } from '@/hooks/useAiAssist';

interface AiAssistButtonProps {
  getText: () => string;
  onApply: (text: string) => void;
}

export function AiAssistButton({ getText, onApply }: AiAssistButtonProps) {
  const { trigger } = useAiAssist();

  // 교정
  const [improving, setImproving] = useState(false);
  const [improveResult, setImproveResult] = useState<string | null>(null);

  // 글쓰기
  const [writeOpen, setWriteOpen] = useState(false);
  const [writeInput, setWriteInput] = useState('');
  const [writing, setWriting] = useState(false);

  const isPending = improving || writing;

  const handleImprove = async () => {
    const current = getText();
    if (!current.trim()) {
      alert('본문을 먼저 입력해주세요.');
      return;
    }
    setImproveResult(null);
    setImproving(true);
    try {
      const result = await trigger(current, 'improve');
      if (result) setImproveResult(result);
    } finally {
      setImproving(false);
    }
  };

  const handleWrite = async () => {
    if (!writeInput.trim()) return;
    setWriting(true);
    try {
      const result = await trigger(writeInput, 'write');
      if (result) {
        onApply(result);
        setWriteOpen(false);
        setWriteInput('');
      }
    } finally {
      setWriting(false);
    }
  };

  return (
    <div className={css({ mt: '2' })}>
      {/* 버튼 행 */}
      <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
        <Sparkles size={14} color="var(--colors-brand-500)" />
        <span className={css({ fontSize: 'xs', color: 'gray.500', mr: '1' })}>AI 보조</span>

        {/* AI 교정 */}
        <button
          type="button"
          disabled={isPending}
          onClick={() => void handleImprove()}
          className={css({
            display: 'inline-flex', alignItems: 'center', gap: '1.5',
            px: '3', py: '1.5', fontSize: 'xs', fontWeight: 'medium',
            borderRadius: 'md', border: '1px solid', cursor: 'pointer', transition: 'all 0.15s',
            borderColor: improving ? 'brand.500' : 'gray.300',
            color: improving ? 'brand.700' : 'gray.700',
            bg: improving ? 'brand.50' : 'white',
            _hover: { bg: 'gray.50', borderColor: 'gray.400' },
            _disabled: { opacity: '0.5', cursor: 'not-allowed' },
          })}
        >
          {improving
            ? <Loader2 size={12} className={css({ animation: 'spin 1s linear infinite' })} />
            : <Wand2 size={12} />
          }
          AI 교정
        </button>

        {/* AI 글쓰기 */}
        <button
          type="button"
          disabled={isPending}
          onClick={() => setWriteOpen((v) => !v)}
          className={css({
            display: 'inline-flex', alignItems: 'center', gap: '1.5',
            px: '3', py: '1.5', fontSize: 'xs', fontWeight: 'medium',
            borderRadius: 'md', border: '1px solid', cursor: 'pointer', transition: 'all 0.15s',
            borderColor: writeOpen ? 'brand.500' : 'gray.300',
            color: writeOpen ? 'brand.700' : 'gray.700',
            bg: writeOpen ? 'brand.50' : 'white',
            _hover: { bg: 'gray.50', borderColor: 'gray.400' },
            _disabled: { opacity: '0.5', cursor: 'not-allowed' },
          })}
        >
          <PenLine size={12} />
          AI 글쓰기
        </button>
      </div>

      {/* AI 글쓰기 입력창 */}
      <AnimatePresence>
        {writeOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className={css({
              mt: '3', p: '3',
              bg: 'brand.50', border: '1px solid', borderColor: 'brand.200',
              borderRadius: 'md',
            })}
          >
            <p className={css({ fontSize: 'xs', fontWeight: 'semibold', color: 'brand.700', mb: '2' })}>
              어떤 내용의 글을 작성할까요?
            </p>
            <textarea
              value={writeInput}
              onChange={(e) => setWriteInput(e.target.value)}
              placeholder="예: 봄날 산책에 대한 감성적인 글, 오늘 있었던 재미있는 일..."
              rows={3}
              className={css({
                w: 'full', px: '3', py: '2',
                border: '1px solid', borderColor: 'brand.300',
                borderRadius: 'md', fontSize: 'sm', outline: 'none',
                bg: 'white', resize: 'vertical',
                _focus: { borderColor: 'brand.500', boxShadow: '0 0 0 3px token(colors.brand.100)' },
              })}
            />
            <div className={css({ display: 'flex', justifyContent: 'flex-end', gap: '2', mt: '2' })}>
              <button
                type="button"
                onClick={() => { setWriteOpen(false); setWriteInput(''); }}
                className={css({
                  px: '3', py: '1.5', fontSize: 'xs', borderRadius: 'md',
                  border: '1px solid', borderColor: 'gray.300', bg: 'white',
                  color: 'gray.600', cursor: 'pointer', _hover: { bg: 'gray.50' },
                })}
              >
                취소
              </button>
              <button
                type="button"
                disabled={writing || !writeInput.trim()}
                onClick={() => void handleWrite()}
                className={css({
                  display: 'inline-flex', alignItems: 'center', gap: '1.5',
                  px: '3', py: '1.5', fontSize: 'xs', fontWeight: 'medium',
                  borderRadius: 'md', border: 'none', cursor: 'pointer',
                  bg: 'brand.500', color: 'white',
                  _hover: { bg: 'brand.600' },
                  _disabled: { bg: 'brand.300', cursor: 'not-allowed' },
                })}
              >
                {writing && <Loader2 size={12} className={css({ animation: 'spin 1s linear infinite' })} />}
                {writing ? '작성 중...' : '글 작성'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI 교정 결과 박스 */}
      <AnimatePresence>
        {improveResult && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className={css({
              mt: '3', p: '3',
              bg: 'blue.50', border: '1px solid', borderColor: 'blue.200',
              borderRadius: 'md',
            })}
          >
            <div className={css({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '2' })}>
              <span className={css({ fontSize: 'xs', fontWeight: 'semibold', color: 'blue.600' })}>
                AI 교정 결과 (참고용)
              </span>
              <button
                type="button"
                onClick={() => setImproveResult(null)}
                className={css({ color: 'gray.400', cursor: 'pointer', border: 'none', bg: 'transparent', p: '0', _hover: { color: 'gray.600' } })}
              >
                <X size={14} />
              </button>
            </div>
            <p className={css({ fontSize: 'sm', color: 'gray.700', lineHeight: '1.6', whiteSpace: 'pre-wrap' })}>
              {improveResult}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
