import { supabase } from '@/lib/supabase';
import type { Post } from '@/types/post.schema';

export async function getPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*, profiles(username, avatar_url)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Post[];
}

export async function getPost(id: string): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .select('*, profiles(username, avatar_url)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Post;
}

export async function createPost(title: string, content: string): Promise<Post> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('로그인이 필요합니다');

  const { data, error } = await supabase
    .from('posts')
    .insert({ title, content, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return { ...data, profiles: null };
}

export async function updatePost(
  id: string,
  title: string,
  content: string,
): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .update({ title, content })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return { ...data, profiles: null };
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw error;
}
