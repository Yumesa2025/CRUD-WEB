export const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'] as const;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const IMAGE_ACCEPT_ATTR = '.jpg,.jpeg,.png,.webp,.gif';

/**
 * 이미지 파일 검증.
 * @returns 문제가 없으면 null, 있으면 에러 메시지
 */
export function validateImageFile(file: File): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!(ALLOWED_IMAGE_EXTENSIONS as readonly string[]).includes(ext)) {
    return `지원하지 않는 파일 형식입니다. (${ALLOWED_IMAGE_EXTENSIONS.join(', ')} 만 허용)`;
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return `파일 크기는 ${MAX_IMAGE_SIZE / 1024 / 1024}MB 이하여야 합니다.`;
  }
  return null;
}
