import { z } from 'zod';

export const postFormSchema = z.object({
  title: z
    .string()
    .min(5, '제목은 5자 이상이어야 합니다')
    .max(20, '제목은 20자 이하여야 합니다'),
  content: z
    .string()
    .min(10, '본문은 10자 이상이어야 합니다')
    .max(1000, '본문은 1000자 이하여야 합니다'),
});

export type PostFormValues = z.infer<typeof postFormSchema>;

export interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles: { username: string; avatar_url: string | null } | null;
}
