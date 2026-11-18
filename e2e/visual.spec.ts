import { expect, test, type Page } from '@playwright/test';
import {
  mockApi,
  openProfileModal,
  seededConversation,
  seededMessages,
  setTheme,
  signIn,
  waitForTheme,
} from './support/app';

const viewports = [
  { name: '390px', width: 390, height: 844 },
  { name: '1280px', width: 1280, height: 800 },
] as const;

const themes = ['dark', 'light'] as const;

type Screen = 'landing' | 'login' | 'register' | 'empty-chat' | 'chat-code' | 'privacy' | 'profile';

const prepare = async (page: Page, screen: Screen, theme: (typeof themes)[number]) => {
  await setTheme(page, theme);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mockApi(
    page,
    screen === 'chat-code'
      ? { conversation: seededConversation, messages: seededMessages }
      : undefined,
  );

  if (screen === 'empty-chat' || screen === 'chat-code' || screen === 'profile') {
    await signIn(page);
    if (screen === 'chat-code') {
      await page.goto('/chat/conversation-1');
      await expect(page.getByText('Here is an example:')).toBeVisible();
    }
    if (screen === 'profile') {
      await openProfileModal(page);
    }
    return;
  }

  const paths: Record<Exclude<Screen, 'empty-chat' | 'chat-code' | 'profile'>, string> = {
    landing: '/',
    login: '/login',
    register: '/register',
    privacy: '/privacy',
  };
  await page.goto(paths[screen]);
  await expect(page.locator('main')).toBeVisible();
};

const screens: Screen[] = [
  'landing',
  'login',
  'register',
  'empty-chat',
  'chat-code',
  'privacy',
  'profile',
];

for (const theme of themes) {
  for (const viewport of viewports) {
    test.describe(`visual ${theme} ${viewport.name}`, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } });

      for (const screen of screens) {
        test(screen, async ({ page }) => {
          await prepare(page, screen, theme);
          await waitForTheme(page, theme);
          await expect(page).toHaveScreenshot(`${screen}-${theme}-${viewport.name}.png`, {
            fullPage: true,
          });
        });
      }
    });
  }
}
