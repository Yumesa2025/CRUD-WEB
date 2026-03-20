import { supabase } from '@/lib/supabase';
import type { Post } from '@/types/post.schema';

const POSTS_PER_PAGE = 10;

export interface PostsPage {
  data: Post[];
  nextPage: number | null;
}

const POST_SELECT = 'id, user_id, title, content, thumbnail_url, created_at, updated_at, profiles(username, avatar_url)';

export async function getPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Post[];
}

export async function getPostsPage(page: number, limit = POSTS_PER_PAGE): Promise<PostsPage> {
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  const posts = (data ?? []) as Post[];
  return { data: posts, nextPage: posts.length === limit ? page + 1 : null };
}

export async function searchPosts(
  query: string,
  page: number,
  limit = POSTS_PER_PAGE,
): Promise<PostsPage> {
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .textSearch('fts', query, { type: 'websearch', config: 'simple' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  const posts = (data ?? []) as Post[];
  return { data: posts, nextPage: posts.length === limit ? page + 1 : null };
}

export async function getPost(id: string): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Post;
}

export async function createPost(
  title: string,
  content: string,
  thumbnail_url?: string | null,
): Promise<Post> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('로그인이 필요합니다');

  const { data, error } = await supabase
    .from('posts')
    .insert({ title, content, user_id: user.id, thumbnail_url: thumbnail_url ?? null })
    .select()
    .single();

  if (error) throw error;
  return { ...data, profiles: null };
}

export async function updatePost(
  id: string,
  title: string,
  content: string,
  thumbnail_url?: string | null,
): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .update({ title, content, thumbnail_url: thumbnail_url ?? null })
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

export async function uploadPostImage(file: File): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다');

  const ext = file.name.split('.').pop();
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from('post-images').upload(path, file);
  if (error) throw error;

  const { data } = supabase.storage.from('post-images').getPublicUrl(path);
  return data.publicUrl;
}
