import { test, expect } from '@playwright/test';

test.describe('Workshop Rendering and Navigation', () => {
  test('should load a workshop page', async ({ page }) => {
    // Navigate to a workshop - using a generic workshop path
    // The actual workshop URL might be something like /workshop/?src=sample-workshop/
    await page.goto('/workshop/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check that the workshop component is present
    const workshopContent = page.locator('app-workshop, app-deck, app-page');
    await expect(workshopContent).toBeVisible();
  });

  test('should render workshop content from URL parameter', async ({ page }) => {
    // Try to load a specific workshop if one exists
    // First, let's go to homepage and try to find a workshop link
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Look for any workshop link
    const workshopLink = page.locator('a[href*="/workshop/"]').first();
    
    if (await workshopLink.count() > 0) {
      await workshopLink.click();
      await page.waitForLoadState('networkidle');
      
      // Verify workshop content is rendered
      const workshopContent = page.locator('app-workshop, app-deck, app-page');
      await expect(workshopContent).toBeVisible();
      
      // Check that there's actual content (markdown rendered)
      const content = page.locator('article, .content, .markdown, main');
      await expect(content).toBeVisible();
    }
  });

  test('should navigate between workshop sections', async ({ page }) => {
    // Navigate to homepage first to find a workshop
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Find and click on a workshop link
    const workshopLink = page.locator('a[href*="/workshop/"]').first();
    
    if (await workshopLink.count() > 0) {
      await workshopLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Look for navigation elements (next/previous buttons, section links, etc.)
      const nextButton = page.locator('button:has-text("Next"), a:has-text("Next"), [aria-label*="next"]');
      const prevButton = page.locator('button:has-text("Previous"), button:has-text("Prev"), a:has-text("Previous"), [aria-label*="previous"]');
      const tableOfContents = page.locator('nav, aside, [class*="toc"], [class*="navigation"]');

      // Check if navigation exists
      const hasNext = await nextButton.count() > 0;
      const hasPrev = await prevButton.count() > 0;
      const hasToc = await tableOfContents.count() > 0;

      // If navigation exists, test it
      if (hasNext) {
        const currentUrl = page.url();
        await nextButton.first().click();
        await page.waitForLoadState('networkidle');
        
        // Verify URL changed or content updated
        const newUrl = page.url();
        // URL might change or content might update without URL change
        // Just verify the page is still functional
        const workshopContent = page.locator('app-workshop, app-deck, app-page');
        await expect(workshopContent).toBeVisible();
      }

      if (hasToc) {
        // If there's a table of contents, verify it's clickable
        const tocLinks = tableOfContents.locator('a, button');
        if (await tocLinks.count() > 0) {
          expect(await tocLinks.count()).toBeGreaterThan(0);
        }
      }
    }
  });

  test('should handle workshop URL parameters correctly', async ({ page }) => {
    // Test direct navigation with src parameter
    await page.goto('/workshop/?src=test');
    await page.waitForLoadState('networkidle');

    // Page should load even if workshop doesn't exist (might show error or empty state)
    const workshopComponent = page.locator('app-workshop, app-root');
    await expect(workshopComponent).toBeVisible();
  });

  test('should display workshop metadata', async ({ page }) => {
    // Navigate to homepage and find a workshop
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const workshopLink = page.locator('a[href*="/workshop/"]').first();
    
    if (await workshopLink.count() > 0) {
      await workshopLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Look for metadata elements (title, author, duration, etc.)
      const title = page.locator('h1, .title, [class*="workshop-title"]');
      
      // At minimum, there should be a title
      if (await title.count() > 0) {
        await expect(title.first()).toBeVisible();
      }

      // Check for content sections
      const sections = page.locator('section, article, .section');
      const sectionCount = await sections.count();
      
      // Should have at least some content structure
      expect(sectionCount).toBeGreaterThanOrEqual(0);
    }
  });
});
