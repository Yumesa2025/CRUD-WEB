import { supabase } from '@/lib/supabase';
import type { Post } from '@/types/post.schema';

const POSTS_PER_PAGE = 10;

export interface PostsPage {
  data: Post[];
  nextPage: number | null;
}

const BASE_POST_SELECT =
  'id, user_id, title, content, thumbnail_url, thumbnail_path, created_at, updated_at, ' +
  'profiles!posts_user_id_profiles_fkey(username, avatar_url)';

const POST_SELECT_WITH_STATS =
  `${BASE_POST_SELECT}, ` +
  'comment_count:comments!comments_post_id_fkey(count), ' +
  'like_count:likes!likes_post_id_fkey(count)';

// PostgREST는 count 집계를 [{ count: N }] 형태로 반환 → Post 타입으로 변환
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toPost(raw: any): Post {
  const { comment_count, like_count, ...rest } = raw;
  return {
    ...rest,
    comment_count: (comment_count as Array<{ count: number }>)?.[0]?.count ?? 0,
    like_count: (like_count as Array<{ count: number }>)?.[0]?.count ?? 0,
  } as Post;
}

async function runPostQuery(
  runQuery: (select: string) => Promise<{ data: any; error: any }>,
) {
  const withStats = await runQuery(POST_SELECT_WITH_STATS);
  if (!withStats.error) return withStats;

  console.warn(
    'Post stats query failed, falling back to base post query:',
    withStats.error,
  );

  return runQuery(BASE_POST_SELECT);
}

export async function getPosts(): Promise<Post[]> {
  const { data, error } = await runPostQuery((select) =>
    supabase
      .from('posts')
      .select(select)
      .order('created_at', { ascending: false }),
  );

  if (error) throw error;
  return (data ?? []).map(toPost);
}

export async function getPostsPage(page: number, limit = POSTS_PER_PAGE): Promise<PostsPage> {
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error } = await runPostQuery((select) =>
    supabase
      .from('posts')
      .select(select)
      .order('created_at', { ascending: false })
      .range(from, to),
  );

  if (error) throw error;
  const posts = (data ?? []).map(toPost);
  return { data: posts, nextPage: posts.length === limit ? page + 1 : null };
}

export async function searchPosts(
  query: string,
  page: number,
  limit = POSTS_PER_PAGE,
): Promise<PostsPage> {
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error } = await runPostQuery((select) =>
    supabase
      .from('posts')
      .select(select)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .range(from, to),
  );

  if (error) throw error;
  const posts = (data ?? []).map(toPost);
  return { data: posts, nextPage: posts.length === limit ? page + 1 : null };
}

export async function getPost(id: string): Promise<Post> {
  const { data, error } = await runPostQuery((select) =>
    supabase
      .from('posts')
      .select(select)
      .eq('id', id)
      .single(),
  );

  if (error) throw error;
  return toPost(data);
}

export async function createPost(
  title: string,
  content: string,
  thumbnail_url?: string | null,
  thumbnail_path?: string | null,
): Promise<Post> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('로그인이 필요합니다');

  const { data, error } = await supabase
    .from('posts')
    .insert({
      title,
      content,
      user_id: user.id,
      thumbnail_url: thumbnail_url ?? null,
      thumbnail_path: thumbnail_path ?? null,
    })
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
  thumbnail_path?: string | null,
  old_thumbnail_path?: string | null,
): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .update({
      title,
      content,
      thumbnail_url: thumbnail_url ?? null,
      thumbnail_path: thumbnail_path ?? null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // 썸네일이 교체되거나 제거된 경우 기존 파일 삭제
  if (old_thumbnail_path && old_thumbnail_path !== thumbnail_path) {
    await supabase.storage.from('post-images').remove([old_thumbnail_path]);
  }

  return { ...data, profiles: null };
}

export async function deletePost(id: string, thumbnail_path?: string | null): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw error;

  if (thumbnail_path) {
    await supabase.storage.from('post-images').remove([thumbnail_path]);
  }
}

export interface UploadResult {
  url: string;
  path: string;
}

export async function uploadPostImage(file: File): Promise<UploadResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다');

  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from('post-images').upload(path, file);
  if (error) throw error;

  const { data } = supabase.storage.from('post-images').getPublicUrl(path);
  return { url: data.publicUrl, path };
}
