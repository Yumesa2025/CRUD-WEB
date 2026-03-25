import { createFileRoute } from '@tanstack/react-router';
import { Bookmark } from 'lucide-react';
import { css } from 'styled-system/css';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useBookmarkedPosts } from '@/hooks/useBookmarks';
import { PostList } from '@/features/board/components/PostList';

export const Route = createFileRoute('/bookmarks/')({
  component: BookmarksPage,
});

function BookmarksContent() {
  const { user } = useAuth();
  const { data: posts, isLoading } = useBookmarkedPosts(user?.id ?? null);

  return (
    <div className={css({ maxW: '4xl', mx: 'auto', py: '8', px: '4' })}>
      <div className={css({ display: 'flex', alignItems: 'center', gap: '2', mb: '6' })}>
        <Bookmark size={22} className={css({ color: 'brand.500' })} />
        <h1 className={css({ fontSize: 'xl', fontWeight: 'bold', color: 'gray.900' })}>
          저장한 글
        </h1>
      </div>

      {isLoading ? (
        <div className={css({ py: '20', textAlign: 'center', color: 'gray.400', fontSize: 'sm' })}>
          불러오는 중...
        </div>
      ) : (
        <PostList posts={posts ?? []} />
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
