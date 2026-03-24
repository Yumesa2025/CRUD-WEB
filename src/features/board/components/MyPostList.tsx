import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { ArrowUpRight, Pencil, Trash2 } from 'lucide-react';
import { css } from 'styled-system/css';
import { useDeletePost } from '@/hooks/usePosts';
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
  return ACCENT_COLORS[id.charCodeAt(0) % ACCENT_COLORS.length];
}

interface MyPostListProps {
  posts: Post[];
}

export function MyPostList({ posts }: MyPostListProps) {
  const navigate = useNavigate();
  const { mutateAsync: deletePost, isPending: isDeleting } = useDeletePost();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleDelete = async () => {
    const post = posts.find((p) => p.id === confirmId);
    if (!post) return;
    await deletePost({ id: post.id, thumbnail_path: post.thumbnail_path });
    setConfirmId(null);
  };

  if (!posts.length) {
    return (
      <div className={css({ py: '20', textAlign: 'center', color: 'gray.400', fontSize: 'sm' })}>
        아직 작성한 글이 없습니다.
      </div>
    );
  }

  return (
    <>
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
          const accent = getAccentColor(post.id);

          return (
            <motion.div key={post.id} variants={itemVariants}>
              <div
                className={css({
                  borderRadius: 'xl',
                  border: '1px solid',
                  borderColor: 'gray.200',
                  bg: 'white',
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  h: 'full',
                  _hover: {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    borderColor: 'gray.300',
                    transform: 'translateY(-2px)',
                  },
                })}
              >
                {/* 썸네일 / 액센트 바 — 클릭 시 상세로 */}
                <Link
                  to="/posts/$postId"
                  params={{ postId: post.id }}
                  className={css({ display: 'block', textDecoration: 'none', flexShrink: '0' })}
                >
                  {post.thumbnail_url ? (
                    <img
                      src={post.thumbnail_url}
                      alt={post.title}
                      className={css({ w: 'full', h: '160px', objectFit: 'cover', display: 'block' })}
                    />
                  ) : (
                    <div style={{ background: accent }} className={css({ h: '4px', w: 'full' })} />
                  )}
                </Link>

                {/* 본문 영역 */}
                <div className={css({ p: '5', display: 'flex', flexDirection: 'column', flex: '1' })}>
                  {/* 제목 — 클릭 시 상세로 */}
                  <Link
                    to="/posts/$postId"
                    params={{ postId: post.id }}
                    className={css({ textDecoration: 'none', mb: '2', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2' })}
                  >
                    <h2 className={css({ fontSize: 'md', fontWeight: 'semibold', color: 'gray.900', lineHeight: '1.4', flex: '1' })}>
                      {post.title}
                    </h2>
                    <ArrowUpRight size={16} className={css({ color: 'gray.300', flexShrink: '0', mt: '0.5' })} />
                  </Link>

                  {/* 내용 미리보기 */}
                  <p
                    className={css({
                      fontSize: 'sm',
                      color: 'gray.500',
                      lineHeight: '1.6',
                      flex: '1',
                      mb: '4',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: '3',
                      // @ts-expect-error — WebkitBoxOrient는 Panda CSS 타입에 없지만 동작함
                      WebkitBoxOrient: 'vertical',
                    })}
                  >
                    {post.content}
                  </p>

                  {/* 날짜 + 수정/삭제 버튼 */}
                  <div
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      pt: '3',
                      borderTop: '1px solid',
                      borderColor: 'gray.100',
                    })}
                  >
                    <span className={css({ fontSize: 'xs', color: 'gray.400' })}>
                      {formatDate(post.created_at)}
                    </span>
                    <div className={css({ display: 'flex', gap: '1' })}>
                      <button
                        onClick={() => void navigate({ to: '/posts/$postId/edit', params: { postId: post.id } })}
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1',
                          px: '2.5',
                          py: '1.5',
                          border: '1px solid',
                          borderColor: 'gray.200',
                          borderRadius: 'md',
                          bg: 'white',
                          color: 'gray.500',
                          fontSize: 'xs',
                          cursor: 'pointer',
                          _hover: { bg: 'gray.50', borderColor: 'gray.300' },
                        })}
                      >
                        <Pencil size={11} />
                        수정
                      </button>
                      <button
                        onClick={() => setConfirmId(post.id)}
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1',
                          px: '2.5',
                          py: '1.5',
                          border: '1px solid',
                          borderColor: 'red.200',
                          borderRadius: 'md',
                          bg: 'white',
                          color: 'red.400',
                          fontSize: 'xs',
                          cursor: 'pointer',
                          _hover: { bg: 'red.50' },
                        })}
                      >
                        <Trash2 size={11} />
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* 삭제 확인 모달 */}
      {confirmId && (
        <div
          className={css({
            position: 'fixed',
            inset: '0',
            bg: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '50',
          })}
        >
          <div
            className={css({
              bg: 'white',
              borderRadius: 'xl',
              p: '8',
              w: '320px',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            })}
          >
            <p className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'gray.900', mb: '2' })}>
              게시글 삭제
            </p>
            <p className={css({ fontSize: 'sm', color: 'gray.500', mb: '6' })}>
              정말 삭제하시겠습니까? 되돌릴 수 없습니다.
            </p>
            <div className={css({ display: 'flex', gap: '3' })}>
              <button
                onClick={() => setConfirmId(null)}
                className={css({
                  flex: '1',
                  py: '2',
                  border: '1px solid',
                  borderColor: 'gray.300',
                  borderRadius: 'md',
                  bg: 'white',
                  color: 'gray.600',
                  fontSize: 'sm',
                  cursor: 'pointer',
                  _hover: { bg: 'gray.50' },
                })}
              >
                취소
              </button>
              <button
                onClick={() => void handleDelete()}
                disabled={isDeleting}
                className={css({
                  flex: '1',
                  py: '2',
                  bg: 'red.500',
                  border: 'none',
                  borderRadius: 'md',
                  color: 'white',
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  cursor: 'pointer',
                  _hover: { bg: 'red.600' },
                  _disabled: { bg: 'red.300', cursor: 'not-allowed' },
                })}
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
