import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { css } from 'styled-system/css';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: '/auth/login' });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div
        className={css({
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minH: '50vh',
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
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
