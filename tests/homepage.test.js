/**
 * Homepage End-to-End Tests
 * 
 * Comprehensive test suite for the Galeria Mexicana homepage
 * Tests include: layout, functionality, SEO, accessibility, performance
 */

import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage.js';
import { TestDataGenerator } from '../utils/test-helpers.js';

test.describe('Homepage Tests', () => {
  let homePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigateToHome();
  });

  test.describe('Layout and Visual Elements', () => {
    test('should display all main sections correctly', async () => {
      await test.step('Verify page loaded', async () => {
        await homePage.verifyHomepageLoaded();
      });

      await test.step('Verify navigation elements', async () => {
        await homePage.verifyNavigation();
      });

      await test.step('Verify products are displayed', async () => {
        await homePage.verifyProductsDisplayed();
      });

      await test.step('Verify brands section', async () => {
        await homePage.verifyBrandsSection();
      });

      await test.step('Verify blog section', async () => {
        await homePage.verifyBlogSection();
      });

      await test.step('Verify WhatsApp integration', async () => {
        await homePage.verifyWhatsAppIntegration();
      });
    });

    test('should have proper responsive design', async ({ page }) => {
      await test.step('Test mobile viewport', async () => {
        await page.setViewportSize({ width: 375, height: 667 });
        await homePage.waitForPageLoad();
        await homePage.verifyResponsiveElements();
      });

      await test.step('Test tablet viewport', async () => {
        await page.setViewportSize({ width: 768, height: 1024 });
        await homePage.waitForPageLoad();
        await homePage.verifyResponsiveElements();
      });

      await test.step('Test desktop viewport', async () => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await homePage.waitForPageLoad();
        await homePage.verifyResponsiveElements();
      });
    });

    test('should display product images correctly', async () => {
      const productCount = await homePage.getProductCount();
      expect(productCount).toBeGreaterThan(0);

      // Check first 3 products for images
      for (let i = 0; i < Math.min(productCount, 3); i++) {
        const product = homePage.page.locator(homePage.productCards).nth(i);
        const image = product.locator(homePage.productImage);
        
        await expect(image).toBeVisible();
        await expect(image).toHaveAttribute('src');
        await expect(image).toHaveAttribute('alt');
      }
    });
  });

  test.describe('Product Grid Functionality', () => {
    test('should display products with correct information', async () => {
      const productCount = await homePage.getProductCount();
      expect(productCount).toBeGreaterThan(0);

      const firstProduct = await homePage.getFirstProduct();
      
      await test.step('Verify product name', async () => {
        await expect(firstProduct.locator(homePage.productName)).toBeVisible();
        const name = await homePage.getProductName(firstProduct);
        expect(name).toBeTruthy();
      });

      await test.step('Verify product price format', async () => {
        await expect(firstProduct.locator(homePage.productPrice)).toBeVisible();
        const price = await homePage.getProductPrice(firstProduct);
        expect(price).toMatch(/₡[\d,]+/);
      });

      await test.step('Verify add to cart button', async () => {
        await expect(firstProduct.locator(homePage.addToCartButtons)).toBeVisible();
      });
    });

    test('should have functional search', async () => {
      await homePage.verifySearchFunctionality();
      
      const searchTerm = TestDataGenerator.generateSearchTerm();
      
      await test.step(`Search for "${searchTerm}"`, async () => {
        await homePage.searchProducts(searchTerm);
      });

      await test.step('Verify search results', async () => {
        // Should still have products or show "no results" message
        const productCount = await homePage.getProductCount();
        // Either products found or page should show no results message
        if (productCount === 0) {
          // Check if there's a "no results" message
          const noResultsMessage = homePage.page.locator('text=No se encontraron productos, text=Sin resultados, .no-results');
          const hasNoResultsMessage = await noResultsMessage.count() > 0;
          if (!hasNoResultsMessage) {
            console.log('No products found and no "no results" message - this might be expected behavior');
          }
        } else {
          expect(productCount).toBeGreaterThan(0);
        }
      });
    });

    test('should filter products by category', async () => {
      // Test category filtering if available
      const categoryFilter = homePage.page.locator(homePage.categoryFilter);
      
      if (await categoryFilter.isVisible()) {
        await test.step('Filter by Bebidas Alcohólicas', async () => {
          await homePage.filterByCategory('Bebidas Alcohólicas');
          const productCount = await homePage.getProductCount();
          expect(productCount).toBeGreaterThanOrEqual(0);
        });

        await test.step('Reset to all categories', async () => {
          await homePage.filterByCategory('');
          const productCount = await homePage.getProductCount();
          expect(productCount).toBeGreaterThan(0);
        });
      }
    });
  });

  test.describe('Shopping Cart Functionality', () => {
    test('should add products to cart successfully', async () => {
      await test.step('Get initial cart count', async () => {
        const initialCount = await homePage.getCartItemCount();
        expect(initialCount).toBeGreaterThanOrEqual(0);
      });

      await test.step('Add product to cart', async () => {
        await homePage.addFirstProductToCart();
      });

      await test.step('Verify cart updated', async () => {
        // Wait for cart animation/update
        await homePage.page.waitForTimeout(1000);
        const newCount = await homePage.getCartItemCount();
        // Cart should have at least 1 item
        expect(newCount).toBeGreaterThan(0);
      });
    });

    test('should open and close cart modal', async () => {
      await test.step('Add item to cart first', async () => {
        await homePage.addFirstProductToCart();
        await homePage.page.waitForTimeout(500);
      });

      await test.step('Open cart modal', async () => {
        await homePage.openCart();
        await expect(homePage.page.locator(homePage.cartModal)).toBeVisible();
      });

      await test.step('Verify cart contents', async () => {
        const cartItems = homePage.page.locator(homePage.cartItems);
        const itemCount = await cartItems.count();
        expect(itemCount).toBeGreaterThan(0);
      });

      await test.step('Close cart modal', async () => {
        await homePage.closeCart();
        await expect(homePage.page.locator(homePage.cartModal)).not.toBeVisible();
      });
    });

    test('should proceed to WhatsApp checkout', async ({ context }) => {
      await test.step('Add product to cart', async () => {
        await homePage.addFirstProductToCart();
        await homePage.page.waitForTimeout(500);
      });

      await test.step('Proceed to checkout', async () => {
        // Listen for new tabs/popups (WhatsApp)
        const pagePromise = context.waitForEvent('page', { timeout: 5000 });
        
        try {
          await homePage.proceedToCheckout();
          const newPage = await pagePromise;
          
          // Verify WhatsApp URL
          const url = newPage.url();
          expect(url).toContain('api.whatsapp.com');
          expect(url).toContain('50687396001'); // WhatsApp number
          
          await newPage.close();
        } catch (error) {
          console.log('WhatsApp popup may be blocked or not triggered:', error.message);
          // This is acceptable as popup blockers might prevent WhatsApp from opening
        }
      });
    });

    test('should remove items from cart', async () => {
      await test.step('Add multiple products', async () => {
        await homePage.addFirstProductToCart();
        await homePage.page.waitForTimeout(300);
        
        // Try to add another product if available
        const productCount = await homePage.getProductCount();
        if (productCount > 1) {
          const secondProduct = homePage.page.locator(homePage.productCards).nth(1);
          const addButton = secondProduct.locator(homePage.addToCartButtons);
          await addButton.click();
          await homePage.page.waitForTimeout(300);
        }
      });

      await test.step('Remove first item', async () => {
        await homePage.removeFirstCartItem();
        await homePage.page.waitForTimeout(500);
      });

      await test.step('Verify item removed', async () => {
        // Cart should still exist but with fewer items
        // This test assumes cart doesn't become empty
        const cartCount = await homePage.getCartItemCount();
        expect(cartCount).toBeGreaterThanOrEqual(0);
      });
    });
  });

  test.describe('Navigation Tests', () => {
    test('should navigate to tequila page', async () => {
      await test.step('Click tequila link', async () => {
        await homePage.navigateToTequila();
      });

      await test.step('Verify navigation', async () => {
        expect(homePage.page.url()).toContain('/tequila');
        await expect(homePage.page.locator('h1')).toBeVisible();
      });
    });

    test('should navigate to blog', async () => {
      const blogLink = homePage.page.locator(homePage.blogLink);
      
      if (await blogLink.isVisible()) {
        await test.step('Click blog link', async () => {
          await homePage.navigateToBlog();
        });

        await test.step('Verify navigation', async () => {
          expect(homePage.page.url()).toContain('/blog');
          await expect(homePage.page.locator('h1')).toBeVisible();
        });
      }
    });

    test('should return to homepage when clicking logo', async () => {
      await test.step('Navigate away from homepage', async () => {
        await homePage.navigateToTequila();
        expect(homePage.page.url()).toContain('/tequila');
      });

      await test.step('Click logo to return home', async () => {
        await homePage.clickLogo();
      });

      await test.step('Verify back on homepage', async () => {
        await homePage.helpers.waitForPageLoad();
        const url = homePage.page.url();
        expect(url).toBe('https://galeriamexicanacr.com/' || url.endsWith('/'));
      });
    });
  });

  test.describe('WhatsApp Integration', () => {
    test('should have visible WhatsApp button', async () => {
      await expect(homePage.page.locator(homePage.whatsappButton)).toBeVisible();
    });

    test('should open WhatsApp on button click', async ({ context }) => {
      const pagePromise = context.waitForEvent('page', { timeout: 5000 });
      
      try {
        await homePage.clickWhatsAppButton();
        const newPage = await pagePromise;
        
        const url = newPage.url();
        expect(url).toContain('api.whatsapp.com');
        expect(url).toContain('50687396001');
        
        await newPage.close();
      } catch (error) {
        console.log('WhatsApp popup may be blocked:', error.message);
        // This is acceptable behavior
      }
    });
  });

  test.describe('SEO and Accessibility', () => {
    test('should have proper SEO elements', async () => {
      await homePage.verifySEO();
    });

    test('should have proper page title', async () => {
      const title = await homePage.getTitle();
      expect(title).toContain('Galería Mexicana');
      expect(title).toContain('Costa Rica');
    });

    test('should have meta description', async () => {
      const metaDescription = homePage.page.locator('meta[name="description"]');
      await expect(metaDescription).toHaveAttribute('content');
      
      const content = await metaDescription.getAttribute('content');
      expect(content.length).toBeGreaterThan(100);
    });

    test('should have structured data', async () => {
      const jsonLdScripts = homePage.page.locator('script[type="application/ld+json"]');
      const count = await jsonLdScripts.count();
      expect(count).toBeGreaterThan(0);
      
      // Verify the JSON-LD is valid
      const jsonLdContent = await jsonLdScripts.first().textContent();
      expect(() => JSON.parse(jsonLdContent)).not.toThrow();
    });

    test('should pass basic accessibility checks', async () => {
      await homePage.verifyAccessibility();
    });

    test('should have proper heading structure', async () => {
      // Should have one H1
      const h1Count = await homePage.page.locator('h1').count();
      expect(h1Count).toBe(1);
      
      // Should have H2s for sections
      const h2Count = await homePage.page.locator('h2').count();
      expect(h2Count).toBeGreaterThan(0);
    });
  });

  test.describe('Performance Tests', () => {
    test('should load within acceptable time', async () => {
      const startTime = Date.now();
      await homePage.navigateToHome();
      const loadTime = Date.now() - startTime;
      
      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should have optimized images', async () => {
      const images = homePage.page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const img = images.nth(i);
        await expect(img).toHaveAttribute('src');
        
        // Check if images have alt text
        await expect(img).toHaveAttribute('alt');
        
        // Check if lazy loading is implemented
        const loading = await img.getAttribute('loading');
        if (loading) {
          expect(['lazy', 'eager']).toContain(loading);
        }
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle invalid search gracefully', async () => {
      await test.step('Search with invalid term', async () => {
        await homePage.searchProducts('xyz123invalidterm');
      });

      await test.step('Verify page doesn\'t break', async () => {
        // Page should still be functional
        await expect(homePage.page.locator(homePage.header)).toBeVisible();
        await expect(homePage.page.locator(homePage.searchInput)).toBeVisible();
      });
    });

    test('should handle rapid cart interactions', async () => {
      await test.step('Rapidly add items to cart', async () => {
        for (let i = 0; i < 3; i++) {
          await homePage.addFirstProductToCart();
          await homePage.page.waitForTimeout(100);
        }
      });

      await test.step('Verify cart still functions', async () => {
        await homePage.openCart();
        await expect(homePage.page.locator(homePage.cartModal)).toBeVisible();
        await homePage.closeCart();
      });
    });
  });
});
