import { test, expect } from '@playwright/test';

test.describe('Homepage and Workshop List', () => {
  test('homepage should load successfully', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check that the page title is present
    await expect(page).toHaveTitle(/MOAW/);

    // Check that main content is visible
    const mainContent = page.locator('app-root');
    await expect(mainContent).toBeVisible();
  });

  test('should display workshop catalog', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Look for catalog/workshop list elements
    // The catalog should be visible on the homepage
    const catalog = page.locator('app-catalog, app-home');
    await expect(catalog).toBeVisible();
  });

  test('should be able to search/filter workshops', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Look for search input or filter controls
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[placeholder*="search"]');
    
    // If search exists, test it
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('azure');
      await page.waitForTimeout(500); // Wait for search to filter
      
      // Check that results are displayed
      const catalogContent = page.locator('app-catalog, app-home');
      await expect(catalogContent).toBeVisible();
    }
  });

  test('should navigate to workshop list/catalog', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check if there's a link to browse all workshops or catalog
    const catalogLink = page.locator('a[href*="catalog"], a:has-text("Browse"), a:has-text("Workshops")').first();
    
    if (await catalogLink.count() > 0) {
      await catalogLink.click();
      
      // Wait for navigation
      await page.waitForLoadState('networkidle');
      
      // Verify we're on the catalog page
      expect(page.url()).toContain('catalog');
    }
  });

  test('should display workshop cards or list items', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Wait a bit for workshops to load
    await page.waitForTimeout(1000);

    // Check for workshop items (cards, list items, etc.)
    const workshopItems = page.locator('[class*="workshop"], [class*="card"], .list-item, article');
    
    // There should be at least some content
    const count = await workshopItems.count();
    expect(count).toBeGreaterThan(0);
  });
});
