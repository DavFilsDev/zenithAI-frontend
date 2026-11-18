import { expect, test } from '@playwright/test';
import {
  expectNoSeriousOrCriticalAxeViolations,
  mockApi,
  openProfileModal,
  seededConversation,
  seededMessages,
  setTheme,
  signIn,
} from './support/app';

const viewports = [
  { name: '390px', width: 390, height: 844 },
  { name: '1280px', width: 1280, height: 800 },
] as const;

const themes = ['dark', 'light'] as const;

for (const theme of themes) {
  for (const viewport of viewports) {
    test.describe(`axe ${theme} ${viewport.name}`, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } });

      test('landing', async ({ page }) => {
        await setTheme(page, theme);
        await mockApi(page);
        await page.goto('/');
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        await expectNoSeriousOrCriticalAxeViolations(page);
      });

      test('login', async ({ page }) => {
        await setTheme(page, theme);
        await mockApi(page);
        await page.goto('/login');
        await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
        await expectNoSeriousOrCriticalAxeViolations(page);
      });

      test('register', async ({ page }) => {
        await setTheme(page, theme);
        await mockApi(page);
        await page.goto('/register');
        await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible();
        await expectNoSeriousOrCriticalAxeViolations(page);
      });

      test('privacy', async ({ page }) => {
        await setTheme(page, theme);
        await mockApi(page);
        await page.goto('/privacy');
        await expect(page.getByRole('heading', { level: 1, name: 'Privacy' })).toBeVisible();
        await expectNoSeriousOrCriticalAxeViolations(page);
      });

      test('terms', async ({ page }) => {
        await setTheme(page, theme);
        await mockApi(page);
        await page.goto('/terms');
        await expect(page.getByRole('heading', { level: 1, name: 'Terms' })).toBeVisible();
        await expectNoSeriousOrCriticalAxeViolations(page);
      });

      test('404', async ({ page }) => {
        await setTheme(page, theme);
        await mockApi(page);
        await page.goto('/this-page-does-not-exist');
        await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
        await expectNoSeriousOrCriticalAxeViolations(page);
      });

      test('empty chat', async ({ page }) => {
        await setTheme(page, theme);
        await mockApi(page);
        await signIn(page);
        await expect(page.getByRole('textbox', { name: 'Message' })).toBeVisible();
        await expectNoSeriousOrCriticalAxeViolations(page);
      });

      test('chat with a message', async ({ page }) => {
        await setTheme(page, theme);
        await mockApi(page, {
          conversation: seededConversation,
          messages: seededMessages,
        });
        await signIn(page);
        await page.goto('/chat/conversation-1');
        await expect(page.getByText('Here is an example:')).toBeVisible();
        await expectNoSeriousOrCriticalAxeViolations(page);
      });

      test('profile modal', async ({ page }) => {
        await setTheme(page, theme);
        await mockApi(page);
        await signIn(page);
        await openProfileModal(page);
        await expectNoSeriousOrCriticalAxeViolations(page);
      });
    });
  }
}
