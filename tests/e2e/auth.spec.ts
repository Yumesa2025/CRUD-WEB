import { test, expect } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? 'testuser@example.com';
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD ?? 'testpass1';

test.describe('Auth 플로우', () => {
  test('비로그인 상태에서 /posts/new 접근 → /auth/login redirect', async ({ page }) => {
    await page.goto('/posts/new');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('이메일 로그인 → / 이동 확인', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByPlaceholder('you@example.com').fill(TEST_EMAIL);
    await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: '로그인' }).click();
    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  test('로그아웃 → 헤더 버튼 변경 확인', async ({ page }) => {
    // 로그인
    await page.goto('/auth/login');
    await page.getByPlaceholder('you@example.com').fill(TEST_EMAIL);
    await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: '로그인' }).click();
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // 로그아웃
    await page.getByRole('button', { name: '로그아웃' }).click();
    await expect(page.getByRole('link', { name: '로그인' })).toBeVisible({ timeout: 5000 });
  });

  test('이메일 회원가입 플로우 → 이메일 인증 안내 화면', async ({ page }) => {
    const uniqueEmail = `test_${Date.now()}@example.com`;
    await page.goto('/auth/signup');
    await page.getByPlaceholder('you@example.com').fill(uniqueEmail);
    await page.getByPlaceholder('홍길동').fill('테스터');
    await page.getByPlaceholder('영문 + 숫자 8자 이상').fill('testpass1');
    await page.getByPlaceholder('••••••••').fill('testpass1');
    await page.getByRole('button', { name: '회원가입' }).click();
    await expect(page.getByText('이메일을 확인해주세요')).toBeVisible({ timeout: 10000 });
  });
});
