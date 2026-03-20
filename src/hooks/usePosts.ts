import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  updatePost,
} from '@/services/posts.service';
import type { PostFormValues } from '@/types/post.schema';

export function usePosts() {
  return useQuery({ queryKey: ['posts'], queryFn: getPosts });
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
    mutationFn: ({ title, content }: PostFormValues) =>
      createPost(title, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title, content }: PostFormValues & { id: string }) =>
      updatePost(id, title, content),
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
