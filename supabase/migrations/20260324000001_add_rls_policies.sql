-- ============================================================
-- posts 테이블 RLS
-- ============================================================
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_select_all"
  ON posts FOR SELECT USING (true);

CREATE POLICY "posts_insert_own"
  ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "posts_update_own"
  ON posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "posts_delete_own"
  ON posts FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- profiles 테이블 RLS
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT USING (true);

-- 회원가입 트리거에서 INSERT 발생 → service_role 이 아닌 경우 본인만 허용
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- Storage: post-images 버킷
-- ============================================================
CREATE POLICY "post_images_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-images');

CREATE POLICY "post_images_insert_own_folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'post-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "post_images_delete_own_folder"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'post-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- Storage: avatars 버킷
-- ============================================================
CREATE POLICY "avatars_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- upsert: true 이므로 INSERT + UPDATE 모두 필요
CREATE POLICY "avatars_insert_own_folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_update_own_folder"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
