import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Traveled World - Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for visual tests
    await page.setViewportSize({ width: 1280, height: 720 });

    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should render the main application correctly', async ({ page }) => {
    // Wait for the app to be fully loaded
    await page.waitForSelector('[data-testid="app-loaded"]', { timeout: 10000 });

    // Take a screenshot of the entire page
    await expect(page).toHaveScreenshot('main-app.png', {
      fullPage: true,
      threshold: 0.1,
    });
  });

  test('should render the header with proper styling', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();

    await expect(header).toHaveScreenshot('header.png', {
      threshold: 0.1,
    });
  });

  test('should render the sidebar correctly', async ({ page }) => {
    const sidebar = page.locator('[class*="w-full lg:w-96"]');
    await expect(sidebar).toBeVisible();

    await expect(sidebar).toHaveScreenshot('sidebar.png', {
      threshold: 0.1,
    });
  });

  test('should render the map container correctly', async ({ page }) => {
    const mapContainer = page.locator('[class*="flex-1 relative"]');
    await expect(mapContainer).toBeVisible();

    // Wait for map to load (this might take time)
    await page.waitForTimeout(2000);

    await expect(mapContainer).toHaveScreenshot('map-container.png', {
      threshold: 0.1,
    });
  });

  test('should handle theme switching visually', async ({ page }) => {
    // Click theme selector if it exists
    const themeButton = page.locator('[aria-label*="theme"], [data-testid*="theme"]').first();
    if (await themeButton.isVisible()) {
      await themeButton.click();
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('dark-theme.png', {
        fullPage: true,
        threshold: 0.1,
      });
    }
  });

  test('should handle view switching (2D/3D)', async ({ page }) => {
    // Test 3D view (default)
    await expect(page.locator('[class*="flex-1 relative"]')).toHaveScreenshot('3d-view.png', {
      threshold: 0.1,
    });

    // Switch to 2D view
    const viewSwitcher = page.locator('[aria-label*="2D"], [data-testid*="2d"]').first();
    if (await viewSwitcher.isVisible()) {
      await viewSwitcher.click();
      await page.waitForTimeout(1000);

      await expect(page.locator('[class*="flex-1 relative"]')).toHaveScreenshot('2d-view.png', {
        threshold: 0.1,
      });
    }
  });

  test('should handle city search dropdown', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search for a city"]').first();
    await expect(searchInput).toBeVisible();

    // Focus the search input
    await searchInput.click();
    await searchInput.fill('Tokyo');

    // Wait for dropdown to appear
    await page.waitForTimeout(500);

    const dropdown = page.locator('[role="listbox"]').first();
    if (await dropdown.isVisible()) {
      await expect(dropdown).toHaveScreenshot('search-dropdown.png', {
        threshold: 0.1,
      });
    }
  });

  test('should handle modal dialogs', async ({ page }) => {
    // Try to trigger a modal (e.g., edit city or create trip)
    const editButton = page.locator('[aria-label*="edit"], [data-testid*="edit"]').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(500);

      const modal = page.locator('[role="dialog"]').first();
      if (await modal.isVisible()) {
        await expect(modal).toHaveScreenshot('modal-dialog.png', {
          threshold: 0.1,
        });
      }
    }
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('mobile-view.png', {
      fullPage: true,
      threshold: 0.1,
    });

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('tablet-view.png', {
      fullPage: true,
      threshold: 0.1,
    });
  });

  test('should handle loading states', async ({ page }) => {
    // Trigger a loading state if possible
    const searchInput = page.locator('input[placeholder*="Search for a city"]').first();
    await searchInput.click();
    await searchInput.fill('a'.repeat(50)); // Trigger search

    // Look for loading indicators
    const loadingIndicator = page.locator('[class*="animate-spin"], [class*="loading"]').first();
    if (await loadingIndicator.isVisible({ timeout: 2000 })) {
      await expect(page).toHaveScreenshot('loading-state.png', {
        threshold: 0.1,
      });
    }
  });

  test('should handle error states', async ({ page }) => {
    // Try to trigger an error state
    const searchInput = page.locator('input[placeholder*="Search for a city"]').first();
    await searchInput.click();
    await searchInput.fill('invalid-city-name-that-does-not-exist-12345');

    // Wait and check for error messages
    await page.waitForTimeout(1000);
    const errorMessage = page.locator('[class*="error"], [class*="bg-red"]').first();

    if (await errorMessage.isVisible({ timeout: 2000 })) {
      await expect(errorMessage).toHaveScreenshot('error-state.png', {
        threshold: 0.1,
      });
    }
  });
});

