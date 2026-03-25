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

export function usePosts() {
  return useQuery({ queryKey: ['posts'], queryFn: getPosts });
}

export function useInfinitePosts(userId?: string | null) {
  return useInfiniteQuery({
    queryKey: ['posts', 'infinite', userId ?? null],
    queryFn: ({ pageParam }) => getPostsPage(pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 0,
    placeholderData: (prev) => prev,
  });
}

export function useSearchPosts(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  return useInfiniteQuery({
    queryKey: ['posts', 'search', debouncedQuery],
    queryFn: ({ pageParam }) => searchPosts(debouncedQuery, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!debouncedQuery,
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: ['posts', id],
    queryFn: () => getPost(id),
    enabled: !!id,
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
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['posts', id] });
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
