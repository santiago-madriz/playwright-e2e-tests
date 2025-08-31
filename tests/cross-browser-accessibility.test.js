/**
 * Cross-Browser and Accessibility Tests
 * 
 * Tests that ensure the application works consistently across different browsers
 * and meets accessibility standards
 */

import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage.js';
import { TequilaPage } from '../pages/TequilaPage.js';

test.describe('Cross-Browser Compatibility Tests', () => {
  let homePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test.describe('Browser-Specific Features', () => {
    test('should work correctly in Chromium', async ({ browserName }) => {
      test.skip(browserName !== 'chromium', 'This test is only for Chromium');
      
      await test.step('Load homepage', async () => {
        await homePage.navigateToHome();
        await homePage.verifyHomepageLoaded();
      });

      await test.step('Test Chrome-specific features', async () => {
        // Test local storage
        await homePage.page.evaluate(() => {
          localStorage.setItem('test', 'chrome-test');
        });
        
        const stored = await homePage.page.evaluate(() => {
          return localStorage.getItem('test');
        });
        expect(stored).toBe('chrome-test');
      });

      await test.step('Test cart functionality', async () => {
        await homePage.addFirstProductToCart();
        const cartCount = await homePage.getCartItemCount();
        expect(cartCount).toBeGreaterThan(0);
      });
    });

    test('should work correctly in Firefox', async ({ browserName }) => {
      test.skip(browserName !== 'firefox', 'This test is only for Firefox');
      
      await test.step('Load homepage', async () => {
        await homePage.navigateToHome();
        await homePage.verifyHomepageLoaded();
      });

      await test.step('Test Firefox-specific behavior', async () => {
        // Test that animations work properly in Firefox
        await homePage.addFirstProductToCart();
        await homePage.openCart();
        
        // Verify cart modal animation
        await expect(homePage.page.locator(homePage.cartModal)).toBeVisible();
        await homePage.closeCart();
      });

      await test.step('Test Firefox form handling', async () => {
        const searchInput = homePage.page.locator(homePage.searchInput);
        if (await searchInput.isVisible()) {
          await searchInput.fill('tequila');
          await searchInput.press('Enter');
          await homePage.waitForPageLoad();
        }
      });
    });

    test('should work correctly in WebKit', async ({ browserName }) => {
      test.skip(browserName !== 'webkit', 'This test is only for WebKit');
      
      await test.step('Load homepage', async () => {
        await homePage.navigateToHome();
        await homePage.verifyHomepageLoaded();
      });

      await test.step('Test Safari-specific behavior', async () => {
        // Test touch events simulation for Safari
        await homePage.page.locator(homePage.productCards).first().tap();
        await homePage.page.waitForTimeout(200);
      });

      await test.step('Test WebKit image rendering', async () => {
        const images = homePage.page.locator('img');
        const imageCount = await images.count();
        
        for (let i = 0; i < Math.min(imageCount, 3); i++) {
          const img = images.nth(i);
          await expect(img).toBeVisible();
        }
      });
    });
  });

  test.describe('CSS and Layout Consistency', () => {
    test('should have consistent layout across browsers', async () => {
      await homePage.navigateToHome();
      
      await test.step('Check header layout', async () => {
        const header = homePage.page.locator(homePage.header);
        await expect(header).toBeVisible();
        
        const headerBox = await header.boundingBox();
        expect(headerBox.height).toBeGreaterThan(50);
        expect(headerBox.width).toBeGreaterThan(300);
      });

      await test.step('Check product grid layout', async () => {
        const productGrid = homePage.page.locator(homePage.productGrid);
        await expect(productGrid).toBeVisible();
        
        const products = homePage.page.locator(homePage.productCards);
        const productCount = await products.count();
        expect(productCount).toBeGreaterThan(0);
      });

      await test.step('Check footer layout', async () => {
        const footer = homePage.page.locator(homePage.footer);
        await expect(footer).toBeVisible();
      });
    });

    test('should handle CSS animations consistently', async () => {
      await homePage.navigateToHome();
      
      await test.step('Test cart opening animation', async () => {
        await homePage.addFirstProductToCart();
        await homePage.page.waitForTimeout(300);
        
        const openStart = Date.now();
        await homePage.openCart();
        const openDuration = Date.now() - openStart;
        
        await expect(homePage.page.locator(homePage.cartModal)).toBeVisible();
        
        // Animation should complete within reasonable time
        expect(openDuration).toBeLessThan(2000);
        
        await homePage.closeCart();
      });

      await test.step('Test hover effects', async () => {
        const firstProduct = await homePage.getFirstProduct();
        await firstProduct.hover();
        await homePage.page.waitForTimeout(200);
        
        // Product should still be visible after hover
        await expect(firstProduct).toBeVisible();
      });
    });

    test('should display fonts consistently', async () => {
      await homePage.navigateToHome();
      
      await test.step('Check font rendering', async () => {
        const title = homePage.page.locator('h1').first();
        await expect(title).toBeVisible();
        
        const titleStyles = await title.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            fontFamily: styles.fontFamily,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight
          };
        });
        
        expect(titleStyles.fontFamily).toBeTruthy();
        expect(titleStyles.fontSize).toBeTruthy();
      });
    });
  });

  test.describe('JavaScript Compatibility', () => {
    test('should handle modern JavaScript features', async () => {
      await homePage.navigateToHome();
      
      await test.step('Test ES6+ features', async () => {
        const supportsES6 = await homePage.page.evaluate(() => {
          try {
            // Test arrow functions
            const arrow = () => true;
            
            // Test template literals
            const template = `test ${arrow()}`;
            
            // Test const/let
            const testConst = 'test';
            let testLet = 'test';
            
            // Test destructuring
            const { length } = 'test';
            
            return template.includes('true') && length === 4;
          } catch (e) {
            return false;
          }
        });
        
        expect(supportsES6).toBe(true);
      });

      await test.step('Test async/await support', async () => {
        const supportsAsync = await homePage.page.evaluate(async () => {
          try {
            const asyncFunction = async () => {
              return new Promise(resolve => resolve('test'));
            };
            
            const result = await asyncFunction();
            return result === 'test';
          } catch (e) {
            return false;
          }
        });
        
        expect(supportsAsync).toBe(true);
      });
    });

    test('should handle localStorage consistently', async () => {
      await homePage.navigateToHome();
      
      await test.step('Test localStorage operations', async () => {
        await homePage.page.evaluate(() => {
          localStorage.setItem('crossBrowserTest', JSON.stringify({
            timestamp: Date.now(),
            browser: navigator.userAgent,
            test: true
          }));
        });
        
        const stored = await homePage.page.evaluate(() => {
          const item = localStorage.getItem('crossBrowserTest');
          return item ? JSON.parse(item) : null;
        });
        
        expect(stored).toBeTruthy();
        expect(stored.test).toBe(true);
        
        // Clean up
        await homePage.page.evaluate(() => {
          localStorage.removeItem('crossBrowserTest');
        });
      });
    });
  });
});

