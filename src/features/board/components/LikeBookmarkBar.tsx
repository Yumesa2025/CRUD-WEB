import { Heart, Bookmark } from 'lucide-react';
import { useSetAtom } from 'jotai';
import { css } from 'styled-system/css';
import { useAuth } from '@/hooks/useAuth';
import { useLikeStatus, useToggleLike } from '@/hooks/useLikes';
import { useBookmarkStatus, useToggleBookmark } from '@/hooks/useBookmarks';
import { addToastAtom } from '@/stores/uiStore';

interface Props {
  postId: string;
}

export function LikeBookmarkBar({ postId }: Props) {
  const { user } = useAuth();
  const addToast = useSetAtom(addToastAtom);

  const { data: likeData } = useLikeStatus(postId, user?.id ?? null);
  const { data: bookmarkData } = useBookmarkStatus(postId, user?.id ?? null);
  const { mutate: toggleLike, isPending: isLiking } = useToggleLike(postId);
  const { mutate: toggleBookmark, isPending: isBookmarking } = useToggleBookmark(postId);

  function requireAuth(action: () => void) {
    if (!user) {
      addToast({ variant: 'error', title: '로그인이 필요합니다' });
      return;
    }
    action();
  }

  const isLiked = likeData?.isLiked ?? false;
  const likeCount = likeData?.count ?? 0;
  const isBookmarked = bookmarkData?.isBookmarked ?? false;

  return (
    <div
      className={css({
        display: 'flex',
        alignItems: 'center',
        gap: '3',
        py: '4',
        borderTop: '1px solid',
        borderBottom: '1px solid',
        borderColor: 'gray.100',
        my: '6',
      })}
    >
      {/* 좋아요 */}
      <button
        onClick={() =>
          requireAuth(() =>
            toggleLike({ userId: user!.id, isLiked })
          )
        }
        disabled={isLiking}
        className={css({
          display: 'flex',
          alignItems: 'center',
          gap: '1.5',
          px: '4',
          py: '2',
          borderRadius: 'full',
          border: '1px solid',
          borderColor: isLiked ? 'red.300' : 'gray.200',
          bg: isLiked ? 'red.50' : 'white',
          color: isLiked ? 'red.500' : 'gray.500',
          fontSize: 'sm',
          fontWeight: 'medium',
          cursor: 'pointer',
          transition: 'all 0.15s',
          _hover: { borderColor: 'red.300', bg: 'red.50', color: 'red.500' },
          _disabled: { opacity: '0.6', cursor: 'not-allowed' },
        })}
      >
        <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
        <span>{likeCount}</span>
      </button>

      {/* 북마크 */}
      <button
        onClick={() =>
          requireAuth(() =>
            toggleBookmark({ userId: user!.id, isBookmarked })
          )
        }
        disabled={isBookmarking}
        className={css({
          display: 'flex',
          alignItems: 'center',
          gap: '1.5',
          px: '4',
          py: '2',
          borderRadius: 'full',
          border: '1px solid',
          borderColor: isBookmarked ? 'brand.300' : 'gray.200',
          bg: isBookmarked ? 'brand.50' : 'white',
          color: isBookmarked ? 'brand.600' : 'gray.500',
          fontSize: 'sm',
          fontWeight: 'medium',
          cursor: 'pointer',
          transition: 'all 0.15s',
          _hover: { borderColor: 'brand.300', bg: 'brand.50', color: 'brand.600' },
          _disabled: { opacity: '0.6', cursor: 'not-allowed' },
        })}
      >
        <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
        <span>{isBookmarked ? '저장됨' : '저장'}</span>
      </button>
    </div>
  );
}
