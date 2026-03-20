# 배포 가이드

## 1. Vercel 환경변수 설정

Vercel 대시보드 → Project → Settings → Environment Variables 에서 아래 값 추가:

| 변수명 | 값 | 환경 |
|--------|-----|------|
| `VITE_SUPABASE_URL` | `https://zdgabsetpomlkztnwcwc.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | Supabase 대시보드 → Settings → API → anon key | Production, Preview, Development |

---

## 2. Supabase Edge Function 배포

```bash
# Supabase CLI 설치 (최초 1회)
npm install -g supabase

# 로그인
supabase login

# Edge Function 배포
supabase functions deploy ai-assist --project-ref zdgabsetpomlkztnwcwc

# API Key Secret 등록
supabase secrets set MINIMAX_API_KEY=발급받은키 --project-ref zdgabsetpomlkztnwcwc
```

---

## 3. Vercel 배포

### 방법 A — GitHub 연동 (권장)
1. [vercel.com](https://vercel.com) 로그인
2. **Add New Project** → GitHub 레포 선택 (`CRUD-WEB`)
3. Framework Preset: **Vite**
4. 환경변수 입력 후 **Deploy**

### 방법 B — CLI
```bash
npm install -g vercel
vercel --prod
```

---

## 4. 배포 후 확인 체크리스트

- [ ] 메인 페이지 (`/`) 정상 로딩
- [ ] 로그인 페이지 (`/auth/login`) 접근
- [ ] Google OAuth 로그인 작동
- [ ] 이메일 회원가입 → 인증 메일 수신
- [ ] 로그인 후 글쓰기 (`/posts/new`) 접근
- [ ] 게시글 등록 / 수정 / 삭제
- [ ] AI 교정 버튼 동작
- [ ] AI 글쓰기 버튼 동작
- [ ] 새로고침 시 라우트 유지 (SPA rewrites 확인)
- [ ] Supabase CORS 허용 목록에 Vercel 도메인 추가

### Supabase CORS 설정
Supabase 대시보드 → Authentication → URL Configuration:
- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: `https://your-app.vercel.app/auth/callback`
