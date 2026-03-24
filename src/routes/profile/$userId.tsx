import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { css } from 'styled-system/css';
import { useProfile, useMyPosts } from '@/hooks/useProfile';
import { PostList } from '@/features/board/components/PostList';

export const Route = createFileRoute('/profile/$userId')({
  component: UserProfilePage,
});

function UserProfilePage() {
  const { userId } = Route.useParams();
  const { data: profile, isLoading } = useProfile(userId);
  const { data: posts, isLoading: postsLoading } = useMyPosts(userId);

  if (isLoading) {
    return (
      <div className={css({ py: '20', textAlign: 'center', color: 'gray.400', fontSize: 'sm' })}>
        로딩 중...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={css({ py: '20', textAlign: 'center', color: 'gray.400' })}>
        사용자를 찾을 수 없습니다.
      </div>
    );
  }

  const initials = profile.username.charAt(0).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={css({ maxW: '600px', mx: 'auto', py: '8', px: '4' })}
    >
      {/* 프로필 카드 */}
      <div
        className={css({
          bg: 'white',
          borderRadius: '2xl',
          border: '1px solid',
          borderColor: 'gray.200',
          overflow: 'hidden',
          mb: '10',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        })}
      >
        {/* 헤더 배경 */}
        <div className={css({ h: '28', background: 'linear-gradient(135deg, #6366f1, #3b82f6)' })} />

        {/* 아바타 + 정보 */}
        <div className={css({ px: '6', pb: '6' })}>
          <div className={css({ mt: '-10', mb: '4' })}>
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className={css({
                  w: '20',
                  h: '20',
                  borderRadius: 'full',
                  objectFit: 'cover',
                  border: '3px solid white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  display: 'block',
                })}
              />
            ) : (
              <div
                className={css({
                  w: '20',
                  h: '20',
                  borderRadius: 'full',
                  bg: 'brand.100',
                  color: 'brand.700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2xl',
                  fontWeight: 'bold',
                  border: '3px solid white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                })}
              >
                {initials}
              </div>
            )}
          </div>

          <p className={css({ fontSize: 'xl', fontWeight: 'bold', color: 'gray.900' })}>
            {profile.username}
          </p>
          <p className={css({ fontSize: 'sm', color: 'gray.400', mt: '1' })}>
            {new Date(profile.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}부터 활동
          </p>
        </div>
      </div>

      {/* 이 사람이 쓴 글 */}
      <div>
        <h2 className={css({ fontSize: 'lg', fontWeight: 'bold', color: 'gray.900', mb: '5' })}>
          작성한 글
        </h2>
        {postsLoading ? (
          <div className={css({ py: '10', textAlign: 'center', color: 'gray.400', fontSize: 'sm' })}>
            로딩 중...
          </div>
        ) : (
          <PostList posts={posts ?? []} />
        )}
      </div>
    </motion.div>
  );
}
