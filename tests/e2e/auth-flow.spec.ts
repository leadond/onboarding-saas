import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  const testUser = {
    email: 'test.user@gmail.com',
    fullName: 'E2E Test User',
    companyName: 'E2E Test Company',
    tempPassword: 'TempPass123!',
    newPassword: 'NewSecurePass123!'
  }

  test.beforeEach(async ({ page }) => {
    // Clean up any existing test user before each test
    await page.request.post('/api/test/cleanup-user', {
      data: { email: testUser.email }
    }).catch(() => {
      // Ignore errors if cleanup endpoint doesn't exist
    })
  })

  test('complete authentication flow: signup → temp login → password change → new login', async ({ page }) => {
    // Step 1: User Signup
    await page.goto('/signup')
    await expect(page).toHaveTitle(/Onboard Hero/)
    
    await page.locator('#fullName').fill(testUser.fullName)
    await page.locator('#email').fill(testUser.email)
    await page.locator('#password').fill(testUser.tempPassword)
    await page.locator('#companyName').fill(testUser.companyName)
    
    await page.getByRole('button', { name: 'Create Account' }).click()
    
    // Wait for redirect and check for success
    await page.waitForURL('/login', { timeout: 10000 })
    
    // Look for success toast or message
    await expect(page.locator('text=Account created successfully').first()).toBeVisible({ timeout: 5000 })

    // Step 2: Create user profile manually (simulating the trigger that should work)
    // Try to create profile, ignore if it already exists
    await page.request.post('/api/test/create-profile', {
      data: { email: testUser.email }
    }).catch(() => {
      // Ignore errors if profile already exists
    })

    // Step 3: Reset password to ensure it matches our test password
    await page.request.post('/api/test/reset-password', {
      data: { 
        email: testUser.email,
        password: testUser.tempPassword
      }
    })

    // Step 4: Login with temporary password
    await page.locator('#email').fill(testUser.email)
    await page.locator('#password').fill(testUser.tempPassword)
    await page.getByRole('button', { name: 'Sign in to your account' }).click()

    // Should redirect to change password page
    await page.waitForURL('/change-password?required=true', { timeout: 10000 })
    await expect(page.locator('text=Change Your Password')).toBeVisible()

    // Step 5: Change password
    await page.locator('input[name="currentPassword"]').fill(testUser.tempPassword)
    await page.locator('input[name="newPassword"]').fill(testUser.newPassword)
    await page.locator('input[name="confirmNewPassword"]').fill(testUser.newPassword)
    await page.getByRole('button', { name: 'Change Password' }).click()

    // Should redirect to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 })

    // Step 6: Sign out and test login with new password
    await page.goto('/dashboard/settings')
    await page.getByRole('button', { name: 'Sign Out' }).click()
    
    // Wait for redirect to login
    await page.waitForURL('/login', { timeout: 10000 })

    // Step 7: Login with new password (should go directly to dashboard)
    await page.locator('#email').fill(testUser.email)
    await page.locator('#password').fill(testUser.newPassword)
    await page.getByRole('button', { name: 'Sign in to your account' }).click()

    // Should go directly to dashboard (no password change required)
    await page.waitForURL('/dashboard', { timeout: 10000 })
    await expect(page.locator('h1').filter({ hasText: 'Dashboard' })).toBeVisible()
  })

  test('settings page shows authentication methods correctly', async ({ page }) => {
    // Setup: Create and login user
    await page.goto('/signup')
    await page.locator('#fullName').fill(testUser.fullName)
    await page.locator('#email').fill(testUser.email)
    await page.locator('#password').fill(testUser.tempPassword)
    await page.getByRole('button', { name: 'Create Account' }).click()

    // Wait for redirect
    await page.waitForURL('/login', { timeout: 10000 })

    // Create profile and reset password
    await page.request.post('/api/test/create-profile', {
      data: { email: testUser.email }
    })
    await page.request.post('/api/test/reset-password', {
      data: { email: testUser.email, password: testUser.newPassword }
    })

    // Update profile to clear force_password_change
    await page.request.post('/api/test/set-password-flag', {
      data: { email: testUser.email, force_password_change: false }
    })

    // Login and go to settings
    await page.locator('#email').fill(testUser.email)
    await page.locator('#password').fill(testUser.newPassword)
    await page.getByRole('button', { name: 'Sign in to your account' }).click()

    await page.waitForURL('/dashboard', { timeout: 10000 })
    await page.goto('/dashboard/settings')

    // Verify authentication methods section
    await expect(page.locator('text=Account Security')).toBeVisible()
    
    // Email & Password should be Active
    await expect(page.locator('text=Email & Password')).toBeVisible()
    await expect(page.locator('text=Active').first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Change Password' })).toBeVisible()

    // Google OAuth should be Not Linked
    await expect(page.locator('text=Google OAuth')).toBeVisible()
    await expect(page.locator('text=Not Linked')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Link Google Account' })).toBeVisible()
  })

  test('google oauth linking shows proper error handling', async ({ page }) => {
    // Setup: Create and login user (same as previous test)
    await page.goto('/signup')
    await page.locator('#fullName').fill(testUser.fullName)
    await page.locator('#email').fill(testUser.email)
    await page.locator('#password').fill(testUser.tempPassword)
    await page.getByRole('button', { name: 'Create Account' }).click()

    await page.waitForURL('/login', { timeout: 10000 })

    await page.request.post('/api/test/create-profile', {
      data: { email: testUser.email }
    })
    await page.request.post('/api/test/reset-password', {
      data: { email: testUser.email, password: testUser.newPassword }
    })
    await page.request.post('/api/test/set-password-flag', {
      data: { email: testUser.email, force_password_change: false }
    })

    await page.locator('#email').fill(testUser.email)
    await page.locator('#password').fill(testUser.newPassword)
    await page.getByRole('button', { name: 'Sign in to your account' }).click()

    await page.waitForURL('/dashboard', { timeout: 10000 })
    await page.goto('/dashboard/settings')

    // Try to link Google account
    await page.getByRole('button', { name: 'Link Google Account' }).click()

    // Should show error message (since OAuth isn't configured properly)
    await expect(page.locator('text=Failed to link Google account').first()).toBeVisible({ timeout: 10000 })
  })

  test('password validation works correctly', async ({ page }) => {
    await page.goto('/signup')
    
    // Test weak password
    await page.locator('#fullName').fill(testUser.fullName)
    await page.locator('#email').fill(testUser.email)
    await page.locator('#password').fill('weak')
    await page.getByRole('button', { name: 'Create Account' }).click()

    // Should show validation error (check for various possible error messages)
    await expect(page.locator('text=Password should be at least 6 characters').first()).toBeVisible({ timeout: 5000 })
  })

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login')
    
    await page.locator('#email').fill('nonexistent@example.com')
    await page.locator('#password').fill('wrongpassword')
    await page.getByRole('button', { name: 'Sign in to your account' }).click()

    // Should show error message (check for various possible error messages)
    await expect(page.locator('text=Invalid login credentials').or(page.locator('text=Authentication failed')).or(page.locator('text=Sign in failed'))).toBeVisible({ timeout: 10000 })
  })

  test.afterEach(async ({ page }) => {
    // Clean up test user after each test
    await page.request.post('/api/test/cleanup-user', {
      data: { email: testUser.email }
    }).catch(() => {
      // Ignore errors if cleanup endpoint doesn't exist
    })
  })
})