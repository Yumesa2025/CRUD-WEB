import { test, expect } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? 'testuser@example.com';
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD ?? 'testpass1';

async function login(page: import('@playwright/test').Page) {
  await page.goto('/auth/login');
  await page.getByPlaceholder('you@example.com').fill(TEST_EMAIL);
  await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: '로그인' }).click();
  await expect(page).toHaveURL('/', { timeout: 10000 });
}

test.describe('게시글 CRUD', () => {
  test('로그인 → 글쓰기 → 목록에서 확인', async ({ page }) => {
    await login(page);

    const title = `테스트 제목 ${Date.now()}`;
    const content = '이것은 E2E 테스트용 본문입니다. 열 글자 이상.';

    await page.getByRole('link', { name: '글쓰기' }).click();
    await expect(page).toHaveURL('/posts/new');

    await page.getByPlaceholder('제목을 입력하세요 (5~20자)').fill(title);
    await page.getByPlaceholder('본문을 입력하세요 (10~1000자)').fill(content);
    await page.getByRole('button', { name: '게시글 등록' }).click();

    // 상세 페이지로 이동 확인
    await expect(page.getByText(title)).toBeVisible({ timeout: 10000 });
  });

  test('글 상세 → 수정 → 내용 변경 확인', async ({ page }) => {
    await login(page);

    // 첫 번째 글 클릭
    await page.goto('/');
    const firstPost = page.locator('a[href^="/posts/"]').first();
    await firstPost.click();

    // 수정 버튼 클릭
    const editBtn = page.getByRole('button', { name: '수정' });
    if (!(await editBtn.isVisible())) {
      test.skip(true, '본인 글이 없어서 수정 테스트 스킵');
      return;
    }
    await editBtn.click();

    const updatedContent = '수정된 본문입니다. 열 글자 이상으로 작성합니다.';
    await page.getByPlaceholder('본문을 입력하세요 (10~1000자)').fill(updatedContent);
    await page.getByRole('button', { name: '수정 완료' }).click();

    await expect(page.getByText(updatedContent)).toBeVisible({ timeout: 10000 });
  });

  test('글 상세 → 삭제 → 목록에서 사라짐 확인', async ({ page }) => {
    await login(page);

    // 글쓰기 후 삭제
    const title = `삭제테스트 ${Date.now()}`;
    await page.getByRole('link', { name: '글쓰기' }).click();
    await page.getByPlaceholder('제목을 입력하세요 (5~20자)').fill(title);
    await page.getByPlaceholder('본문을 입력하세요 (10~1000자)').fill('삭제용 테스트 본문입니다. 열 글자 이상.');
    await page.getByRole('button', { name: '게시글 등록' }).click();
    await expect(page.getByText(title)).toBeVisible({ timeout: 10000 });

    // 삭제
    await page.getByRole('button', { name: '삭제' }).click();
    await page.getByRole('button', { name: '삭제' }).last().click(); // 확인 버튼
    await expect(page).toHaveURL('/', { timeout: 10000 });

    await expect(page.getByText(title)).not.toBeVisible();
  });

  test('타인 글에서 수정/삭제 버튼 없음 확인', async ({ page }) => {
    // 비로그인 상태에서 목록 접근
    await page.goto('/');
    const firstPost = page.locator('a[href^="/posts/"]').first();

    if (!(await firstPost.isVisible())) {
      test.skip(true, '게시글 없음');
      return;
    }

    await firstPost.click();
    // 비로그인이므로 수정/삭제 버튼 없어야 함
    await expect(page.getByRole('button', { name: '수정' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: '삭제' })).not.toBeVisible();
  });
});
