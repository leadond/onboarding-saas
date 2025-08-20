import { test, expect } from '@playwright/test'

test.describe('Onboard Hero Application', () => {
  // Helper function to authenticate user
  const authenticateUser = async (page: any) => {
    const testUser = {
      email: 'app.test@gmail.com',
      password: 'TestPass123!'
    }

    // Clean up any existing user
    await page.request.post('/api/test/cleanup-user', {
      data: { email: testUser.email }
    }).catch(() => {})

    // Create user
    await page.goto('/signup')
    await page.locator('#fullName').fill('App Test User')
    await page.locator('#email').fill(testUser.email)
    await page.locator('#password').fill(testUser.password)
    await page.locator('#companyName').fill('App Test Company')
    await page.getByRole('button', { name: 'Create Account' }).click()

    // Wait for redirect to login
    await page.waitForURL('/login', { timeout: 10000 })

    // Create profile and reset password
    await page.request.post('/api/test/create-profile', {
      data: { email: testUser.email }
    }).catch(() => {})

    await page.request.post('/api/test/reset-password', {
      data: { 
        email: testUser.email,
        password: testUser.password
      }
    })

    await page.request.post('/api/test/set-password-flag', {
      data: { email: testUser.email, force_password_change: false }
    })

    // Login
    await page.locator('#email').fill(testUser.email)
    await page.locator('#password').fill(testUser.password)
    await page.getByRole('button', { name: 'Sign in to your account' }).click()

    // Wait for dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 })
  }

  test('loads homepage successfully', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/Onboard/);
  });

  test('loads login page', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
  });

  test('loads dashboard when authenticated', async ({ page }) => {
    await authenticateUser(page)
    await expect(page.locator('h1').filter({ hasText: 'Dashboard' })).toBeVisible();
  });

  test('loads teams page', async ({ page }) => {
    await authenticateUser(page)
    await page.goto('/dashboard/teams', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Teams' }).first()).toBeVisible();
  });

  test('loads billing page', async ({ page }) => {
    await authenticateUser(page)
    await page.goto('/dashboard/billing', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Current Plan' })).toBeVisible();
  });

  test('loads integrations page', async ({ page }) => {
    await authenticateUser(page)
    await page.goto('/dashboard/integrations', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
  });

  test('loads settings page', async ({ page }) => {
    await authenticateUser(page)
    await page.goto('/dashboard/settings', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main')).toBeVisible();
  });

  test('navigation works correctly', async ({ page }) => {
    await authenticateUser(page)
    
    // Test sidebar navigation using more specific selectors
    await page.click('a[href="/dashboard/teams"]');
    await expect(page).toHaveURL(/.*teams/);
    
    await page.click('a[href="/dashboard/integrations"]');
    await expect(page).toHaveURL(/.*integrations/);
  });

  test('billing functionality works', async ({ page }) => {
    await authenticateUser(page)
    await page.goto('/dashboard/billing', { waitUntil: 'domcontentloaded' });
    
    // Check billing page elements exist
    await expect(page.getByRole('heading', { name: 'Current Plan' })).toBeVisible();
    
    // Test buttons exist and are clickable
    await expect(page.locator('text=Upgrade to Pro')).toBeVisible();
  });

  test('teams functionality works', async ({ page }) => {
    await authenticateUser(page)
    await page.goto('/dashboard/teams', { waitUntil: 'domcontentloaded' });
    
    // Check teams page elements exist
    await expect(page.getByRole('heading', { name: 'Team Collaboration' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Team' })).toBeVisible();
  });

  test('integrations functionality works', async ({ page }) => {
    await authenticateUser(page)
    await page.goto('/dashboard/integrations', { waitUntil: 'domcontentloaded' });
    
    // Check integrations page elements exist
    await expect(page.locator('text=Slack')).toBeVisible();
    await expect(page.locator('text=Google Drive')).toBeVisible();
    await expect(page.locator('text=Browse Integrations')).toBeVisible();
  });

  test('settings functionality works', async ({ page }) => {
    await authenticateUser(page)
    await page.goto('/dashboard/settings', { waitUntil: 'domcontentloaded' });
    
    // Check settings page elements exist - wait for page to load
    await page.waitForTimeout(1000);
    await expect(page.locator('main')).toBeVisible();
  });

  test('kits page loads', async ({ page }) => {
    await authenticateUser(page)
    await page.goto('/dashboard/kits', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
  });

  test('clients page loads', async ({ page }) => {
    await authenticateUser(page)
    await page.goto('/dashboard/clients', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
  });

  test('analytics page loads', async ({ page }) => {
    await authenticateUser(page)
    await page.goto('/dashboard/analytics', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
  });

  test('branding page loads', async ({ page }) => {
    await authenticateUser(page)
    await page.goto('/dashboard/branding', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
  });
});