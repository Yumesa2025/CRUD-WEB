import { defineConfig } from '@pandacss/dev';

export default defineConfig({
  // Panda CSS가 스타일을 스캔할 파일 경로
  include: ['./src/**/*.{ts,tsx}'],
  exclude: [],

  // CSS 출력 경로 (vite에서 import할 파일)
  outdir: 'styled-system',

  // JSX 스타일 함수 사용 여부 (css(), cva() 등)
  jsxFramework: 'react',

  theme: {
    extend: {
      tokens: {
        colors: {
          brand: {
            50:  { value: '#eff6ff' },
            100: { value: '#dbeafe' },
            500: { value: '#3b82f6' },
            600: { value: '#2563eb' },
            700: { value: '#1d4ed8' },
            900: { value: '#1e3a8a' },
          },
        },
        fonts: {
          sans: { value: "'Pretendard Variable', Pretendard, -apple-system, sans-serif" },
        },
        radii: {
          sm: { value: '0.375rem' },
          md: { value: '0.5rem' },
          lg: { value: '0.75rem' },
          xl: { value: '1rem' },
        },
      },
    },
  },

  preflight: true, // CSS 리셋 포함
});
