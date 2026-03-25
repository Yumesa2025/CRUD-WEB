import { supabase } from '@/lib/supabase';

export interface LikeStatus {
  count: number;
  isLiked: boolean;
}

export async function getLikeStatus(postId: string, userId: string | null): Promise<LikeStatus> {
  const [countRes, userRes] = await Promise.all([
    supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId),
    userId
      ? supabase
          .from('likes')
          .select('post_id')
          .eq('post_id', postId)
          .eq('user_id', userId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (countRes.error) throw countRes.error;
  return { count: countRes.count ?? 0, isLiked: !!userRes.data };
}

export async function addLike(postId: string, userId: string): Promise<void> {
  const { error } = await supabase.from('likes').insert({ post_id: postId, user_id: userId });
  if (error) throw error;
}

export async function removeLike(postId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId);
  if (error) throw error;
}
