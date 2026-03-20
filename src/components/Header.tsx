import { Link, useNavigate } from '@tanstack/react-router';
import { LogIn, LogOut, PenLine } from 'lucide-react';
import { css } from 'styled-system/css';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: '/' });
  };

  return (
    <header
      className={css({
        bg: 'white',
        borderBottom: '1px solid token(colors.brand.100)',
        px: '6',
        py: '4',
        position: 'sticky',
        top: '0',
        zIndex: '10',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      })}
    >
      <div
        className={css({
          maxW: '4xl',
          mx: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        })}
      >
        <Link
          to="/"
          className={css({
            fontWeight: 'bold',
            fontSize: 'xl',
            color: 'brand.600',
            textDecoration: 'none',
            _hover: { color: 'brand.700' },
          })}
        >
          ToyProject
        </Link>

        <nav className={css({ display: 'flex', gap: '2', alignItems: 'center' })}>
          {user ? (
            <>
              <Link
                to="/posts/new"
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1',
                  px: '4',
                  py: '2',
                  bg: 'brand.500',
                  color: 'white',
                  borderRadius: 'md',
                  textDecoration: 'none',
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  _hover: { bg: 'brand.600' },
                })}
              >
                <PenLine size={15} />
                글쓰기
              </Link>
              <button
                onClick={handleSignOut}
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1',
                  px: '4',
                  py: '2',
                  border: '1px solid token(colors.brand.100)',
                  color: 'brand.600',
                  borderRadius: 'md',
                  bg: 'transparent',
                  cursor: 'pointer',
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  _hover: { bg: 'brand.50' },
                })}
              >
                <LogOut size={15} />
                로그아웃
              </button>
            </>
          ) : (
            <Link
              to="/auth/login"
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '1',
                px: '4',
                py: '2',
                bg: 'brand.500',
                color: 'white',
                borderRadius: 'md',
                textDecoration: 'none',
                fontSize: 'sm',
                fontWeight: 'medium',
                _hover: { bg: 'brand.600' },
              })}
            >
              <LogIn size={15} />
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
