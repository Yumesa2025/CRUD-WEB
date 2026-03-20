import { createFileRoute } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSetAtom } from 'jotai';
import { Camera, Mail, User } from 'lucide-react';
import { css } from 'styled-system/css';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useProfile, useMyPosts, useUpdateProfile, useUploadAvatar } from '@/hooks/useProfile';
import { PostList } from '@/features/board/components/PostList';
import { addToastAtom } from '@/stores/uiStore';

export const Route = createFileRoute('/profile/')({
  component: ProfilePage,
});

const profileSchema = z.object({
  username: z
    .string()
    .min(2, '닉네임은 2자 이상이어야 합니다')
    .max(20, '닉네임은 20자 이하여야 합니다'),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

function ProfileContent() {
  const { user } = useAuth();
  const addToast = useSetAtom(addToastAtom);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const { data: profile, isLoading: profileLoading } = useProfile(user?.id ?? '');
  const { data: myPosts, isLoading: postsLoading } = useMyPosts(user?.id ?? '');
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const { mutateAsync: uploadAvatar, isPending: isUploading } = useUploadAvatar();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: { username: profile?.username ?? '' },
  });

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // preview
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    try {
      const newAvatarUrl = await uploadAvatar({ userId: user.id, file });
      updateProfile(
        { userId: user.id, username: profile?.username ?? '', avatarUrl: newAvatarUrl },
        {
          onSuccess: () => addToast({ variant: 'success', title: '아바타가 업데이트됐습니다' }),
          onError: () => {
            setAvatarPreview(null);
            addToast({ variant: 'error', title: '아바타 업로드에 실패했습니다' });
          },
        }
      );
    } catch {
      setAvatarPreview(null);
      addToast({ variant: 'error', title: '아바타 업로드에 실패했습니다' });
    }

    // reset input so same file can be re-selected
    e.target.value = '';
  }

  function onSubmit(values: ProfileFormValues) {
    if (!user) return;
    updateProfile(
      { userId: user.id, username: values.username, avatarUrl: profile?.avatar_url ?? null },
      {
        onSuccess: () => addToast({ variant: 'success', title: '프로필이 저장됐습니다' }),
        onError: () => addToast({ variant: 'error', title: '저장에 실패했습니다' }),
      }
    );
  }

  if (profileLoading) {
    return (
      <div className={css({ py: '20', textAlign: 'center', color: 'gray.400', fontSize: 'sm' })}>
        로딩 중...
      </div>
    );
  }

  const avatarSrc = avatarPreview ?? profile?.avatar_url ?? null;
  const initials = (profile?.username ?? user?.email ?? '?').charAt(0).toUpperCase();
  const isBusy = isUpdating || isUploading;

  return (
    <div className={css({ maxW: '600px', mx: 'auto', py: '8', px: '4' })}>
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
        <div
          className={css({
            h: '28',
            background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
          })}
        />

        {/* 아바타 + 정보 */}
        <div className={css({ px: '6', pb: '6' })}>
          {/* 아바타 */}
          <div className={css({ mt: '-10', mb: '4' })}>
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={isBusy}
              className={css({
                position: 'relative',
                w: '20',
                h: '20',
                borderRadius: 'full',
                overflow: 'hidden',
                border: '3px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                cursor: 'pointer',
                display: 'block',
                _hover: { opacity: '0.85' },
                transition: 'opacity 0.15s',
              })}
            >
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="avatar"
                  className={css({ w: 'full', h: 'full', objectFit: 'cover' })}
                />
              ) : (
                <div
                  className={css({
                    w: 'full',
                    h: 'full',
                    bg: 'brand.100',
                    color: 'brand.700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2xl',
                    fontWeight: 'bold',
                  })}
                >
                  {initials}
                </div>
              )}
              <div
                className={css({
                  position: 'absolute',
                  inset: '0',
                  bg: 'rgba(0,0,0,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: '0',
                  _hover: { opacity: '1' },
                  transition: 'opacity 0.15s',
                })}
              >
                <Camera size={20} color="white" />
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className={css({ display: 'none' })}
              onChange={(e) => void handleFileChange(e)}
            />
          </div>

          {/* 폼 */}
          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
            {/* 닉네임 */}
            <div className={css({ mb: '4' })}>
              <label
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5',
                  fontSize: 'xs',
                  fontWeight: 'semibold',
                  color: 'gray.500',
                  mb: '1.5',
                  textTransform: 'uppercase',
                  letterSpacing: 'wide',
                })}
              >
                <User size={13} />
                닉네임
              </label>
              <input
                {...register('username')}
                className={css({
                  w: 'full',
                  px: '3',
                  py: '2.5',
                  fontSize: 'sm',
                  borderRadius: 'lg',
                  border: '1px solid',
                  borderColor: errors.username ? 'red.400' : 'gray.200',
                  outline: 'none',
                  _focus: { borderColor: 'brand.400', boxShadow: '0 0 0 3px rgba(99,102,241,0.15)' },
                  transition: 'all 0.15s',
                  bg: 'gray.50',
                })}
              />
              {errors.username && (
                <p className={css({ fontSize: 'xs', color: 'red.500', mt: '1' })}>
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* 이메일 (읽기 전용) */}
            <div className={css({ mb: '6' })}>
              <label
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5',
                  fontSize: 'xs',
                  fontWeight: 'semibold',
                  color: 'gray.500',
                  mb: '1.5',
                  textTransform: 'uppercase',
                  letterSpacing: 'wide',
                })}
              >
                <Mail size={13} />
                이메일
              </label>
              <input
                readOnly
                value={user?.email ?? ''}
                className={css({
                  w: 'full',
                  px: '3',
                  py: '2.5',
                  fontSize: 'sm',
                  borderRadius: 'lg',
                  border: '1px solid',
                  borderColor: 'gray.200',
                  bg: 'gray.100',
                  color: 'gray.500',
                  cursor: 'default',
                })}
              />
            </div>

            <button
              type="submit"
              disabled={!isDirty || isBusy}
              className={css({
                w: 'full',
                py: '2.5',
                fontSize: 'sm',
                fontWeight: 'medium',
                borderRadius: 'lg',
                bg: !isDirty || isBusy ? 'gray.200' : 'brand.500',
                color: !isDirty || isBusy ? 'gray.400' : 'white',
                cursor: !isDirty || isBusy ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
                _hover: isDirty && !isBusy ? { bg: 'brand.600' } : {},
              })}
            >
              {isBusy ? '저장 중...' : '저장하기'}
            </button>
          </form>
        </div>
      </div>

      {/* 내가 쓴 글 */}
      <div>
        <h2 className={css({ fontSize: 'lg', fontWeight: 'bold', color: 'gray.900', mb: '5' })}>
          내가 쓴 글
        </h2>
        {postsLoading ? (
          <div className={css({ py: '10', textAlign: 'center', color: 'gray.400', fontSize: 'sm' })}>
            로딩 중...
          </div>
        ) : (
          <PostList posts={myPosts ?? []} />
        )}
      </div>
    </div>
  );
}

function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