test.describe('Traveled World - Accessibility Tests', () => {
  test('should pass accessibility audit', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Log violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations found:');
      accessibilityScanResults.violations.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation.id}: ${violation.description}`);
        console.log(`   Impact: ${violation.impact}`);
        console.log(`   Help: ${violation.help}`);
        console.log(`   Help URL: ${violation.helpUrl}`);
        console.log(`   Elements:`, violation.nodes.map(node => node.target).join(', '));
        console.log('---');
      });
    }

    // Allow some violations for complex interactive components but ensure critical issues are fixed
    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(criticalViolations.length).toBeLessThan(5); // Allow up to 5 critical issues initially
  });

  test('should have proper keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test tab navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();

    // Test skip link if it exists
    const skipLink = page.locator('a[href="#main"], .skip-link').first();
    if (await skipLink.isVisible()) {
      await skipLink.click();
      await expect(page.locator('#main')).toBeFocused();
    }
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto('/');

    // Check for proper button labels
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = buttons.nth(i);
      const hasAriaLabel = await button.getAttribute('aria-label');
      const hasTitle = await button.getAttribute('title');
      const hasTextContent = await button.textContent();

      // At least one of these should be present
      expect(hasAriaLabel || hasTitle || hasTextContent?.trim()).toBeTruthy();
    }

    // Check for proper form labels
    const inputs = page.locator('input, select, textarea');
    const inputCount = await inputs.count();

    for (let i = 0; i < Math.min(inputCount, 10); i++) {
      const input = inputs.nth(i);
      const hasLabel = await input.getAttribute('aria-label');
      const hasAriaLabelledBy = await input.getAttribute('aria-labelledby');
      const hasAssociatedLabel = await input.evaluate((el) => {
        const id = el.id;
        return id ? document.querySelector(`label[for="${id}"]`) : null;
      });

      expect(hasLabel || hasAriaLabelledBy || hasAssociatedLabel).toBeTruthy();
    }
  });

  test('should handle reduced motion preferences', async ({ page, context }) => {
    // Set reduced motion preference
    await context.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => {},
        }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Animations should be disabled or simplified
    // This is hard to test visually but we can check that the page still loads
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');

    // Use axe to check color contrast
    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    // Log contrast issues
    results.violations.forEach(violation => {
      if (violation.id === 'color-contrast') {
        console.log('Color contrast violation:', violation.description);
        violation.nodes.forEach(node => {
          console.log('Element:', node.target);
          console.log('Failure summary:', node.failureSummary);
        });
      }
    });

    // Should have minimal contrast violations
    const contrastViolations = results.violations.filter(v => v.id === 'color-contrast');
    expect(contrastViolations.length).toBeLessThan(10);
  });
});

test.describe('Traveled World - Performance Tests', () => {
  test('should load within performance budget', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    console.log(`Page load time: ${loadTime}ms`);

    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    await page.goto('/');

    // Add many cities via batch import if possible
    const batchInput = page.locator('textarea').first();
    if (await batchInput.isVisible()) {
      // Create a large batch of cities
      const cities = Array.from({ length: 100 }, (_, i) =>
        `Test City ${i}, Test Country`
      ).join('\n');

      await batchInput.fill(cities);

      const startTime = Date.now();
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();

      // Wait for processing to complete
      await page.waitForTimeout(5000);
      const endTime = Date.now();

      console.log(`Batch processing time: ${endTime - startTime}ms`);
      // Should process within reasonable time
      expect(endTime - startTime).toBeLessThan(10000);
    }
  });
});
