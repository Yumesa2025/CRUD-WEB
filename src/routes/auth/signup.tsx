import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { MailCheck } from 'lucide-react';
import { css, cx } from 'styled-system/css';
import { AuthLayout } from '@/components/AuthLayout';
import { useAuth } from '@/hooks/useAuth';

export const Route = createFileRoute('/auth/signup')({
  component: SignupPage,
});

const signupSchema = z
  .object({
    email: z.string().email('올바른 이메일을 입력하세요'),
    username: z
      .string()
      .min(2, '닉네임은 2자 이상이어야 합니다')
      .max(20, '닉네임은 20자 이하여야 합니다')
      .regex(/^[a-zA-Z0-9가-힣]+$/, '영문, 숫자, 한글만 사용 가능합니다'),
    password: z
      .string()
      .min(8, '비밀번호는 8자 이상이어야 합니다')
      .regex(/^(?=.*[A-Za-z])(?=.*\d)/, '영문과 숫자를 조합해야 합니다'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

type SignupValues = z.infer<typeof signupSchema>;

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

function SignupPage() {
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const { signUpWithEmail, signInWithGoogle } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async ({ email, password, username }: SignupValues) => {
    const { error } = await signUpWithEmail(email, password, username);
    if (error) {
      setError('root', { message: error.message });
      return;
    }
    setSentEmail(email);
    setEmailSent(true);
  };

  // 이메일 인증 안내 화면
  if (emailSent) {
    return (
      <AuthLayout>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className={css({ textAlign: 'center', py: '4' })}
        >
          <div
            className={css({
              w: '14',
              h: '14',
              bg: 'brand.50',
              borderRadius: 'full',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: '4',
            })}
          >
            <MailCheck size={28} color="var(--colors-brand-500)" />
          </div>
          <h2 className={css({ fontSize: 'xl', fontWeight: 'bold', color: 'gray.900', mb: '2' })}>
            이메일을 확인해주세요
          </h2>
          <p className={css({ fontSize: 'sm', color: 'gray.500', lineHeight: '1.6' })}>
            <strong className={css({ color: 'gray.700' })}>{sentEmail}</strong> 으로
            <br />
            인증 링크를 발송했습니다.
            <br />
            링크를 클릭하면 가입이 완료됩니다.
          </p>
          <p className={css({ mt: '6', fontSize: 'xs', color: 'gray.400' })}>
            메일이 오지 않는다면 스팸함을 확인해주세요
          </p>
        </motion.div>
      </AuthLayout>
    );
  }

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
        회원가입
      </h1>
      <p className={css({ fontSize: 'sm', color: 'gray.500', textAlign: 'center', mb: '6' })}>
        새 계정을 만들어보세요
      </p>

      {/* Google 가입 */}
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
        Google로 가입하기
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
            닉네임
          </label>
          <input
            {...register('username')}
            type="text"
            placeholder="홍길동"
            className={cx(inputBase, errors.username ? inputError : '')}
          />
          {errors.username && (
            <p className={css({ mt: '1', fontSize: 'xs', color: 'red.500' })}>{errors.username.message}</p>
          )}
        </div>

        <div>
          <label className={css({ display: 'block', fontSize: 'sm', fontWeight: 'medium', color: 'gray.700', mb: '1' })}>
            비밀번호
          </label>
          <input
            {...register('password')}
            type="password"
            placeholder="영문 + 숫자 8자 이상"
            className={cx(inputBase, errors.password ? inputError : '')}
          />
          {errors.password && (
            <p className={css({ mt: '1', fontSize: 'xs', color: 'red.500' })}>{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className={css({ display: 'block', fontSize: 'sm', fontWeight: 'medium', color: 'gray.700', mb: '1' })}>
            비밀번호 확인
          </label>
          <input
            {...register('confirmPassword')}
            type="password"
            placeholder="••••••••"
            className={cx(inputBase, errors.confirmPassword ? inputError : '')}
          />
          {errors.confirmPassword && (
            <p className={css({ mt: '1', fontSize: 'xs', color: 'red.500' })}>{errors.confirmPassword.message}</p>
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
          {isSubmitting ? '가입 중...' : '회원가입'}
        </button>
      </form>

      <p className={css({ mt: '6', textAlign: 'center', fontSize: 'sm', color: 'gray.500' })}>
        이미 계정이 있으신가요?{' '}
        <Link
          to="/auth/login"
          className={css({ color: 'brand.600', fontWeight: 'medium', _hover: { color: 'brand.700' } })}
        >
          로그인
        </Link>
      </p>
    </AuthLayout>
  );
}
