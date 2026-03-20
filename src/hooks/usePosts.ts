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

export function useInfinitePosts() {
  return useInfiniteQuery({
    queryKey: ['posts', 'infinite'],
    queryFn: ({ pageParam }) => getPostsPage(pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
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
    }: PostFormValues & { thumbnail_url?: string | null }) =>
      createPost(title, content, thumbnail_url),
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
    }: PostFormValues & { id: string; thumbnail_url?: string | null }) =>
      updatePost(id, title, content, thumbnail_url),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['posts', id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
