import { useEffect, useRef } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
import { Loader2, PenLine } from 'lucide-react';
import { css } from 'styled-system/css';
import { useAuth } from '@/hooks/useAuth';
import { useInfinitePosts, useSearchPosts } from '@/hooks/usePosts';
import { PostList } from '@/features/board/components/PostList';
import { PostListError } from '@/features/board/components/PostList.error';
import { PostListSkeleton } from '@/features/board/components/PostList.skeleton';
import { searchQueryAtom } from '@/stores/uiStore';

export const Route = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  const { user } = useAuth();
  const query = useAtomValue(searchQueryAtom);
  const normalizedQuery = query.trim();

  const infiniteResult = useInfinitePosts(user?.id ?? null);
  const searchResult = useSearchPosts(normalizedQuery, user?.id ?? null);

  const active = normalizedQuery ? searchResult : infiniteResult;
  const posts = active.data?.pages.flatMap((page) => page.data) ?? [];
  const totalCount = posts.length;

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && active.hasNextPage && !active.isFetchingNextPage) {
          void active.fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [active]);

  const isLoading = active.isLoading;
  const isError = active.isError;

  return (
    <div>
      <div className={css({ mb: '8' })}>
        <h1 className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'gray.900', mb: '1' })}>
          {normalizedQuery ? `"${normalizedQuery}" 검색 결과` : '게시글'}
        </h1>
        <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
          {isLoading
            ? '불러오는 중...'
            : normalizedQuery
              ? `${totalCount}개의 결과`
              : `${totalCount}개의 글`}
        </p>
      </div>

      {isLoading && <PostListSkeleton />}
      {isError && <PostListError onRetry={() => void active.refetch()} />}

      {!isLoading && !isError && (
        <>
          {posts.length === 0 && normalizedQuery ? (
            <div className={css({ py: '20', textAlign: 'center', color: 'gray.400', fontSize: 'sm' })}>
              검색 결과가 없습니다.
            </div>
          ) : (
            <PostList posts={posts} />
          )}
        </>
      )}

      {active.isFetchingNextPage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={css({ display: 'flex', justifyContent: 'center', py: '8' })}
        >
          <Loader2
            size={24}
            className={css({ color: 'brand.400', animation: 'spin 1s linear infinite' })}
          />
        </motion.div>
      )}

      {!active.hasNextPage && posts.length > 0 && !active.isFetchingNextPage && (
        <p className={css({ textAlign: 'center', fontSize: 'sm', color: 'gray.400', py: '8' })}>
          모든 게시글을 확인했습니다.
        </p>
      )}

      <div ref={sentinelRef} className={css({ h: '1px' })} />

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
