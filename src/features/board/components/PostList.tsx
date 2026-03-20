import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { css } from 'styled-system/css';
import type { Post } from '@/types/post.schema';
import { formatDate } from '@/utils/format';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const ACCENT_COLORS = [
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #3b82f6, #06b6d4)',
  'linear-gradient(135deg, #10b981, #059669)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #ec4899, #8b5cf6)',
  'linear-gradient(135deg, #14b8a6, #3b82f6)',
];

function getAccentColor(id: string) {
  const index = id.charCodeAt(0) % ACCENT_COLORS.length;
  return ACCENT_COLORS[index];
}

function AvatarInitial({ username }: { username: string }) {
  const initial = username.charAt(0).toUpperCase();
  return (
    <div
      className={css({
        w: '7',
        h: '7',
        borderRadius: 'full',
        bg: 'brand.100',
        color: 'brand.700',
        fontSize: 'xs',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: '0',
      })}
    >
      {initial}
    </div>
  );
}

interface PostListProps {
  posts: Post[];
}

export function PostList({ posts }: PostListProps) {
  if (!posts.length) {
    return (
      <div className={css({ py: '20', textAlign: 'center', color: 'gray.400', fontSize: 'sm' })}>
        아직 게시글이 없습니다.
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={css({
        display: 'grid',
        gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)' },
        gap: '5',
      })}
    >
      {posts.map((post) => {
        const username = post.profiles?.username ?? '알 수 없음';
        const accent = getAccentColor(post.id);

        return (
          <motion.div key={post.id} variants={itemVariants}>
            <Link
              to="/posts/$postId"
              params={{ postId: post.id }}
              className={css({
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 'xl',
                border: '1px solid',
                borderColor: 'gray.200',
                bg: 'white',
                textDecoration: 'none',
                overflow: 'hidden',
                transition: 'all 0.2s',
                h: 'full',
                _hover: {
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  borderColor: 'gray.300',
                  transform: 'translateY(-2px)',
                },
              })}
            >
              {/* 상단 컬러 액센트 바 */}
              <div
                style={{ background: accent }}
                className={css({ h: '4px', w: 'full', flexShrink: '0' })}
              />

              {/* 본문 영역 */}
              <div className={css({ p: '5', display: 'flex', flexDirection: 'column', flex: '1' })}>
                {/* 제목 + 화살표 */}
                <div className={css({ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: '2', gap: '2' })}>
                  <h2 className={css({
                    fontSize: 'md',
                    fontWeight: 'semibold',
                    color: 'gray.900',
                    lineHeight: '1.4',
                    flex: '1',
                  })}>
                    {post.title}
                  </h2>
                  <ArrowUpRight
                    size={16}
                    className={css({ color: 'gray.300', flexShrink: '0', mt: '0.5' })}
                  />
                </div>

                {/* 내용 미리보기 */}
                <p className={css({
                  fontSize: 'sm',
                  color: 'gray.500',
                  lineHeight: '1.6',
                  flex: '1',
                  mb: '4',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: '3',
                  WebkitBoxOrient: 'vertical',
                })}>
                  {post.content}
                </p>

                {/* 하단 작성자 + 날짜 */}
                <div className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  pt: '3',
                  borderTop: '1px solid',
                  borderColor: 'gray.100',
                })}>
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                    <AvatarInitial username={username} />
                    <span className={css({ fontSize: 'xs', color: 'gray.600', fontWeight: 'medium' })}>
                      {username}
                    </span>
                  </div>
                  <span className={css({ fontSize: 'xs', color: 'gray.400' })}>
                    {formatDate(post.created_at)}
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
