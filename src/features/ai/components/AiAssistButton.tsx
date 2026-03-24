import { Fragment, useState } from 'react';
import { Sparkles, Loader2, X, PenLine, Wand2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { css } from 'styled-system/css';
import { useAiAssist } from '@/hooks/useAiAssist';
import { AI_PROMPT_MAX_LENGTH, AI_TEXT_MAX_LENGTH, AI_BOARD_STYLE_MAX_LENGTH, BOARD_STYLES } from '@/services/ai.service';
import { wordDiff } from '@/utils/diff';

interface AiAssistButtonProps {
  getText: () => string;
  onApply: (text: string) => void;
}

export function AiAssistButton({ getText, onApply }: AiAssistButtonProps) {
  const { trigger } = useAiAssist();

  // 게시판 성격
  const [selectedStyle, setSelectedStyle] = useState<string>(BOARD_STYLES[0]);
  const [isCustomStyle, setIsCustomStyle] = useState(false);
  const [customStyle, setCustomStyle] = useState('');
  const effectiveStyle = isCustomStyle ? (customStyle.trim() || '일반') : selectedStyle;

  // 교정
  const [improving, setImproving] = useState(false);
  const [improveResult, setImproveResult] = useState<{ original: string; revised: string } | null>(null);

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
    if (current.length > AI_TEXT_MAX_LENGTH) {
      alert(`본문은 ${AI_TEXT_MAX_LENGTH}자 이하여야 합니다.`);
      return;
    }
    setImproveResult(null);
    setImproving(true);
    try {
      const result = await trigger(current, 'improve', effectiveStyle);
      if (result) setImproveResult({ original: current, revised: result });
    } finally {
      setImproving(false);
    }
  };

  const handleWrite = async () => {
    if (!writeInput.trim()) return;
    setWriting(true);
    try {
      const result = await trigger(writeInput, 'write', effectiveStyle);
      if (result) {
        onApply(result);
        setWriteOpen(false);
        setWriteInput('');
      }
    } finally {
      setWriting(false);
    }
  };

  const handleApplyImprove = () => {
    if (!improveResult) return;
    onApply(improveResult.revised);
    setImproveResult(null);
  };

  const diffTokens = improveResult ? wordDiff(improveResult.original, improveResult.revised) : [];

  return (
    <div className={css({ mt: '2' })}>
      {/* 게시판 성격 선택 */}
      <div className={css({ mb: '2' })}>
        <div className={css({ display: 'flex', alignItems: 'center', gap: '1.5', flexWrap: 'wrap' })}>
          <span className={css({ fontSize: 'xs', color: 'gray.400', mr: '0.5' })}>성격</span>
          {BOARD_STYLES.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => { setSelectedStyle(style); setIsCustomStyle(false); }}
              className={css({
                px: '2.5', py: '1', fontSize: 'xs', borderRadius: 'full',
                border: '1px solid', cursor: 'pointer', transition: 'all 0.15s',
                borderColor: !isCustomStyle && selectedStyle === style ? 'brand.400' : 'gray.200',
                bg: !isCustomStyle && selectedStyle === style ? 'brand.50' : 'white',
                color: !isCustomStyle && selectedStyle === style ? 'brand.700' : 'gray.500',
                _hover: { borderColor: 'brand.300', color: 'brand.600' },
              })}
            >
              {style}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setIsCustomStyle(true)}
            className={css({
              px: '2.5', py: '1', fontSize: 'xs', borderRadius: 'full',
              border: '1px solid', cursor: 'pointer', transition: 'all 0.15s',
              borderColor: isCustomStyle ? 'brand.400' : 'gray.200',
              bg: isCustomStyle ? 'brand.50' : 'white',
              color: isCustomStyle ? 'brand.700' : 'gray.500',
              _hover: { borderColor: 'brand.300', color: 'brand.600' },
            })}
          >
            직접입력
          </button>
          {isCustomStyle && (
            <input
              autoFocus
              value={customStyle}
              onChange={(e) => setCustomStyle(e.target.value.slice(0, AI_BOARD_STYLE_MAX_LENGTH))}
              placeholder="예: 개발자 커뮤니티"
              className={css({
                px: '2', py: '1', fontSize: 'xs', borderRadius: 'md',
                border: '1px solid', borderColor: 'brand.300', outline: 'none',
                w: '32', bg: 'white',
                _focus: { borderColor: 'brand.500' },
              })}
            />
          )}
        </div>
      </div>

      {/* AI 보조 버튼 행 */}
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
              onChange={(e) => setWriteInput(e.target.value.slice(0, AI_PROMPT_MAX_LENGTH))}
              placeholder="예: 봄날 산책에 대한 감성적인 글, 오늘 있었던 재미있는 일..."
              rows={3}
              maxLength={AI_PROMPT_MAX_LENGTH}
              className={css({
                w: 'full', px: '3', py: '2',
                border: '1px solid', borderColor: 'brand.300',
                borderRadius: 'md', fontSize: 'sm', outline: 'none',
                bg: 'white', resize: 'vertical',
                _focus: { borderColor: 'brand.500', boxShadow: '0 0 0 3px token(colors.brand.100)' },
              })}
            />
            <div className={css({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: '2' })}>
              <span className={css({ fontSize: 'xs', color: 'gray.400' })}>
                {writeInput.length} / {AI_PROMPT_MAX_LENGTH}
              </span>
              <div className={css({ display: 'flex', gap: '2' })}>
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
              bg: 'gray.50', border: '1px solid', borderColor: 'gray.200',
              borderRadius: 'md',
            })}
          >
            <div className={css({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '2' })}>
              <div className={css({ display: 'flex', alignItems: 'center', gap: '1.5' })}>
                <span className={css({ fontSize: 'xs', fontWeight: 'semibold', color: 'gray.700' })}>
                  교정 결과
                </span>
                <span className={css({
                  fontSize: 'xs', color: 'yellow.700', bg: 'yellow.100',
                  px: '1.5', py: '0.5', borderRadius: 'sm',
                })}>
                  노란색 = 변경된 부분
                </span>
              </div>
              <button
                type="button"
                onClick={() => setImproveResult(null)}
                className={css({ color: 'gray.400', cursor: 'pointer', border: 'none', bg: 'transparent', p: '0', _hover: { color: 'gray.600' } })}
              >
                <X size={14} />
              </button>
            </div>

            {/* 하이라이트 diff 표시 */}
            <p className={css({ fontSize: 'sm', color: 'gray.700', lineHeight: '1.8', whiteSpace: 'pre-wrap', mb: '3' })}>
              {diffTokens.map((token, i) => (
                <Fragment key={i}>
                  {i > 0 && ' '}
                  {token.changed
                    ? (
                      <mark className={css({
                        bg: 'yellow.200', color: 'yellow.900',
                        borderRadius: 'sm', px: '0.5',
                      })}>
                        {token.text}
                      </mark>
                    )
                    : token.text
                  }
                </Fragment>
              ))}
            </p>

            <div className={css({ display: 'flex', justifyContent: 'flex-end' })}>
              <button
                type="button"
                onClick={handleApplyImprove}
                className={css({
                  display: 'inline-flex', alignItems: 'center', gap: '1.5',
                  px: '3', py: '1.5', fontSize: 'xs', fontWeight: 'medium',
                  borderRadius: 'md', border: 'none', cursor: 'pointer',
                  bg: 'brand.500', color: 'white',
                  _hover: { bg: 'brand.600' },
                })}
              >
                <Check size={12} />
                본문에 적용
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
