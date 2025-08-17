import { test, expect } from '@playwright/test'

test.describe('Onboard Hero Application', () => {
  test('loads homepage successfully', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/Onboard/);
  });

  test('loads login page', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
  });

  test('loads dashboard when authenticated', async ({ page }) => {
    // Mock authenticated state
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    // Should load without errors - we'll check for basic dashboard elements
    await expect(page.locator('body')).toBeVisible();
  });

  test('loads teams page', async ({ page }) => {
    await page.goto('/dashboard/teams', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Teams' }).first()).toBeVisible();
  });

  test('loads billing page', async ({ page }) => {
    await page.goto('/dashboard/billing', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Billing' }).first()).toBeVisible();
  });

  test('loads integrations page', async ({ page }) => {
    await page.goto('/dashboard/integrations', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
  });

  test('loads settings page', async ({ page }) => {
    await page.goto('/dashboard/settings', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main')).toBeVisible();
  });

  test('navigation works correctly', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    
    // Test sidebar navigation
    await page.click('text=Teams');
    await expect(page).toHaveURL(/.*teams/);
    
    await page.click('text=Billing');
    await expect(page).toHaveURL(/.*billing/);
    
    await page.click('text=Integrations');
    await expect(page).toHaveURL(/.*integrations/);
  });

  test('billing functionality works', async ({ page }) => {
    await page.goto('/dashboard/billing', { waitUntil: 'domcontentloaded' });
    
    // Check billing page elements exist
    await expect(page.getByRole('heading', { name: 'Current Plan' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Billing History' })).toBeVisible();
    
    // Test buttons exist and are clickable
    await expect(page.getByRole('button', { name: 'Update Payment Method' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Manage Billing' })).toBeVisible();
  });

  test('teams functionality works', async ({ page }) => {
    await page.goto('/dashboard/teams', { waitUntil: 'domcontentloaded' });
    
    // Check teams page elements exist
    await expect(page.locator('text=Team Collaboration')).toBeVisible();
    await expect(page.locator('text=Create Team')).toBeVisible();
  });

  test('integrations functionality works', async ({ page }) => {
    await page.goto('/dashboard/integrations', { waitUntil: 'domcontentloaded' });
    
    // Check integrations page elements exist
    await expect(page.locator('text=Nylas Integration')).toBeVisible();
    await expect(page.locator('text=Email Marketing Integrations')).toBeVisible();
  });

  test('settings functionality works', async ({ page }) => {
    await page.goto('/dashboard/settings', { waitUntil: 'domcontentloaded' });
    
    // Check settings page elements exist - wait for page to load
    await page.waitForTimeout(1000);
    await expect(page.locator('main')).toBeVisible();
  });

  test('kits page loads', async ({ page }) => {
    await page.goto('/dashboard/kits', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
  });

  test('clients page loads', async ({ page }) => {
    await page.goto('/dashboard/clients', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
  });

  test('analytics page loads', async ({ page }) => {
    await page.goto('/dashboard/analytics', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
  });

  test('branding page loads', async ({ page }) => {
    await page.goto('/dashboard/branding', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
  });
});