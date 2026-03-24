-- ============================================================
-- AI rate limit 추적 테이블
-- Edge Function(service_role)에서만 접근 → RLS 활성화 후 사용자 정책 없음
-- ============================================================
CREATE TABLE ai_rate_limits (
  user_id       uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  window_start  timestamptz NOT NULL DEFAULT now(),
  request_count integer     NOT NULL DEFAULT 0
);

ALTER TABLE ai_rate_limits ENABLE ROW LEVEL SECURITY;
-- service_role 은 RLS 우회이므로 별도 정책 불필요

-- ============================================================
-- check_ai_rate_limit 실행 권한 제한
-- SECURITY DEFINER 함수는 기본적으로 PUBLIC에 실행 권한이 부여됨
-- anon/authenticated 가 직접 RPC 호출하여 타인 quota를 소모하는 것을 차단
-- ============================================================

-- ============================================================
-- 원자적 rate limit 체크 + 증가 함수
-- 반환: true = 허용, false = 초과
-- ============================================================
CREATE OR REPLACE FUNCTION check_ai_rate_limit(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER  -- service_role 권한으로 실행
AS $$
DECLARE
  v_limit       integer  := 10;
  v_window      interval := '1 minute';
  v_new_count   integer;
BEGIN
  INSERT INTO ai_rate_limits (user_id, window_start, request_count)
  VALUES (p_user_id, now(), 1)
  ON CONFLICT (user_id) DO UPDATE SET
    window_start  = CASE
      WHEN now() - ai_rate_limits.window_start > v_window THEN now()
      ELSE ai_rate_limits.window_start
    END,
    request_count = CASE
      WHEN now() - ai_rate_limits.window_start > v_window THEN 1
      ELSE ai_rate_limits.request_count + 1
    END
  RETURNING request_count INTO v_new_count;

  RETURN v_new_count <= v_limit;
END;
$$;

-- PUBLIC 실행 권한 제거 후 service_role 에만 부여
REVOKE EXECUTE ON FUNCTION check_ai_rate_limit(uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION check_ai_rate_limit(uuid) TO service_role;
