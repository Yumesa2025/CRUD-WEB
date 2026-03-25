import { useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { css } from 'styled-system/css';
import { supabase } from '@/lib/supabase';

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    let navigated = false;

    const goHome = () => {
      if (navigated) return;
      navigated = true;
      void navigate({ to: '/' });
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        goHome();
      }
    });

    // 이미 세션이 있는 경우 (URL hash 처리 후)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) goHome();
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div
      className={css({
        minH: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4',
      })}
    >
      <motion.div
        className={css({
          w: '40px',
          h: '40px',
          borderRadius: 'full',
          border: '3px solid',
          borderColor: 'brand.100',
          borderTopColor: 'brand.500',
        })}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
      />
      <p className={css({ fontSize: 'sm', color: 'gray.400' })}>로그인 처리 중...</p>
    </div>
  );
}
