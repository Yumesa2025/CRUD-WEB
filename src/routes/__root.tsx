import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { css } from 'styled-system/css';
import { Header } from '@/components/Header';
import { Toast } from '@/components/Toast';

export const Route = createRootRoute({
  component: () => (
    <>
      <Header />
      <main className={css({ maxW: '4xl', mx: 'auto', px: '6', py: '8' })}>
        <Outlet />
      </main>
      <Toast />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  ),
});
