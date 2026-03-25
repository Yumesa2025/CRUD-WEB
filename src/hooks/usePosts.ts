import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  getPostsPage,
  searchPosts,
  updatePost,
} from '@/services/posts.service';
import type { PostFormValues } from '@/types/post.schema';

function getAuthScope(userId?: string | null) {
  return userId ?? 'anon';
}

export function usePosts(userId?: string | null) {
  return useQuery({
    queryKey: ['posts', 'list', getAuthScope(userId)],
    queryFn: getPosts,
  });
}

export function useInfinitePosts(userId?: string | null) {
  return useInfiniteQuery({
    queryKey: ['posts', 'infinite', getAuthScope(userId)],
    queryFn: ({ pageParam }) => getPostsPage(pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 0,
    placeholderData: (prev) => prev,
  });
}

export function useSearchPosts(query: string, userId?: string | null) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  return useInfiniteQuery({
    queryKey: ['posts', 'search', getAuthScope(userId), debouncedQuery],
    queryFn: ({ pageParam }) => searchPosts(debouncedQuery, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: debouncedQuery.length > 0,
    staleTime: 0,
    placeholderData: (prev) => prev,
  });
}

export function usePost(id: string, userId?: string | null) {
  return useQuery({
    queryKey: ['posts', 'detail', id, getAuthScope(userId)],
    queryFn: () => getPost(id),
    enabled: !!id,
    staleTime: 0,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      title,
      content,
      thumbnail_url,
      thumbnail_path,
    }: PostFormValues & { thumbnail_url?: string | null; thumbnail_path?: string | null }) =>
      createPost(title, content, thumbnail_url, thumbnail_path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      title,
      content,
      thumbnail_url,
      thumbnail_path,
      old_thumbnail_path,
    }: PostFormValues & {
      id: string;
      thumbnail_url?: string | null;
      thumbnail_path?: string | null;
      old_thumbnail_path?: string | null;
    }) => updatePost(id, title, content, thumbnail_url, thumbnail_path, old_thumbnail_path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, thumbnail_path }: { id: string; thumbnail_path?: string | null }) =>
      deletePost(id, thumbnail_path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
