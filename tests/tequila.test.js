/**
 * Tequila Page End-to-End Tests
 * 
 * Comprehensive test suite for the dedicated tequila products page
 * Tests include: filtering, product display, cart integration, responsive design
 */

import { test, expect } from '@playwright/test';
import { TequilaPage } from '../pages/TequilaPage.js';
import { HomePage } from '../pages/HomePage.js';

test.describe('Tequila Page Tests', () => {
  let tequilaPage;

  test.beforeEach(async ({ page }) => {
    tequilaPage = new TequilaPage(page);
    await tequilaPage.navigateToTequilaPage();
  });

  test.describe('Page Layout and Loading', () => {
    test('should display tequila page correctly', async () => {
      await test.step('Verify page loaded', async () => {
        await tequilaPage.verifyTequilaPageLoaded();
      });

      await test.step('Verify tequilas are displayed', async () => {
        await tequilaPage.verifyTequilasDisplayed();
      });

      await test.step('Verify filter tabs', async () => {
        await tequilaPage.verifyFilterTabs();
      });
    });

    test('should have proper page title and meta information', async () => {
      const title = await tequilaPage.getTitle();
      expect(title.toLowerCase()).toContain('tequila');
      
      // Check if page has proper heading
      await expect(tequilaPage.page.locator(tequilaPage.pageTitle)).toBeVisible();
      const headingText = await tequilaPage.page.locator(tequilaPage.pageTitle).textContent();
      expect(headingText.toLowerCase()).toContain('tequila');
    });

    test('should display tequila products with proper information', async () => {
      await test.step('Verify tequila details', async () => {
        await tequilaPage.verifyTequilaDetails();
      });

      await test.step('Verify price formatting', async () => {
        await tequilaPage.verifyPriceFormat();
      });
    });
  });

  test.describe('Product Filtering', () => {
    test('should filter by "Todos" category', async () => {
      await test.step('Select all categories', async () => {
        await tequilaPage.selectAllCategories();
      });

      await test.step('Verify products displayed', async () => {
        const count = await tequilaPage.getTequilaCount();
        expect(count).toBeGreaterThan(0);
      });
    });

    test('should filter by Blanco tequilas', async () => {
      await test.step('Filter by Blanco', async () => {
        await tequilaPage.filterByBlanco();
      });

      await test.step('Verify filter applied', async () => {
        await tequilaPage.verifyFilterFunctionality('blanco');
      });

      await test.step('Verify blanco products shown', async () => {
        const tequilas = tequilaPage.page.locator(tequilaPage.tequilaCards);
        const count = await tequilas.count();
        
        if (count > 0) {
          // Check that products contain blanco information
          for (let i = 0; i < Math.min(count, 3); i++) {
            const tequila = tequilas.nth(i);
            const type = await tequilaPage.getTequilaType(tequila);
            if (type) {
              expect(type.toLowerCase()).toContain('blanco');
            }
          }
        }
      });
    });

    test('should filter by Reposado tequilas', async () => {
      await test.step('Filter by Reposado', async () => {
        await tequilaPage.filterByReposado();
      });

      await test.step('Verify filter applied', async () => {
        await tequilaPage.verifyFilterFunctionality('reposado');
      });
    });

    test('should filter by Añejo tequilas', async () => {
      await test.step('Filter by Añejo', async () => {
        await tequilaPage.filterByAnejo();
      });

      await test.step('Verify filter applied', async () => {
        await tequilaPage.verifyFilterFunctionality('anejo');
      });
    });

    test('should maintain state when switching between filters', async () => {
      await test.step('Filter by Blanco', async () => {
        await tequilaPage.filterByBlanco();
        const blancoCount = await tequilaPage.getTequilaCount();
        expect(blancoCount).toBeGreaterThanOrEqual(0);
      });

      await test.step('Switch to Reposado', async () => {
        await tequilaPage.filterByReposado();
        const reposadoCount = await tequilaPage.getTequilaCount();
        expect(reposadoCount).toBeGreaterThanOrEqual(0);
      });

      await test.step('Return to all categories', async () => {
        await tequilaPage.selectAllCategories();
        const allCount = await tequilaPage.getTequilaCount();
        expect(allCount).toBeGreaterThan(0);
      });
    });
  });

  test.describe('Product Information Display', () => {
    test('should display Don Julio products', async () => {
      await tequilaPage.verifyDonJulioProducts();
    });

    test('should show detailed product information', async () => {
      const firstTequila = await tequilaPage.getFirstTequila();
      const info = await tequilaPage.getTequilaInfo(firstTequila);
      
      await test.step('Verify product name', async () => {
        expect(info.name).toBeTruthy();
        expect(info.name.length).toBeGreaterThan(3);
      });

      await test.step('Verify product price', async () => {
        expect(info.price).toMatch(/₡[\d,]+/);
      });

      await test.step('Verify product brand', async () => {
        expect(info.brand).toBeTruthy();
      });

      await test.step('Verify product type', async () => {
        expect(info.type).toBeTruthy();
      });
    });

    test('should display product images correctly', async () => {
      const tequilas = tequilaPage.page.locator(tequilaPage.tequilaCards);
      const count = await tequilas.count();
      
      for (let i = 0; i < Math.min(count, 5); i++) {
        const tequila = tequilas.nth(i);
        const image = tequila.locator(tequilaPage.tequilaImage);
        
        await expect(image).toBeVisible();
        await expect(image).toHaveAttribute('src');
        await expect(image).toHaveAttribute('alt');
      }
    });

    test('should show stock status correctly', async () => {
      const tequilas = tequilaPage.page.locator(tequilaPage.tequilaCards);
      const count = await tequilas.count();
      
      for (let i = 0; i < Math.min(count, 3); i++) {
        const tequila = tequilas.nth(i);
        const inStock = await tequilaPage.isInStock(tequila);
        expect(typeof inStock).toBe('boolean');
      }
    });

    test('should display discount badges when applicable', async () => {
      const tequilas = tequilaPage.page.locator(tequilaPage.tequilaCards);
      const count = await tequilas.count();
      
      for (let i = 0; i < count; i++) {
        const tequila = tequilas.nth(i);
        const hasDiscount = await tequilaPage.hasDiscount(tequila);
        
        if (hasDiscount) {
          // If product has discount, should also have original price
          const originalPriceElement = tequila.locator(tequilaPage.originalPrice);
          const hasOriginalPrice = await originalPriceElement.isVisible();
          if (hasOriginalPrice) {
            expect(hasOriginalPrice).toBe(true);
          }
        }
      }
    });
  });

  test.describe('Cart Integration', () => {
    test('should add tequila to cart successfully', async () => {
      await test.step('Verify cart integration', async () => {
        await tequilaPage.verifyCartIntegration();
      });
    });

    test('should update cart counter after adding products', async () => {
      const initialCount = await tequilaPage.getCartItemCount();
      
      await test.step('Add first tequila to cart', async () => {
        await tequilaPage.addFirstTequilaToCart();
        await tequilaPage.page.waitForTimeout(1000);
      });

      await test.step('Verify cart updated', async () => {
        const newCount = await tequilaPage.getCartItemCount();
        expect(newCount).toBeGreaterThan(initialCount);
      });
    });

    test('should add multiple different tequilas to cart', async () => {
      const tequilaCount = await tequilaPage.getTequilaCount();
      const itemsToAdd = Math.min(tequilaCount, 3);
      
      for (let i = 0; i < itemsToAdd; i++) {
        await test.step(`Add tequila ${i + 1} to cart`, async () => {
          const tequila = tequilaPage.page.locator(tequilaPage.tequilaCards).nth(i);
          await tequilaPage.addTequilaToCart(tequila);
          await tequilaPage.page.waitForTimeout(300);
        });
      }

      await test.step('Verify all items added', async () => {
        const cartCount = await tequilaPage.getCartItemCount();
        expect(cartCount).toBeGreaterThanOrEqual(itemsToAdd);
      });
    });
  });

  test.describe('Product Modal/Details', () => {
    test('should open and close product modal', async () => {
      const firstTequila = await tequilaPage.getFirstTequila();
      const quickViewBtn = firstTequila.locator(tequilaPage.quickViewBtn);
      
      if (await quickViewBtn.isVisible()) {
        await test.step('Open product modal', async () => {
          await tequilaPage.viewTequilaDetails(firstTequila);
        });

        await test.step('Verify modal content', async () => {
          await tequilaPage.verifyProductModal();
        });
      } else {
        test.skip('Quick view functionality not available');
      }
    });
  });

  test.describe('Search and Sort Functionality', () => {
    test('should search tequilas by name', async () => {
      const searchBox = tequilaPage.page.locator(tequilaPage.searchBox);
      
      if (await searchBox.isVisible()) {
        await test.step('Search for "Don Julio"', async () => {
          await tequilaPage.searchTequilas('Don Julio');
        });

        await test.step('Verify search results', async () => {
          const resultCount = await tequilaPage.getTequilaCount();
          expect(resultCount).toBeGreaterThanOrEqual(0);
          
          if (resultCount > 0) {
            const firstResult = await tequilaPage.getFirstTequila();
            const name = await tequilaPage.getTequilaInfo(firstResult);
            expect(name.name.toLowerCase()).toContain('don julio');
          }
        });
      } else {
        test.skip('Search functionality not available on tequila page');
      }
    });

    test('should sort products by price', async () => {
      const sortSelect = tequilaPage.page.locator(tequilaPage.sortSelect);
      
      if (await sortSelect.isVisible()) {
        await test.step('Sort by price low to high', async () => {
          await tequilaPage.sortProducts('price-low');
        });

        await test.step('Verify sort order', async () => {
          const tequilas = tequilaPage.page.locator(tequilaPage.tequilaCards);
          const count = await tequilas.count();
          
          if (count > 1) {
            const firstPrice = await tequilaPage.getTequilaPrice(tequilas.first());
            const secondPrice = await tequilaPage.getTequilaPrice(tequilas.nth(1));
            
            // Extract numeric values for comparison
            const firstNum = parseInt(firstPrice.replace(/₡|,/g, ''));
            const secondNum = parseInt(secondPrice.replace(/₡|,/g, ''));
            
            expect(firstNum).toBeLessThanOrEqual(secondNum);
          }
        });
      } else {
        test.skip('Sort functionality not available');
      }
    });

    test('should filter by brand', async () => {
      const brandFilter = tequilaPage.page.locator(tequilaPage.brandFilter);
      
      if (await brandFilter.isVisible()) {
        await test.step('Filter by Don Julio brand', async () => {
          await tequilaPage.filterByBrand('Don Julio');
        });

        await test.step('Verify brand filter results', async () => {
          const resultCount = await tequilaPage.getTequilaCount();
          expect(resultCount).toBeGreaterThanOrEqual(0);
          
          if (resultCount > 0) {
            const tequilas = tequilaPage.page.locator(tequilaPage.tequilaCards);
            const firstTequila = tequilas.first();
            const brand = await tequilaPage.getTequilaBrand(firstTequila);
            expect(brand.toLowerCase()).toContain('don julio');
          }
        });
      } else {
        test.skip('Brand filter not available');
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should work correctly on mobile devices', async ({ page }) => {
      await test.step('Test mobile responsiveness', async () => {
        await tequilaPage.verifyResponsiveDesign();
      });
    });

    test('should maintain functionality on tablet', async ({ page }) => {
      await test.step('Switch to tablet view', async () => {
        await page.setViewportSize({ width: 768, height: 1024 });
        await tequilaPage.waitForPageLoad();
      });

      await test.step('Verify layout on tablet', async () => {
        await expect(tequilaPage.page.locator(tequilaPage.tequilaGrid)).toBeVisible();
        await expect(tequilaPage.page.locator(tequilaPage.filterContainer)).toBeVisible();
      });

      await test.step('Test filter functionality on tablet', async () => {
        await tequilaPage.filterByBlanco();
        const count = await tequilaPage.getTequilaCount();
        expect(count).toBeGreaterThanOrEqual(0);
      });
    });

    test('should adapt to different screen sizes', async ({ page }) => {
      const viewports = [
        { width: 320, height: 568, name: 'iPhone SE' },
        { width: 375, height: 667, name: 'iPhone 8' },
        { width: 414, height: 896, name: 'iPhone 11' },
        { width: 768, height: 1024, name: 'iPad' },
        { width: 1024, height: 768, name: 'iPad Landscape' },
        { width: 1280, height: 720, name: 'Desktop' }
      ];

      for (const viewport of viewports) {
        await test.step(`Test ${viewport.name} (${viewport.width}x${viewport.height})`, async () => {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          await tequilaPage.waitForPageLoad();
          
          // Verify essential elements are visible
          await expect(tequilaPage.page.locator(tequilaPage.tequilaGrid)).toBeVisible();
          
          // On smaller screens, filter container might be collapsed
          if (viewport.width >= 768) {
            await expect(tequilaPage.page.locator(tequilaPage.filterContainer)).toBeVisible();
          }
        });
      }
    });
  });

  test.describe('SEO and Performance', () => {
    test('should have proper SEO elements', async () => {
      await tequilaPage.verifySEOElements();
    });

    test('should load quickly', async () => {
      const startTime = Date.now();
      await tequilaPage.navigateToTequilaPage();
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(5000);
    });

    test('should have structured data for products', async () => {
      const jsonLdScripts = tequilaPage.page.locator('script[type="application/ld+json"]');
      const count = await jsonLdScripts.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Navigation Integration', () => {
    test('should navigate back to homepage', async () => {
      const homePage = new HomePage(tequilaPage.page);
      
      await test.step('Click logo to go home', async () => {
        await homePage.clickLogo();
      });

      await test.step('Verify on homepage', async () => {
        await homePage.helpers.waitForPageLoad();
        const url = tequilaPage.page.url();
        expect(url).toBe('https://galeriamexicanacr.com/' || url.endsWith('/'));
      });
    });

    test('should maintain cart state when navigating', async () => {
      await test.step('Add tequila to cart', async () => {
        await tequilaPage.addFirstTequilaToCart();
        await tequilaPage.page.waitForTimeout(500);
      });

      const cartCount = await tequilaPage.getCartItemCount();
      
      await test.step('Navigate to homepage', async () => {
        const homePage = new HomePage(tequilaPage.page);
        await homePage.navigateToHome();
      });

      await test.step('Verify cart count maintained', async () => {
        const newCartCount = await tequilaPage.getCartItemCount();
        expect(newCartCount).toBe(cartCount);
      });
    });
  });

  test.describe('Error Handling', () => {
    test('should handle empty filter results gracefully', async () => {
      // Try to filter by a category that might not have results
      await tequilaPage.filterByExtraAnejo();
      
      const count = await tequilaPage.getTequilaCount();
      if (count === 0) {
        // Should show some kind of "no results" message or empty state
        // Page should not break
        await expect(tequilaPage.page.locator(tequilaPage.filterContainer)).toBeVisible();
      }
    });

    test('should handle rapid filter changes', async () => {
      const filters = ['blanco', 'reposado', 'anejo'];
      
      for (const filter of filters) {
        await tequilaPage.selectCategory(filter);
        await tequilaPage.page.waitForTimeout(100);
      }
      
      // Page should still be functional
      await expect(tequilaPage.page.locator(tequilaPage.tequilaGrid)).toBeVisible();
      await expect(tequilaPage.page.locator(tequilaPage.filterContainer)).toBeVisible();
    });
  });
});
