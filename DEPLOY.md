# 배포 체크리스트

## Supabase 마이그레이션 적용

```bash
supabase db push
```

또는 Supabase 대시보드 → SQL Editor에서 아래 파일을 순서대로 실행:

1. `supabase/migrations/20260324000001_add_rls_policies.sql`
2. `supabase/migrations/20260324000002_add_thumbnail_path.sql`
3. `supabase/migrations/20260324000003_add_ai_rate_limits.sql`

## Edge Function 환경변수

Supabase 대시보드 → Edge Functions → `ai-assist` → Secrets에 아래 항목 설정:

| 변수명 | 설명 | 필수 |
|--------|------|------|
| `MINIMAX_API_KEY` | MiniMax API 키 | ✅ |
| `ALLOWED_ORIGIN` | 허용할 프론트엔드 도메인 (예: `https://example.com`) | ✅ |
| `SUPABASE_URL` | Supabase 프로젝트 URL (자동 주입) | ✅ |
| `SUPABASE_ANON_KEY` | anon 키 (자동 주입) | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role 키 — rate limit DB 접근에 사용 | ✅ |

> `SUPABASE_SERVICE_ROLE_KEY`가 없으면 AI rate limit이 **fail-closed** 동작하여
> 모든 AI 요청이 차단됩니다. 반드시 설정하세요.

## Supabase Storage 버킷 확인

아래 두 버킷이 존재하는지 확인 (없으면 대시보드에서 생성):

- `post-images` — 게시글 썸네일 (Public)
- `avatars` — 프로필 아바타 (Public)

버킷 공개 설정: Storage → 버킷 선택 → Make public
