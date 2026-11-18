import { expect, test, type Page } from '@playwright/test';
import { mockApi, signIn } from './support/app';

const widths = [360, 390, 768, 1024, 1440] as const;

const expectNoHorizontalScroll = async (page: Page) => {
  const overflow = await page.evaluate(() => {
    const doc = (
      globalThis as unknown as {
        document?: {
          documentElement?: { scrollWidth?: number; clientWidth?: number };
        };
      }
    ).document;
    return (doc?.documentElement?.scrollWidth ?? 0) - (doc?.documentElement?.clientWidth ?? 0);
  });
  expect(overflow, 'horizontal overflow').toBeLessThanOrEqual(1);
};

for (const width of widths) {
  const isDesktop = width >= 1024;

  test.describe(`responsive ${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    test.beforeEach(async ({ page }) => {
      await mockApi(page);
    });

    test('landing, auth, and legal pages fit the viewport', async ({ page }) => {
      for (const path of ['/', '/login', '/register', '/privacy', '/terms']) {
        await page.goto(path);
        await expect(page.locator('main')).toBeVisible();
        await expectNoHorizontalScroll(page);
      }
    });

    test('chat shell uses the expected sidebar mode', async ({ page }) => {
      await signIn(page);
      await expect(page.getByRole('textbox', { name: 'Message' })).toBeVisible();
      await expectNoHorizontalScroll(page);

      const sidebar = page.getByRole('complementary', { name: 'Sidebar' });
      const openSidebar = page.getByRole('button', { name: 'Open sidebar' });
      const composerWrapper = page
        .locator('form:has(textarea[aria-label="Message"])')
        .locator('xpath=../..');

      await expect(composerWrapper).toHaveAttribute('style', /safe-area-inset-bottom/);

      if (isDesktop) {
        await expect(sidebar).toBeVisible();
        await expect(openSidebar).toBeHidden();
        await page.getByRole('button', { name: 'Collapse sidebar' }).click();
        await expect(sidebar).toHaveCSS('width', '56px');
        await page.getByRole('button', { name: 'Expand sidebar' }).click();
        await expect(sidebar).toHaveCSS('width', '280px');
      } else {
        await expect(sidebar).toBeHidden();
        await expect(openSidebar).toBeVisible();
        await openSidebar.click();
        await expect(sidebar).toBeVisible();
        await expectNoHorizontalScroll(page);
        await page.getByRole('button', { name: 'Collapse sidebar' }).click();
        await expect(sidebar).toBeHidden();
      }

      await expectNoHorizontalScroll(page);
    });
  });
}
