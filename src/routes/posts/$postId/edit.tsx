import { useEffect, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { css, cx } from 'styled-system/css';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ThumbnailUploader } from '@/components/ThumbnailUploader';
import { useAuth } from '@/hooks/useAuth';
import { usePost, useUpdatePost } from '@/hooks/usePosts';
import { postFormSchema, type PostFormValues } from '@/types/post.schema';
import { AiAssistButton } from '@/features/ai/components/AiAssistButton';

export const Route = createFileRoute('/posts/$postId/edit')({
  component: PostEditPage,
});

function PostEditPage() {
  return (
    <ProtectedRoute>
      <PostEditForm />
    </ProtectedRoute>
  );
}

function PostEditForm() {
  const { postId } = Route.useParams();
  const { data: post, isLoading } = usePost(postId);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useUpdatePost();
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PostFormValues>({ resolver: zodResolver(postFormSchema) });

  useEffect(() => {
    if (post) {
      reset({ title: post.title, content: post.content });
      setThumbnailUrl(post.thumbnail_url ?? null);
    }
  }, [post, reset]);

  useEffect(() => {
    if (post && user && post.user_id !== user.id) {
      void navigate({ to: '/' });
    }
  }, [post, user, navigate]);

  const onSubmit = async (values: PostFormValues) => {
    await mutateAsync({ id: postId, ...values, thumbnail_url: thumbnailUrl });
    void navigate({ to: '/posts/$postId', params: { postId } });
  };

  if (isLoading) {
    return (
      <div className={css({ display: 'flex', justifyContent: 'center', py: '20' })}>
        <div className={css({ color: 'gray.400', fontSize: 'sm' })}>불러오는 중...</div>
      </div>
    );
  }

  const inputBase = css({
    w: 'full',
    px: '3',
    py: '2',
    border: '1px solid',
    borderColor: 'gray.300',
    borderRadius: 'md',
    fontSize: 'sm',
    outline: 'none',
    _focus: { borderColor: 'brand.500', boxShadow: '0 0 0 3px token(colors.brand.100)' },
  });
  const inputError = css({ borderColor: 'red.400' });

  return (
    <div className={css({ maxW: '2xl', mx: 'auto' })}>
      <h1 className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'gray.900', mb: '8' })}>
        게시글 수정
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={css({ display: 'flex', flexDirection: 'column', gap: '5' })}
      >
        <div>
          <label
            className={css({
              display: 'block',
              fontSize: 'sm',
              fontWeight: 'medium',
              color: 'gray.700',
              mb: '1',
            })}
          >
            제목
          </label>
          <input
            {...register('title')}
            placeholder="제목을 입력하세요 (5~20자)"
            className={cx(inputBase, errors.title ? inputError : '')}
          />
          {errors.title && (
            <p className={css({ mt: '1', fontSize: 'xs', color: 'red.500' })}>
              {errors.title.message}
            </p>
          )}
        </div>

        <div>
          <label
            className={css({
              display: 'block',
              fontSize: 'sm',
              fontWeight: 'medium',
              color: 'gray.700',
              mb: '1',
            })}
          >
            본문
          </label>
          <textarea
            {...register('content')}
            rows={10}
            placeholder="본문을 입력하세요 (10~1000자)"
            className={cx(
              inputBase,
              css({ resize: 'vertical' }),
              errors.content ? inputError : '',
            )}
          />
          {errors.content && (
            <p className={css({ mt: '1', fontSize: 'xs', color: 'red.500' })}>
              {errors.content.message}
            </p>
          )}
          <AiAssistButton
            getText={() => watch('content') ?? ''}
            onApply={(text) => setValue('content', text, { shouldValidate: true })}
          />
        </div>

        <ThumbnailUploader value={thumbnailUrl} onChange={setThumbnailUrl} />

        <button
          type="submit"
          disabled={isPending}
          className={css({
            py: '3',
            bg: 'brand.500',
            color: 'white',
            borderRadius: 'md',
            border: 'none',
            cursor: 'pointer',
            fontSize: 'sm',
            fontWeight: 'medium',
            _hover: { bg: 'brand.600' },
            _disabled: { bg: 'brand.300', cursor: 'not-allowed' },
          })}
        >
          {isPending ? '수정 중...' : '수정 완료'}
        </button>
      </form>
    </div>
  );
}
