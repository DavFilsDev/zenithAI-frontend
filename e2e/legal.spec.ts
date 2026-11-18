import { expect, test } from '@playwright/test';
import { mockApi } from './support/app';

test('opens the privacy and terms pages from the landing page', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');

  await expect(page.getByText('Service online')).toBeVisible();

  await page.getByRole('contentinfo').getByRole('link', { name: 'Privacy' }).click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Privacy' })).toBeVisible();
  await expect(page.getByText('Last updated: 16 November 2026')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Third-party model provider' })).toBeVisible();

  await page.getByRole('contentinfo').getByRole('link', { name: 'Terms' }).click();
  await expect(page).toHaveURL(/\/terms$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Terms' })).toBeVisible();
  await expect(page.getByText('Last updated: 16 November 2026')).toBeVisible();
  await expect(page.getByText(/no payment, no credits/i)).toBeVisible();
});
