import { AlertCircle } from 'lucide-react';
import { css } from 'styled-system/css';

interface PostListErrorProps {
  onRetry: () => void;
}

export function PostListError({ onRetry }: PostListErrorProps) {
  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4',
        py: '20',
      })}
    >
      <AlertCircle size={40} color="var(--colors-red-400)" />
      <p className={css({ fontSize: 'lg', fontWeight: 'medium', color: 'gray.600' })}>
        게시글을 불러오지 못했습니다
      </p>
      <button
        onClick={onRetry}
        className={css({
          px: '5',
          py: '2',
          bg: 'brand.500',
          color: 'white',
          borderRadius: 'md',
          border: 'none',
          cursor: 'pointer',
          fontSize: 'sm',
          fontWeight: 'medium',
          _hover: { bg: 'brand.600' },
        })}
      >
        다시 시도
      </button>
    </div>
  );
}
