import { supabase } from '@/lib/supabase';

export interface CommentRow {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  profiles: { username: string; avatar_url: string | null } | null;
}

const COMMENT_SELECT =
  'id, post_id, user_id, parent_id, content, created_at, updated_at, ' +
  'profiles!comments_user_id_fkey(username, avatar_url)';

export async function getComments(postId: string): Promise<CommentRow[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(COMMENT_SELECT)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as CommentRow[];
}

export async function createComment(
  postId: string,
  userId: string,
  content: string,
  parentId?: string | null,
): Promise<void> {
  const { error } = await supabase.from('comments').insert({
    post_id: postId,
    user_id: userId,
    content,
    parent_id: parentId ?? null,
  });
  if (error) throw error;
}

export async function updateComment(id: string, content: string): Promise<void> {
  const { error } = await supabase.from('comments').update({ content }).eq('id', id);
  if (error) throw error;
}

export async function deleteComment(id: string): Promise<void> {
  const { error } = await supabase.from('comments').delete().eq('id', id);
  if (error) throw error;
}
