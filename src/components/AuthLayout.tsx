import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { css } from 'styled-system/css';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      className={css({
        minH: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: '4',
        py: '12',
      })}
    >
      {/* 로고 */}
      <Link
        to="/"
        className={css({
          display: 'flex',
          alignItems: 'center',
          gap: '2',
          textDecoration: 'none',
          mb: '8',
        })}
      >
        <div
          className={css({
            w: '8',
            h: '8',
            bg: 'brand.500',
            borderRadius: 'md',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <span className={css({ color: 'white', fontWeight: 'bold', fontSize: 'sm' })}>T</span>
        </div>
        <span className={css({ fontSize: 'xl', fontWeight: 'bold', color: 'gray.900' })}>
          ToyProject
        </span>
      </Link>

      {/* 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={css({
          w: 'full',
          maxW: 'sm',
          bg: 'white',
          borderRadius: 'xl',
          border: '1px solid',
          borderColor: 'gray.200',
          p: '8',
          boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        })}
      >
        {children}
      </motion.div>
    </div>
  );
}
