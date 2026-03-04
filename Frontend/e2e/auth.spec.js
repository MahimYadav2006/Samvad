import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should show login page at /auth/login', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByText('Sign In')).toBeVisible();
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible();
  });

  test('should show signup page at /auth/signup', async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page.getByRole('heading', { name: /sign up/i })).toBeVisible();
    await expect(page.getByPlaceholder('Your full name')).toBeVisible();
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
  });

  test('should navigate from login to signup', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByText('Sign up').click();
    await expect(page).toHaveURL(/\/auth\/signup/);
  });

  test('should navigate from signup to login', async ({ page }) => {
    await page.goto('/auth/signup');
    await page.getByRole('link', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should show validation errors on empty login form', async ({ page }) => {
    await page.goto('/auth/login');

    // Find and click the Sign In submit button
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Validation errors should appear
    await expect(page.getByText(/required/i).first()).toBeVisible();
  });

  test('should show validation errors on empty signup form', async ({ page }) => {
    await page.goto('/auth/signup');

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    await expect(page.getByText(/required/i).first()).toBeVisible();
  });

  test('should validate email format on login', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByPlaceholder('you@example.com').fill('not-an-email');
    await page.getByPlaceholder('Enter your password').fill('password123');

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test('should show password mismatch error on signup', async ({ page }) => {
    await page.goto('/auth/signup');
    await page.getByPlaceholder('Your full name').fill('Test User');
    await page.getByPlaceholder('you@example.com').fill('test@test.com');
    await page.getByPlaceholder('Choose a password').fill('password123');
    await page.getByPlaceholder('Re-enter password').fill('different');

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    await expect(page.getByText(/must match/i)).toBeVisible();
  });

  test('should redirect root to login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should redirect /dashboard to /auth/login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should show error toast on invalid login credentials', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByPlaceholder('you@example.com').fill('wrong@test.com');
    await page.getByPlaceholder('Enter your password').fill('wrongpassword');

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Wait for toast notification (error)
    await expect(page.locator('.Toastify__toast--error').first()).toBeVisible({ timeout: 10000 });
  });
});
