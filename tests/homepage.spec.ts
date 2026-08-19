import { test, expect } from '@playwright/test';

test.describe('Homepage and Workshop List', () => {
  test('homepage should load successfully', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check that the page title is present
    await expect(page).toHaveTitle(/MOAW/);

    // Check that the main heading is visible (from home component)
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Hands-on tutorials');
  });

  test('should display workshop catalog', async ({ page }) => {
    // Navigate to the catalog page
    await page.goto('/catalog/');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check for workshop cards or search input
    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toBeVisible();
  });

  test('should be able to search/filter workshops', async ({ page }) => {
    // Navigate to the catalog page
    await page.goto('/catalog/');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Look for search input
    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toBeVisible();
    
    // Test search functionality
    await searchInput.fill('azure');
    await page.waitForTimeout(500); // Wait for search to filter
    
    // Verify search input has the value
    await expect(searchInput).toHaveValue('azure');
  });

  test('should navigate to workshop list/catalog', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check if there's a link to browse all workshops or catalog
    const catalogLink = page.locator('a[href*="catalog"]').first();
    await expect(catalogLink).toBeVisible();
    
    await catalogLink.click();
    
    // Wait for navigation
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the catalog page
    expect(page.url()).toContain('catalog');
  });

  test('should display workshop cards or list items', async ({ page }) => {
    // Navigate to the catalog page
    await page.goto('/catalog/');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Wait a bit for workshops to load
    await page.waitForTimeout(1000);

    // Check for workshop cards - based on catalog component structure
    const workshopCards = page.locator('app-card');
    
    // There should be at least some workshop cards
    const count = await workshopCards.count();
    expect(count).toBeGreaterThan(0);
  });
});
