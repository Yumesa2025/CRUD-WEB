import { useEffect } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { css, cx } from 'styled-system/css';
import { AuthLayout } from '@/components/AuthLayout';
import { useAuth } from '@/hooks/useAuth';

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
});

const loginSchema = z.object({
  email: z.string().email('올바른 이메일을 입력하세요'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
});

type LoginValues = z.infer<typeof loginSchema>;

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const { user, isLoading, signInWithEmail, signInWithGoogle } = useAuth();

  // 이미 로그인된 상태면 / 로 redirect
  useEffect(() => {
    if (!isLoading && user) {
      void navigate({ to: '/' });
    }
  }, [user, isLoading, navigate]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async ({ email, password }: LoginValues) => {
    const { error } = await signInWithEmail(email, password);
    if (error) {
      setError('root', { message: '이메일 또는 비밀번호가 올바르지 않습니다' });
      return;
    }
    void navigate({ to: '/' });
  };

  const inputBase = css({
    w: 'full',
    px: '3',
    py: '2.5',
    border: '1px solid',
    borderColor: 'gray.300',
    borderRadius: 'md',
    fontSize: 'sm',
    outline: 'none',
    bg: 'white',
    _focus: { borderColor: 'brand.500', boxShadow: '0 0 0 3px token(colors.brand.100)' },
  });
  const inputError = css({ borderColor: 'red.400' });

  return (
    <AuthLayout>
      <h1
        className={css({
          fontSize: '2xl',
          fontWeight: 'bold',
          color: 'gray.900',
          mb: '1',
          textAlign: 'center',
        })}
      >
        로그인
      </h1>
      <p className={css({ fontSize: 'sm', color: 'gray.500', textAlign: 'center', mb: '6' })}>
        계정에 로그인하세요
      </p>

      {/* Google 로그인 */}
      <button
        type="button"
        onClick={() => void signInWithGoogle()}
        className={css({
          w: 'full',
          py: '2.5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2',
          bg: 'white',
          border: '1px solid',
          borderColor: 'gray.300',
          borderRadius: 'md',
          cursor: 'pointer',
          fontSize: 'sm',
          fontWeight: 'medium',
          color: 'gray.700',
          mb: '5',
          _hover: { bg: 'gray.50', borderColor: 'gray.400' },
        })}
      >
        <GoogleIcon />
        Google로 로그인
      </button>

      {/* 구분선 */}
      <div className={css({ display: 'flex', alignItems: 'center', gap: '3', mb: '5' })}>
        <div className={css({ flex: '1', h: '1px', bg: 'gray.200' })} />
        <span className={css({ fontSize: 'xs', color: 'gray.400' })}>또는 이메일로 계속</span>
        <div className={css({ flex: '1', h: '1px', bg: 'gray.200' })} />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}
      >
        <div>
          <label className={css({ display: 'block', fontSize: 'sm', fontWeight: 'medium', color: 'gray.700', mb: '1' })}>
            이메일
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder="you@example.com"
            className={cx(inputBase, errors.email ? inputError : '')}
          />
          {errors.email && (
            <p className={css({ mt: '1', fontSize: 'xs', color: 'red.500' })}>{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className={css({ display: 'block', fontSize: 'sm', fontWeight: 'medium', color: 'gray.700', mb: '1' })}>
            비밀번호
          </label>
          <input
            {...register('password')}
            type="password"
            placeholder="••••••••"
            className={cx(inputBase, errors.password ? inputError : '')}
          />
          {errors.password && (
            <p className={css({ mt: '1', fontSize: 'xs', color: 'red.500' })}>{errors.password.message}</p>
          )}
        </div>

        {errors.root && (
          <div
            className={css({
              px: '3',
              py: '2',
              bg: 'red.50',
              border: '1px solid',
              borderColor: 'red.200',
              borderRadius: 'md',
              fontSize: 'sm',
              color: 'red.600',
            })}
          >
            {errors.root.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={css({
            w: 'full',
            py: '2.5',
            bg: 'brand.500',
            color: 'white',
            borderRadius: 'md',
            border: 'none',
            cursor: 'pointer',
            fontSize: 'sm',
            fontWeight: 'semibold',
            _hover: { bg: 'brand.600' },
            _disabled: { bg: 'brand.300', cursor: 'not-allowed' },
          })}
        >
          {isSubmitting ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <p className={css({ mt: '6', textAlign: 'center', fontSize: 'sm', color: 'gray.500' })}>
        계정이 없으신가요?{' '}
        <Link
          to="/auth/signup"
          className={css({ color: 'brand.600', fontWeight: 'medium', _hover: { color: 'brand.700' } })}
        >
          회원가입
        </Link>
      </p>
    </AuthLayout>
  );
}
