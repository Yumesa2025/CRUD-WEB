import { useEffect, useRef } from 'react';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { css } from 'styled-system/css';
import { Header } from '@/components/Header';
import { Toast } from '@/components/Toast';
import { useAuth } from '@/hooks/useAuth';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const { user, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const prevAuthScope = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (isLoading) return;

    const authScope = user?.id ?? null;
    if (prevAuthScope.current === undefined) {
      prevAuthScope.current = authScope;
      return;
    }

    if (prevAuthScope.current === authScope) return;
    prevAuthScope.current = authScope;

    queryClient.removeQueries({ queryKey: ['bookmarks'] });
    queryClient.removeQueries({ queryKey: ['likes'] });
    queryClient.removeQueries({ queryKey: ['profile'] });
    void queryClient.invalidateQueries({ queryKey: ['posts'] });
  }, [isLoading, queryClient, user?.id]);

  return (
    <>
      <Header />
      <main className={css({ maxW: '4xl', mx: 'auto', px: '6', py: '8' })}>
        <Outlet />
      </main>
      <Toast />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  );
}
