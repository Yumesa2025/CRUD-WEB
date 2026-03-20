import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,       // 5분: 데이터를 fresh로 간주하는 시간
      gcTime: 1000 * 60 * 10,          // 10분: 미사용 캐시 보관 시간
      retry: 1,                         // 실패 시 1회 재시도
      refetchOnWindowFocus: false,      // 윈도우 포커스 시 자동 재요청 비활성화
    },
    mutations: {
      retry: 0,                         // 뮤테이션은 재시도 없음
    },
  },
});
