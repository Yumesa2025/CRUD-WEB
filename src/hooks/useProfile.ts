import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  getMyPosts,
} from '@/services/profile.service';

export const profileKeys = {
  profile: (userId: string) => ['profile', userId] as const,
  myPosts: (userId: string) => ['profile', userId, 'posts'] as const,
};

export function useProfile(userId: string) {
  return useQuery({
    queryKey: profileKeys.profile(userId),
    queryFn: () => getProfile(userId),
    enabled: !!userId,
  });
}

export function useMyPosts(userId: string) {
  return useQuery({
    queryKey: profileKeys.myPosts(userId),
    queryFn: () => getMyPosts(userId),
    enabled: !!userId,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      username,
      avatarUrl,
    }: {
      userId: string;
      username: string;
      avatarUrl: string | null;
    }) => updateProfile(userId, username, avatarUrl),
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.profile(data.id), data);
    },
  });
}

export function useUploadAvatar() {
  return useMutation({
    mutationFn: ({ userId, file }: { userId: string; file: File }) =>
      uploadAvatar(userId, file),
  });
}
