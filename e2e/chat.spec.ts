import { expect, test } from '@playwright/test';
import { mockApi, signIn } from './support/app';

test.describe('chat journeys', () => {
  test('signs in and holds a conversation', async ({ page }) => {
    await mockApi(page);
    await signIn(page);

    await page.getByRole('textbox', { name: 'Message' }).fill('How do I reverse a list?');
    await page.getByRole('button', { name: 'Send message' }).click();

    await expect(page.getByText('Use a slice to reverse the list.')).toBeVisible();
    await expect(page).toHaveURL(/\/chat\/conversation-1$/);
  });

  test('restores the session after a reload without persisting the access token', async ({
    page,
  }) => {
    await mockApi(page);
    await signIn(page);

    const storage = await page.evaluate(() => ({
      access: localStorage.getItem('accessToken'),
      refresh: sessionStorage.getItem('refreshToken'),
    }));

    expect(storage.access).toBeNull();
    expect(storage.refresh).toBe('refresh-token');

    await page.reload();

    await expect(page).toHaveURL(/\/chat$/);
    await expect(page.getByRole('textbox', { name: 'Message' })).toBeVisible();
  });

  test('keeps the draft when the stream is rate limited', async ({ page }) => {
    await mockApi(page, { stream: 'rate-limit' });
    await signIn(page);

    await page.getByRole('textbox', { name: 'Message' }).fill('Please answer');
    await page.getByRole('button', { name: 'Send message' }).click();

    await expect(page.getByText('Too many requests. Try again in 3 seconds.')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Message' })).toHaveValue('Please answer');
  });

  test('stops a held stream', async ({ page }) => {
    await mockApi(page, { stream: 'hold' });
    await signIn(page);

    const composer = page.getByRole('textbox', { name: 'Message' });
    await composer.fill('Hold this answer');
    await page.getByRole('button', { name: 'Send message' }).click();

    const stop = page.getByRole('button', { name: 'Stop generating' });
    await expect(stop).toBeVisible();
    await stop.click();

    await expect(stop).toBeHidden();
    await expect(composer).toBeEnabled();
  });
});
