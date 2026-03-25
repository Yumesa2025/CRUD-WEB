import { supabase } from '@/lib/supabase';
import type { Post } from '@/types/post.schema';

const BOOKMARK_POST_SELECT =
  'post_id, posts(id, user_id, title, content, thumbnail_url, thumbnail_path, created_at, updated_at, profiles!posts_user_id_profiles_fkey(username, avatar_url))';

export async function getBookmarkStatus(
  postId: string,
  userId: string | null,
): Promise<{ isBookmarked: boolean }> {
  if (!userId) return { isBookmarked: false };

  const { data, error } = await supabase
    .from('bookmarks')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return { isBookmarked: !!data };
}

export async function getBookmarkedPosts(userId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from('bookmarks')
    .select(BOOKMARK_POST_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => row.posts).filter(Boolean) as Post[];
}

export async function addBookmark(postId: string, userId: string): Promise<void> {
  const { error } = await supabase.from('bookmarks').insert({ post_id: postId, user_id: userId });
  if (error) throw error;
}

export async function removeBookmark(postId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId);
  if (error) throw error;
}
