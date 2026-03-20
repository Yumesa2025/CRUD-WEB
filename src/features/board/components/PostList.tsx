import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { css } from 'styled-system/css';
import type { Post } from '@/types/post.schema';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

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
      className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}
    >
      {posts.map((post) => (
        <motion.div key={post.id} variants={itemVariants}>
          <Link
            to="/posts/$postId"
            params={{ postId: post.id }}
            className={css({
              display: 'block',
              p: '6',
              borderRadius: 'lg',
              border: '1px solid',
              borderColor: 'gray.200',
              bg: 'white',
              textDecoration: 'none',
              transition: 'all 0.15s',
              _hover: {
                boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                borderColor: 'brand.400',
              },
            })}
          >
            <h2
              className={css({
                fontSize: 'lg',
                fontWeight: 'semibold',
                color: 'gray.900',
                mb: '2',
              })}
            >
              {post.title}
            </h2>
            <p
              className={css({
                fontSize: 'sm',
                color: 'gray.500',
                mb: '4',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: '2',
              })}
            >
              {post.content}
            </p>
            <div
              className={css({
                display: 'flex',
                gap: '2',
                fontSize: 'xs',
                color: 'gray.400',
              })}
            >
              <span>{post.profiles?.username ?? '알 수 없음'}</span>
              <span>·</span>
              <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
