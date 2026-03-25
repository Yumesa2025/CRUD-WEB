import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addBookmark,
  getBookmarkStatus,
  getBookmarkedPosts,
  removeBookmark,
} from '@/services/bookmarks.service';

export function useBookmarkStatus(postId: string, userId: string | null) {
  return useQuery({
    queryKey: ['bookmarks', postId, userId],
    queryFn: () => getBookmarkStatus(postId, userId),
    enabled: !!postId,
  });
}

export function useBookmarkedPosts(userId: string | null) {
  return useQuery({
    queryKey: ['bookmarks', 'my', userId],
    queryFn: () => getBookmarkedPosts(userId!),
    enabled: !!userId,
  });
}

export function useToggleBookmark(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, isBookmarked }: { userId: string; isBookmarked: boolean }) =>
      isBookmarked ? removeBookmark(postId, userId) : addBookmark(postId, userId),

    // 낙관적 업데이트
    onMutate: async ({ userId, isBookmarked }) => {
      const queryKey = ['bookmarks', postId, userId] as const;
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, { isBookmarked: !isBookmarked });
      return { previous, userId };
    },
    onError: (_, __, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['bookmarks', postId, context.userId], context.previous);
      }
    },
    onSettled: (_, __, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks', postId, userId] });
      queryClient.invalidateQueries({ queryKey: ['bookmarks', 'my'] });
    },
  });
}
