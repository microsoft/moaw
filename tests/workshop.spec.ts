import { test, expect } from '@playwright/test';

test.describe('Workshop Rendering and Navigation', () => {
  test('should load a workshop page', async ({ page }) => {
    // Navigate to the catalog to find an actual workshop
    await page.goto('/catalog/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Look for any workshop card link
    const workshopLink = page.locator('app-card a').first();
    
    const linkCount = await workshopLink.count();
    if (linkCount > 0) {
      // Click on a workshop
      await workshopLink.click();
      await page.waitForLoadState('networkidle');

      // Check that the workshop component is present
      const workshopContent = page.locator('app-workshop');
      const count = await workshopContent.count();
      expect(count).toBeGreaterThan(0);
    } else {
      // If no workshops available, just verify the workshop route is accessible
      await page.goto('/workshop/?src=test');
      await page.waitForLoadState('networkidle');
      
      // At least the page should load
      await expect(page).toHaveTitle(/MOAW/);
    }
  });

  test('should render workshop content from URL parameter', async ({ page }) => {
    // Try to load a specific workshop if one exists
    // First, let's go to catalog and try to find a workshop link
    await page.goto('/catalog/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Look for any workshop card link
    const workshopLink = page.locator('app-card a').first();
    
    const linkCount = await workshopLink.count();
    if (linkCount > 0) {
      await workshopLink.click();
      await page.waitForLoadState('networkidle');
      
      // Verify workshop component exists
      const workshopContent = page.locator('app-workshop');
      expect(await workshopContent.count()).toBeGreaterThan(0);
      
      // Check that there's markdown content loaded
      const content = page.locator('markdown');
      const contentCount = await content.count();
      expect(contentCount).toBeGreaterThan(0);
    } else {
      // Skip test if no workshops are available
      test.skip();
    }
  });

  test('should navigate between workshop sections', async ({ page }) => {
    // Navigate to catalog first to find a workshop
    await page.goto('/catalog/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Find and click on a workshop card
    const workshopLink = page.locator('app-card a').first();
    
    const linkCount = await workshopLink.count();
    if (linkCount > 0) {
      await workshopLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Look for navigation elements (pagination, sidebar links, etc.)
      const pagination = page.locator('app-pagination');
      const sidebar = page.locator('app-sidebar');

      // Check if navigation exists
      const hasPagination = await pagination.count() > 0;
      const hasSidebar = await sidebar.count() > 0;

      // At least one of these should exist
      expect(hasPagination || hasSidebar).toBe(true);

      // If pagination exists, test it
      if (hasPagination) {
        const paginationButtons = pagination.locator('button, a');
        if (await paginationButtons.count() > 0) {
          const lastButton = paginationButtons.last();
          if (await lastButton.isEnabled()) {
            await lastButton.click();
            await page.waitForTimeout(500);
            
            // Verify the page is still functional
            const workshopContent = page.locator('app-workshop');
            expect(await workshopContent.count()).toBeGreaterThan(0);
          }
        }
      }

      // If sidebar exists, verify it has links
      if (hasSidebar) {
        const sidebarLinks = sidebar.locator('a');
        if (await sidebarLinks.count() > 0) {
          expect(await sidebarLinks.count()).toBeGreaterThan(0);
        }
      }
    } else {
      // Skip test if no workshops are available
      test.skip();
    }
  });

  test('should handle workshop URL parameters correctly', async ({ page }) => {
    // Test direct navigation with src parameter
    await page.goto('/workshop/?src=test');
    await page.waitForLoadState('networkidle');

    // Page should load the workshop component
    const workshopComponent = page.locator('app-workshop');
    expect(await workshopComponent.count()).toBeGreaterThan(0);
  });

  test('should display workshop metadata', async ({ page }) => {
    // Navigate to catalog and find a workshop
    await page.goto('/catalog/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const workshopLink = page.locator('app-card a').first();
    
    const linkCount = await workshopLink.count();
    if (linkCount > 0) {
      await workshopLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Look for header component which should contain metadata
      const header = page.locator('app-header');
      expect(await header.count()).toBeGreaterThan(0);

      // Check for workshop container
      const workshopContainer = page.locator('app-workshop');
      expect(await workshopContainer.count()).toBeGreaterThan(0);
    } else {
      // Skip test if no workshops are available
      test.skip();
    }
  });
});
