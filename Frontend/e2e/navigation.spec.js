import { test, expect } from '@playwright/test';

test.describe('App Navigation & UI', () => {
  test('should load login page with Samvad branding', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByText('Samvad').first()).toBeVisible();
  });

  test('should have correct page title', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page).toHaveTitle(/Samvad|Vite/i);
  });

  test('login page should have Google sign-in option', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByText(/sign in with google/i)).toBeVisible();
  });

  test('signup page should have Google sign-up option', async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page.getByText(/sign up with google/i)).toBeVisible();
  });

  test('verification page should display correctly', async ({ page }) => {
    await page.goto('/auth/verify?email=test@test.com');
    await expect(page.getByText(/verify/i).first()).toBeVisible();
    await expect(page.getByText('test@test.com')).toBeVisible();
  });

  test('should show OTP inputs on verification page', async ({ page }) => {
    await page.goto('/auth/verify?email=test@test.com');
    const inputs = page.locator('input[type="text"][maxlength="1"]');
    await expect(inputs).toHaveCount(4);
  });

  test('signup page should validate min password length', async ({ page }) => {
    await page.goto('/auth/signup');
    await page.getByPlaceholder('Your full name').fill('Test');
    await page.getByPlaceholder('you@example.com').fill('test@test.com');
    await page.getByPlaceholder('Choose a password').fill('ab');
    await page.getByPlaceholder('Re-enter password').fill('ab');

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    await expect(page.getByText(/at least 6/i)).toBeVisible();
  });
});
