# CLAUDE.md — 프로젝트 컨텍스트

## 프롬프트 템플릿

우리 프로젝트 스택은 React + TanStack Router + TanStack Query + Jotai + Panda CSS + Supabase + Zod + RHF이야.
아래 기획서 기준으로 [구체적인 요청]을 구현해줘.

---

## 기술 스택

| 역할 | 라이브러리 |
|------|-----------|
| UI | React 18 + TypeScript |
| 빌드 | Vite |
| 라우팅 | TanStack Router |
| 서버 상태 | TanStack Query |
| 클라이언트 UI 상태 | Jotai |
| 스타일링 | Panda CSS (Zero-runtime) |
| 애니메이션 | Framer Motion |
| 공통 컴포넌트 | Radix UI |
| 아이콘 | Lucide React |
| 유효성 검사 | Zod + React Hook Form |
| 백엔드 / 인증 | Supabase |
| 테스트 | Vitest + Playwright |

## 폴더 구조

```
src/
├── components/        # 공통 UI 컴포넌트
├── features/
│   ├── auth/          # 인증 관련 기능
│   ├── board/
│   │   └── components/
│   └── ai/            # AI 관련 기능
├── hooks/             # 공통 커스텀 훅
├── lib/               # 외부 라이브러리 초기화 (supabase, queryClient)
├── services/          # API 호출 함수
├── stores/            # Jotai atoms (uiStore.ts 등)
├── styles/            # 글로벌 스타일, Panda CSS 설정
├── types/             # 공통 TypeScript 타입
└── utils/             # 순수 유틸리티 함수
```

## 상태 관리 원칙

- **서버 데이터** → TanStack Query (`useQuery`, `useMutation`)
- **UI 상태** (모달, 토스트, 사이드바 등) → Jotai atoms (`stores/uiStore.ts`)
- **폼 상태** → React Hook Form + Zod

## 코드 작성 규칙

- 컴포넌트는 기능(feature) 단위로 `features/` 아래에 위치
- 2개 이상 feature에서 쓰이는 컴포넌트는 `components/`로 이동
- Supabase 직접 호출은 `services/` 레이어에서만
- 환경변수는 반드시 `VITE_` 접두사 사용 (`.env.local` 참고)
