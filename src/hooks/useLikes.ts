import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addLike, getLikeStatus, removeLike } from '@/services/likes.service';
import type { LikeStatus } from '@/services/likes.service';

export function useLikeStatus(postId: string, userId: string | null) {
  return useQuery({
    queryKey: ['likes', postId, userId],
    queryFn: () => getLikeStatus(postId, userId),
    enabled: !!postId,
  });
}

export function useToggleLike(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, isLiked }: { userId: string; isLiked: boolean }) =>
      isLiked ? removeLike(postId, userId) : addLike(postId, userId),

    // 낙관적 업데이트: 서버 응답 전에 UI를 즉시 반영
    onMutate: async ({ userId, isLiked }) => {
      const queryKey = ['likes', postId, userId] as const;
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<LikeStatus>(queryKey);

      queryClient.setQueryData<LikeStatus>(queryKey, (old) => ({
        count: (old?.count ?? 0) + (isLiked ? -1 : 1),
        isLiked: !isLiked,
      }));

      return { previous, userId };
    },
    onError: (_, __, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['likes', postId, context.userId], context.previous);
      }
    },
    onSettled: (_, __, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['likes', postId, userId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
