-- =============================================
-- 댓글 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS public.comments (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id    UUID        NOT NULL REFERENCES public.posts(id)    ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id  UUID                 REFERENCES public.comments(id) ON DELETE CASCADE,
  content    TEXT        NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT comments_content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 500)
);

CREATE INDEX IF NOT EXISTS comments_post_id_idx    ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS comments_parent_id_idx  ON public.comments(parent_id);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "댓글_읽기" ON public.comments FOR SELECT USING (true);
CREATE POLICY "댓글_작성" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "댓글_수정" ON public.comments FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "댓글_삭제" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- updated_at 자동 갱신 함수 / 트리거
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER comments_handle_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- 좋아요 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS public.likes (
  post_id    UUID        NOT NULL REFERENCES public.posts(id)    ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY (post_id, user_id)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "좋아요_읽기" ON public.likes FOR SELECT USING (true);
CREATE POLICY "좋아요_추가" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "좋아요_취소" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 북마크 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS public.bookmarks (
  post_id    UUID        NOT NULL REFERENCES public.posts(id)    ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY (post_id, user_id)
);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- 자신의 북마크만 볼 수 있음
CREATE POLICY "북마크_읽기" ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "북마크_추가" ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "북마크_취소" ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);
