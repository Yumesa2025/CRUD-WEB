import { createFileRoute } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';
import { Bookmark } from 'lucide-react';
import { css } from 'styled-system/css';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useBookmarkedPosts } from '@/hooks/useBookmarks';
import { PostList } from '@/features/board/components/PostList';
import { searchQueryAtom } from '@/stores/uiStore';

export const Route = createFileRoute('/bookmarks/')({
  component: BookmarksPage,
});

function BookmarksContent() {
  const { user } = useAuth();
  const { data: posts, isLoading } = useBookmarkedPosts(user?.id ?? null);
  const query = useAtomValue(searchQueryAtom);
  const normalizedQuery = query.trim().toLowerCase();

  const filteredPosts = normalizedQuery
    ? (posts ?? []).filter(
        (p) =>
          p.title.toLowerCase().includes(normalizedQuery) ||
          p.content.toLowerCase().includes(normalizedQuery),
      )
    : (posts ?? []);

  return (
    <div className={css({ maxW: '4xl', mx: 'auto', py: '8', px: '4' })}>
      <div className={css({ display: 'flex', alignItems: 'center', gap: '2', mb: '6' })}>
        <Bookmark size={22} className={css({ color: 'brand.500' })} />
        <h1 className={css({ fontSize: 'xl', fontWeight: 'bold', color: 'gray.900' })}>
          {normalizedQuery ? `"${normalizedQuery}" 검색 결과` : '저장한 글'}
        </h1>
      </div>

      {isLoading ? (
        <div className={css({ py: '20', textAlign: 'center', color: 'gray.400', fontSize: 'sm' })}>
          불러오는 중...
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className={css({ py: '20', textAlign: 'center', color: 'gray.400', fontSize: 'sm' })}>
          {normalizedQuery ? '검색 결과가 없습니다.' : '저장한 글이 없습니다.'}
        </div>
      ) : (
        <PostList posts={filteredPosts} />
      )}
    </div>
  );
}

function BookmarksPage() {
  return (
    <ProtectedRoute>
      <BookmarksContent />
    </ProtectedRoute>
  );
}
