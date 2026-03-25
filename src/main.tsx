import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Provider as JotaiProvider } from 'jotai';

import { queryClient } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';

// TanStack Router CLI가 vite dev/build 시 자동 생성
import { routeTree } from './routeTree.gen';

// 로그인/로그아웃 시 posts 캐시 초기화 (인증 상태 변경 시 최신 데이터 보장)
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
    void queryClient.invalidateQueries({ queryKey: ['posts'] });
  }
});

import './styles/index.css';

// ─── Router 인스턴스 ───────────────────────────────────────────────────────────
const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// ─── Provider 순서 ─────────────────────────────────────────────────────────────
// Jotai (UI 상태) → QueryClient (서버 상태) → Router (라우팅)
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </JotaiProvider>
  </React.StrictMode>
);
