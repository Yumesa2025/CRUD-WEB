-- posts 테이블에 Storage 경로 컬럼 추가
-- thumbnail_url : 공개 접근 URL (기존 유지)
-- thumbnail_path: Storage 내부 경로 (삭제/교체 시 파일 정리에 사용)
ALTER TABLE posts ADD COLUMN thumbnail_path text;
