import { createFileRoute, Link } from '@tanstack/react-router';
import { PenLine } from 'lucide-react';
import { css } from 'styled-system/css';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import { PostList } from '@/features/board/components/PostList';
import { PostListError } from '@/features/board/components/PostList.error';
import { PostListSkeleton } from '@/features/board/components/PostList.skeleton';

export const Route = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  const { data: posts, isLoading, isError, refetch } = usePosts();
  const { user } = useAuth();

  return (
    <div>
      {/* 헤더 */}
      <div className={css({ mb: '8' })}>
        <h1 className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'gray.900', mb: '1' })}>
          게시글
        </h1>
        <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
          {posts ? `${posts.length}개의 글이 있습니다` : '글을 불러오는 중...'}
        </p>
      </div>

      {isLoading && <PostListSkeleton />}
      {isError && <PostListError onRetry={() => void refetch()} />}
      {posts && <PostList posts={posts} />}

      {user && (
        <Link
          to="/posts/new"
          className={css({
            position: 'fixed',
            bottom: '8',
            right: '8',
            display: 'flex',
            alignItems: 'center',
            gap: '2',
            px: '5',
            py: '3',
            bg: 'brand.500',
            color: 'white',
            borderRadius: 'xl',
            textDecoration: 'none',
            fontWeight: 'medium',
            fontSize: 'sm',
            boxShadow: '0 4px 16px rgba(59,130,246,0.35)',
            _hover: { bg: 'brand.600', transform: 'translateY(-1px)' },
            transition: 'all 0.15s',
          })}
        >
          <PenLine size={17} />
          글쓰기
        </Link>
      )}
    </div>
  );
}