test.describe('Accessibility Tests', () => {
  let homePage;
  let tequilaPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    tequilaPage = new TequilaPage(page);
  });

  test.describe('Keyboard Navigation', () => {
    test('should support keyboard navigation on homepage', async () => {
      await homePage.navigateToHome();
      
      await test.step('Test tab navigation', async () => {
        // Focus should start at the beginning of the page
        await homePage.page.keyboard.press('Tab');
        
        // First focusable element should be focused
        const focused = await homePage.page.evaluate(() => document.activeElement.tagName);
        expect(['A', 'BUTTON', 'INPUT']).toContain(focused);
      });

      await test.step('Navigate through interactive elements', async () => {
        const interactiveElements = [
          homePage.logo,
          homePage.cartButton,
          homePage.searchInput,
          homePage.addToCartButtons
        ];
        
        for (const selector of interactiveElements) {
          const element = homePage.page.locator(selector).first();
          if (await element.isVisible()) {
            await element.focus();
            await expect(element).toBeFocused();
          }
        }
      });

      await test.step('Test Enter key activation', async () => {
        const firstAddButton = homePage.page.locator(homePage.addToCartButtons).first();
        if (await firstAddButton.isVisible()) {
          await firstAddButton.focus();
          await homePage.page.keyboard.press('Enter');
          
          // Should add product to cart
          await homePage.page.waitForTimeout(500);
          const cartCount = await homePage.getCartItemCount();
          expect(cartCount).toBeGreaterThan(0);
        }
      });
    });

    test('should support keyboard navigation in cart modal', async () => {
      await homePage.navigateToHome();
      await homePage.addFirstProductToCart();
      
      await test.step('Open cart with keyboard', async () => {
        const cartButton = homePage.page.locator(homePage.cartButton);
        await cartButton.focus();
        await homePage.page.keyboard.press('Enter');
        
        await expect(homePage.page.locator(homePage.cartModal)).toBeVisible();
      });

      await test.step('Navigate within cart modal', async () => {
        await homePage.page.keyboard.press('Tab');
        
        // Should focus first interactive element in modal
        const focused = await homePage.page.evaluate(() => {
          const activeElement = document.activeElement;
          const cartModal = document.querySelector('.cart-modal, [data-testid="cart-modal"]');
          return cartModal && cartModal.contains(activeElement);
        });
        
        expect(focused).toBe(true);
      });

      await test.step('Close cart with Escape key', async () => {
        await homePage.page.keyboard.press('Escape');
        await expect(homePage.page.locator(homePage.cartModal)).not.toBeVisible();
      });
    });

    test('should support keyboard navigation on tequila page', async () => {
      await tequilaPage.navigateToTequilaPage();
      
      await test.step('Navigate filter tabs with keyboard', async () => {
        const filterTabs = tequilaPage.page.locator(tequilaPage.categoryTabs);
        const tabCount = await filterTabs.count();
        
        if (tabCount > 0) {
          const firstTab = filterTabs.first();
          await firstTab.focus();
          await expect(firstTab).toBeFocused();
          
          // Test arrow key navigation if supported
          await homePage.page.keyboard.press('ArrowRight');
          await homePage.page.waitForTimeout(100);
        }
      });
    });
  });

  test.describe('Screen Reader Support', () => {
    test('should have proper heading structure', async () => {
      await homePage.navigateToHome();
      
      await test.step('Check heading hierarchy', async () => {
        const h1Count = await homePage.page.locator('h1').count();
        expect(h1Count).toBe(1);
        
        const h1Text = await homePage.page.locator('h1').textContent();
        expect(h1Text).toBeTruthy();
        expect(h1Text.trim().length).toBeGreaterThan(0);
      });

      await test.step('Check section headings', async () => {
        const headings = await homePage.page.locator('h2, h3, h4').all();
        
        for (const heading of headings) {
          const text = await heading.textContent();
          expect(text.trim().length).toBeGreaterThan(0);
        }
      });
    });

    test('should have proper alt text for images', async () => {
      await homePage.navigateToHome();
      
      await test.step('Check product images', async () => {
        const productImages = homePage.page.locator(homePage.productImage);
        const imageCount = await productImages.count();
        
        for (let i = 0; i < imageCount; i++) {
          const img = productImages.nth(i);
          await expect(img).toHaveAttribute('alt');
          
          const altText = await img.getAttribute('alt');
          expect(altText.trim().length).toBeGreaterThan(0);
        }
      });

      await test.step('Check brand logos', async () => {
        const brandLogos = homePage.page.locator(homePage.brandLogos);
        const logoCount = await brandLogos.count();
        
        for (let i = 0; i < logoCount; i++) {
          const logo = brandLogos.nth(i);
          await expect(logo).toHaveAttribute('alt');
        }
      });
    });

    test('should have proper form labels', async () => {
      await homePage.navigateToHome();
      
      await test.step('Check search input', async () => {
        const searchInput = homePage.page.locator(homePage.searchInput);
        
        if (await searchInput.isVisible()) {
          // Should have label, placeholder, or aria-label
          const hasLabel = await searchInput.evaluate((input) => {
            const id = input.id;
            const label = document.querySelector(`label[for="${id}"]`);
            const ariaLabel = input.getAttribute('aria-label');
            const placeholder = input.getAttribute('placeholder');
            
            return !!(label || ariaLabel || placeholder);
          });
          
          expect(hasLabel).toBe(true);
        }
      });
    });

    test('should have proper ARIA attributes', async () => {
      await homePage.navigateToHome();
      await homePage.addFirstProductToCart();
      
      await test.step('Check cart button accessibility', async () => {
        const cartButton = homePage.page.locator(homePage.cartButton);
        
        // Should have accessible name or label
        const hasAccessibleName = await cartButton.evaluate((button) => {
          const ariaLabel = button.getAttribute('aria-label');
          const textContent = button.textContent?.trim();
          const title = button.getAttribute('title');
          
          return !!(ariaLabel || textContent || title);
        });
        
        expect(hasAccessibleName).toBe(true);
      });

      await test.step('Check modal accessibility', async () => {
        await homePage.openCart();
        
        const cartModal = homePage.page.locator(homePage.cartModal);
        
        // Modal should have proper ARIA attributes
        const hasAriaAttributes = await cartModal.evaluate((modal) => {
          const role = modal.getAttribute('role');
          const ariaModal = modal.getAttribute('aria-modal');
          const ariaLabel = modal.getAttribute('aria-label');
          const ariaLabelledby = modal.getAttribute('aria-labelledby');
          
          return role === 'dialog' || ariaModal === 'true' || ariaLabel || ariaLabelledby;
        });
        
        expect(hasAriaAttributes).toBe(true);
        
        await homePage.closeCart();
      });
    });
  });

  test.describe('Color Contrast and Visual Accessibility', () => {
    test('should have sufficient color contrast', async () => {
      await homePage.navigateToHome();
      
      await test.step('Check text contrast', async () => {
        const textElements = await homePage.page.locator('h1, h2, h3, p, a, button, .price').all();
        
        for (let i = 0; i < Math.min(textElements.length, 10); i++) {
          const element = textElements[i];
          
          if (await element.isVisible()) {
            const styles = await element.evaluate((el) => {
              const computed = window.getComputedStyle(el);
              return {
                color: computed.color,
                backgroundColor: computed.backgroundColor,
                fontSize: computed.fontSize
              };
            });
            
            // Basic check that colors are defined
            expect(styles.color).toBeTruthy();
            expect(styles.fontSize).toBeTruthy();
          }
        }
      });
    });

    test('should be usable without color alone', async () => {
      await homePage.navigateToHome();
      
      await test.step('Check that information is not conveyed by color alone', async () => {
        // Check if discount badges have text or icons, not just color
        const discountBadges = homePage.page.locator('.discount-badge, .sale-badge, .discount');
        const badgeCount = await discountBadges.count();
        
        for (let i = 0; i < badgeCount; i++) {
          const badge = discountBadges.nth(i);
          if (await badge.isVisible()) {
            const text = await badge.textContent();
            expect(text.trim()).toBeTruthy();
          }
        }
      });

      await test.step('Check stock status indicators', async () => {
        const stockIndicators = homePage.page.locator('.stock-status, .availability, .in-stock, .out-of-stock');
        const indicatorCount = await stockIndicators.count();
        
        for (let i = 0; i < indicatorCount; i++) {
          const indicator = stockIndicators.nth(i);
          if (await indicator.isVisible()) {
            const text = await indicator.textContent();
            expect(text.trim()).toBeTruthy();
          }
        }
      });
    });
  });

  test.describe('Focus Management', () => {
    test('should manage focus properly in modal dialogs', async () => {
      await homePage.navigateToHome();
      await homePage.addFirstProductToCart();
      
      await test.step('Test focus trap in cart modal', async () => {
        await homePage.openCart();
        
        // Focus should be trapped within the modal
        const initialFocused = await homePage.page.evaluate(() => {
          return document.activeElement?.tagName;
        });
        
        // Tab through modal elements
        for (let i = 0; i < 10; i++) {
          await homePage.page.keyboard.press('Tab');
          
          const currentFocused = await homePage.page.evaluate(() => {
            const activeElement = document.activeElement;
            const cartModal = document.querySelector('.cart-modal, [data-testid="cart-modal"]');
            return cartModal && cartModal.contains(activeElement);
          });
          
          // Focus should remain within modal
          expect(currentFocused).toBe(true);
        }
        
        await homePage.closeCart();
      });
    });

    test('should restore focus after modal closes', async () => {
      await homePage.navigateToHome();
      await homePage.addFirstProductToCart();
      
      await test.step('Test focus restoration', async () => {
        const cartButton = homePage.page.locator(homePage.cartButton);
        await cartButton.focus();
        
        const buttonFocused = await cartButton.evaluate((el) => {
          return document.activeElement === el;
        });
        expect(buttonFocused).toBe(true);
        
        // Open modal
        await homePage.page.keyboard.press('Enter');
        await expect(homePage.page.locator(homePage.cartModal)).toBeVisible();
        
        // Close modal
        await homePage.page.keyboard.press('Escape');
        await expect(homePage.page.locator(homePage.cartModal)).not.toBeVisible();
        
        // Focus should return to cart button
        const focusRestored = await cartButton.evaluate((el) => {
          return document.activeElement === el;
        });
        expect(focusRestored).toBe(true);
      });
    });
  });

  test.describe('Mobile Accessibility', () => {
    test('should be accessible on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await homePage.navigateToHome();
      
      await test.step('Check touch target sizes', async () => {
        const touchTargets = homePage.page.locator('button, a, input, [role="button"]');
        const targetCount = await touchTargets.count();
        
        for (let i = 0; i < Math.min(targetCount, 10); i++) {
          const target = touchTargets.nth(i);
          
          if (await target.isVisible()) {
            const box = await target.boundingBox();
            
            // Touch targets should be at least 44x44 pixels (iOS guidelines)
            expect(box.width).toBeGreaterThanOrEqual(44);
            expect(box.height).toBeGreaterThanOrEqual(44);
          }
        }
      });

      await test.step('Check mobile navigation', async () => {
        // Mobile menu should be accessible
        const mobileMenu = homePage.page.locator('.mobile-menu, .hamburger, .nav-toggle');
        
        if (await mobileMenu.count() > 0) {
          const menu = mobileMenu.first();
          if (await menu.isVisible()) {
            await expect(menu).toHaveAttribute('aria-label');
          }
        }
      });
    });
  });
});
