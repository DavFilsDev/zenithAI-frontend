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

  test('keeps the draft when the stream is rate limited', async ({ page }) => {
    await mockApi(page, { stream: 'rate-limit' });
    await signIn(page);

    await page.getByRole('textbox', { name: 'Message' }).fill('Please answer');
    await page.getByRole('button', { name: 'Send message' }).click();

    await expect(page.getByText('Too many requests. Try again in 3 seconds.')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Message' })).toHaveValue('Please answer');
  });
});
