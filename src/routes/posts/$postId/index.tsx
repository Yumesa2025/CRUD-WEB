import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import { css } from 'styled-system/css';
import { useAuth } from '@/hooks/useAuth';
import { useDeletePost, usePost } from '@/hooks/usePosts';

export const Route = createFileRoute('/posts/$postId/')({
  component: PostDetailPage,
});

function PostDetailPage() {
  const { postId } = Route.useParams();
  const { data: post, isLoading } = usePost(postId);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { mutateAsync: deletePost, isPending: isDeleting } = useDeletePost();
  const [showConfirm, setShowConfirm] = useState(false);

  const isOwner = !!user && !!post && user.id === post.user_id;

  const handleDelete = async () => {
    await deletePost({ id: postId, thumbnail_path: post.thumbnail_path });
    void navigate({ to: '/' });
  };

  if (isLoading) {
    return (
      <div className={css({ display: 'flex', justifyContent: 'center', py: '20' })}>
        <div className={css({ color: 'gray.400', fontSize: 'sm' })}>불러오는 중...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={css({ py: '20', textAlign: 'center', color: 'gray.400' })}>
        게시글을 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {post.thumbnail_url && (
        <img
          src={post.thumbnail_url}
          alt={post.title}
          className={css({
            w: 'full',
            maxH: '400px',
            objectFit: 'cover',
            borderRadius: 'xl',
            mb: '8',
            display: 'block',
          })}
        />
      )}

      <div className={css({ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: '6' })}>
        <h1 className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'gray.900' })}>
          {post.title}
        </h1>
        {isOwner && (
          <div className={css({ display: 'flex', gap: '2' })}>
            <button
              onClick={() => void navigate({ to: '/posts/$postId/edit', params: { postId } })}
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '1',
                px: '3',
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
              <Pencil size={14} />
              수정
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '1',
                px: '3',
                py: '2',
                border: '1px solid',
                borderColor: 'red.200',
                borderRadius: 'md',
                bg: 'white',
                color: 'red.500',
                fontSize: 'sm',
                cursor: 'pointer',
                _hover: { bg: 'red.50' },
              })}
            >
              <Trash2 size={14} />
              삭제
            </button>
          </div>
        )}
      </div>

      <div className={css({ display: 'flex', gap: '2', fontSize: 'sm', color: 'gray.400', mb: '8' })}>
        <span>{post.profiles?.username ?? '알 수 없음'}</span>
        <span>·</span>
        <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
      </div>

      <div
        className={css({
          fontSize: 'base',
          color: 'gray.700',
          lineHeight: '1.8',
          whiteSpace: 'pre-wrap',
          borderTop: '1px solid',
          borderColor: 'gray.100',
          pt: '6',
        })}
      >
        {post.content}
      </div>

      {showConfirm && (
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
                onClick={() => setShowConfirm(false)}
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
                onClick={handleDelete}
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
    </motion.div>
  );
}
