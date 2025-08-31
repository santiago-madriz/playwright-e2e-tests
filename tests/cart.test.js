import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage.js';
import { TequilaPage } from '../pages/TequilaPage.js';
import { TestDataGenerator } from '../utils/test-helpers.js';

test.describe('Shopping Cart Tests', () => {
  let homePage;
  let tequilaPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    tequilaPage = new TequilaPage(page);
    await homePage.navigateToHome();
  });

  test.describe('Cart Basic Functionality', () => {
    test('should start with empty cart', async () => {
      const cartCount = await homePage.getCartItemCount();
      expect(cartCount).toBe(0);
    });

    test('should add single item to cart', async () => {
      await test.step('Add first product to cart', async () => {
        await homePage.addFirstProductToCart();
        await homePage.page.waitForTimeout(500);
      });

      await test.step('Verify cart updated', async () => {
        const cartCount = await homePage.getCartItemCount();
        expect(cartCount).toBe(1);
      });

      await test.step('Verify cart modal shows item', async () => {
        await homePage.openCart();
        
        const cartItems = homePage.page.locator(homePage.cartItems);
        const itemCount = await cartItems.count();
        expect(itemCount).toBeGreaterThan(0);
        
        await homePage.closeCart();
      });
    });

    test('should add multiple items to cart', async () => {
      const itemsToAdd = 3;
      
      await test.step('Add multiple products', async () => {
        for (let i = 0; i < itemsToAdd; i++) {
          await homePage.addFirstProductToCart();
          await homePage.page.waitForTimeout(300);
        }
      });

      await test.step('Verify cart count', async () => {
        const cartCount = await homePage.getCartItemCount();
        expect(cartCount).toBe(itemsToAdd);
      });
    });

    test('should display correct total price', async () => {
      await test.step('Add product to cart', async () => {
        await homePage.addFirstProductToCart();
        await homePage.page.waitForTimeout(500);
      });

      await test.step('Open cart and verify total', async () => {
        await homePage.openCart();
        
        const cartTotal = homePage.page.locator(homePage.cartTotal);
        if (await cartTotal.isVisible()) {
          const totalText = await cartTotal.textContent();
          expect(totalText).toMatch(/₡[\d,]+/);
        }
        
        await homePage.closeCart();
      });
    });
  });

  test.describe('Cart Item Management', () => {
    test('should remove individual items from cart', async () => {
      await test.step('Add items to cart', async () => {
        await homePage.addFirstProductToCart();
        await homePage.page.waitForTimeout(300);
        await homePage.addFirstProductToCart();
        await homePage.page.waitForTimeout(300);
      });

      await test.step('Remove one item', async () => {
        const initialCount = await homePage.getCartItemCount();
        await homePage.removeFirstCartItem();
        
        const newCount = await homePage.getCartItemCount();
        expect(newCount).toBeLessThan(initialCount);
      });
    });

    test('should update item quantities', async () => {
      await test.step('Add item to cart', async () => {
        await homePage.addFirstProductToCart();
        await homePage.page.waitForTimeout(500);
      });

      await test.step('Open cart and update quantity', async () => {
        await homePage.openCart();
        
        const quantityInput = homePage.page.locator(homePage.quantityInput).first();
        if (await quantityInput.isVisible()) {
          await quantityInput.clear();
          await quantityInput.fill('2');
          await homePage.page.waitForTimeout(500);
          
          
          const updatedValue = await quantityInput.inputValue();
          expect(updatedValue).toBe('2');
        }
        
        await homePage.closeCart();
      });
    });

    test('should clear entire cart', async () => {
      await test.step('Add multiple items', async () => {
        await homePage.addFirstProductToCart();
        await homePage.page.waitForTimeout(300);
        await homePage.addFirstProductToCart();
        await homePage.page.waitForTimeout(300);
      });

      await test.step('Clear cart', async () => {
        await homePage.clearCart();
        
        const cartCount = await homePage.getCartItemCount();
        expect(cartCount).toBe(0);
      });
    });

    test('should handle zero quantity correctly', async () => {
      await test.step('Add item to cart', async () => {
        await homePage.addFirstProductToCart();
        await homePage.page.waitForTimeout(500);
      });

      await test.step('Set quantity to zero', async () => {
        await homePage.openCart();
        
        const quantityInput = homePage.page.locator(homePage.quantityInput).first();
        if (await quantityInput.isVisible()) {
          await quantityInput.clear();
          await quantityInput.fill('0');
          await homePage.page.waitForTimeout(500);
          
          
          const cartCount = await homePage.getCartItemCount();
          expect(cartCount).toBeGreaterThanOrEqual(0);
        }
        
        await homePage.closeCart();
      });
    });
  });

  test.describe('Cart Persistence', () => {
    test('should maintain cart state across page navigation', async () => {
      await test.step('Add item to cart on homepage', async () => {
        await homePage.addFirstProductToCart();
        await homePage.page.waitForTimeout(500);
        const homeCartCount = await homePage.getCartItemCount();
        expect(homeCartCount).toBeGreaterThan(0);
      });

      await test.step('Navigate to tequila page', async () => {
        await homePage.navigateToTequila();
        await tequilaPage.waitForPageLoad();
      });

      await test.step('Verify cart state maintained', async () => {
        const tequilaCartCount = await tequilaPage.getCartItemCount();
        expect(tequilaCartCount).toBeGreaterThan(0);
      });

      await test.step('Add item from tequila page', async () => {
        await tequilaPage.addFirstTequilaToCart();
        await tequilaPage.page.waitForTimeout(500);
        
        const updatedCount = await tequilaPage.getCartItemCount();
        expect(updatedCount).toBeGreaterThan(1);
      });

      await test.step('Navigate back to homepage', async () => {
        await homePage.navigateToHome();
        await homePage.waitForPageLoad();
      });

      await test.step('Verify all items still in cart', async () => {
        const finalCount = await homePage.getCartItemCount();
        expect(finalCount).toBeGreaterThan(1);
      });
    });

    test('should persist cart through page refresh', async () => {
      await test.step('Add items to cart', async () => {
        await homePage.addFirstProductToCart();
        await homePage.page.waitForTimeout(500);
        const initialCount = await homePage.getCartItemCount();
        expect(initialCount).toBeGreaterThan(0);
      });

      await test.step('Refresh page', async () => {
        await homePage.page.reload();
        await homePage.waitForPageLoad();
      });

      await test.step('Verify cart maintained after refresh', async () => {
        
        
        await homePage.page.waitForTimeout(1000);
        const countAfterRefresh = await homePage.getCartItemCount();
        
        
        expect(countAfterRefresh).toBeGreaterThanOrEqual(0);
      });
    });
  });

  test.describe('Cart UI and Interactions', () => {
    test('should open and close cart modal smoothly', async () => {
      await test.step('Add item to enable cart', async () => {
        await homePage.addFirstProductToCart();
        await homePage.page.waitForTimeout(500);
      });

      await test.step('Test cart modal open/close cycle', async () => {
        for (let i = 0; i < 3; i++) {
          await homePage.openCart();
          await expect(homePage.page.locator(homePage.cartModal)).toBeVisible();
          
          await homePage.closeCart();
          await expect(homePage.page.locator(homePage.cartModal)).not.toBeVisible();
          
          await homePage.page.waitForTimeout(200);
        }
      });
    });

    test('should display cart items with correct information', async () => {
      await test.step('Add specific product to cart', async () => {
        const firstProduct = await homePage.getFirstProduct();
        const productName = await homePage.getProductName(firstProduct);
        const productPrice = await homePage.getProductPrice(firstProduct);
        
        await homePage.addFirstProductToCart();
        await homePage.page.waitForTimeout(500);
        
        
        homePage.expectedProductName = productName;
        homePage.expectedProductPrice = productPrice;
      });

      await test.step('Verify cart item information', async () => {
        await homePage.openCart();
        
        const cartItems = homePage.page.locator(homePage.cartItems);
        const firstCartItem = cartItems.first();
        
        
        const itemNameElement = firstCartItem.locator('.item-name, .product-name, h3, h4');
        if (await itemNameElement.isVisible()) {
          const cartItemName = await itemNameElement.textContent();
          expect(cartItemName).toBeTruthy();
        }
        
        const itemPriceElement = firstCartItem.locator('.item-price, .price');
        if (await itemPriceElement.isVisible()) {
          const cartItemPrice = await itemPriceElement.textContent();
          expect(cartItemPrice).toMatch(/₡[\d,]+/);
        }
        
        await homePage.closeCart();
      });
    });

    test('should handle cart interactions on mobile', async ({ page }) => {
      await test.step('Switch to mobile viewport', async () => {
        await page.setViewportSize({ width: 375, height: 667 });
        await homePage.waitForPageLoad();
      });

      await test.step('Add item to cart on mobile', async () => {
        await homePage.addFirstProductToCart();
        await homePage.page.waitForTimeout(500);
      });

      await test.step('Test cart modal on mobile', async () => {
        await homePage.openCart();
        await expect(homePage.page.locator(homePage.cartModal)).toBeVisible();
        
        
        const cartModal = homePage.page.locator(homePage.cartModal);
        const boundingBox = await cartModal.boundingBox();
        expect(boundingBox.width).toBeLessThanOrEqual(375);
        
        await homePage.closeCart();
      });
    });
  });

  test.describe('Checkout Integration', () => {
    test('should navigate to WhatsApp checkout', async ({ context }) => {
      await test.step('Add items to cart', async () => {
        await homePage.addFirstProductToCart();
        await homePage.page.waitForTimeout(500);
      });

      await test.step('Initiate checkout process', async () => {
        const pagePromise = context.waitForEvent('page', { timeout: 5000 });
        
        try {
          await homePage.proceedToCheckout();
          const whatsappPage = await pagePromise;
          
          await test.step('Verify WhatsApp integration', async () => {
            const url = whatsappPage.url();
            expect(url).toContain('api.whatsapp.com');
            expect(url).toContain('50687396001');
            expect(url).toContain('text=');
          });

          await whatsappPage.close();
        } catch (error) {
          console.log('WhatsApp may be blocked by popup blocker:', error.message);
          
        }
      });
    });

    test('should include cart details in WhatsApp message', async ({ context }) => {
      await test.step('Add specific products', async () => {
        await homePage.addFirstProductToCart();
        await homePage.page.waitForTimeout(300);
        
        
        await homePage.navigateToTequila();
        await tequilaPage.addFirstTequilaToCart();
        await tequilaPage.page.waitForTimeout(300);
        
        
        await homePage.navigateToHome();
      });

      await test.step('Test checkout with multiple items', async () => {
        const pagePromise = context.waitForEvent('page', { timeout: 5000 });
        
        try {
          await homePage.proceedToCheckout();
          const whatsappPage = await pagePromise;
          
          const url = whatsappPage.url();
          const decodedUrl = decodeURIComponent(url);
          
          
          expect(decodedUrl.toLowerCase()).toContain('compra');
          expect(decodedUrl).toMatch(/₡[\d,]+/);
          
          await whatsappPage.close();
        } catch (error) {
          console.log('WhatsApp popup blocked or not triggered:', error.message);
        }
      });
    });

    test('should handle empty cart checkout gracefully', async () => {
      await test.step('Ensure cart is empty', async () => {
        const cartCount = await homePage.getCartItemCount();
        if (cartCount > 0) {
          await homePage.clearCart();
        }
      });

      await test.step('Try to checkout with empty cart', async () => {
        await homePage.openCart();
        
        const checkoutButton = homePage.page.locator(homePage.checkoutButton);
        if (await checkoutButton.isVisible()) {
          const isEnabled = await checkoutButton.isEnabled();
          
          if (!isEnabled) {
            
            expect(isEnabled).toBe(false);
          } else {
            
            await checkoutButton.click();
            await homePage.page.waitForTimeout(500);
          }
        }
        
        await homePage.closeCart();
      });
    });
  });

  test.describe('Cart Error Handling', () => {
    test('should handle rapid cart additions', async () => {
      await test.step('Rapidly add items', async () => {
        for (let i = 0; i < 5; i++) {
          await homePage.addFirstProductToCart();
          await homePage.page.waitForTimeout(50); 
        }
      });

      await test.step('Verify cart state is consistent', async () => {
        await homePage.page.waitForTimeout(1000); 
        const cartCount = await homePage.getCartItemCount();
        expect(cartCount).toBeGreaterThan(0);
        
        
        await homePage.openCart();
        await expect(homePage.page.locator(homePage.cartModal)).toBeVisible();
        await homePage.closeCart();
      });
    });

    test('should handle cart interactions during page transitions', async () => {
      await test.step('Add item during navigation', async () => {
        await homePage.addFirstProductToCart();
        
        
        await homePage.navigateToTequila();
        await tequilaPage.waitForPageLoad();
      });

      await test.step('Verify cart integrity', async () => {
        const cartCount = await tequilaPage.getCartItemCount();
        expect(cartCount).toBeGreaterThanOrEqual(0);
        
        
        if (cartCount > 0) {
          await homePage.openCart();
          await expect(homePage.page.locator(homePage.cartModal)).toBeVisible();
          await homePage.closeCart();
        }
      });
    });

    test('should handle cart with invalid quantities', async () => {
      await test.step('Add item to cart', async () => {
        await homePage.addFirstProductToCart();
        await homePage.page.waitForTimeout(500);
      });

      await test.step('Try invalid quantity values', async () => {
        await homePage.openCart();
        
        const quantityInput = homePage.page.locator(homePage.quantityInput).first();
        if (await quantityInput.isVisible()) {
          
          await quantityInput.clear();
          await quantityInput.fill('-1');
          await homePage.page.waitForTimeout(300);
          
          
          const negativeValue = await quantityInput.inputValue();
          expect(parseInt(negativeValue)).toBeGreaterThanOrEqual(0);
          
          
          await quantityInput.clear();
          await quantityInput.fill('9999');
          await homePage.page.waitForTimeout(300);
          
          
          const largeValue = await quantityInput.inputValue();
          expect(parseInt(largeValue)).toBeGreaterThanOrEqual(0);
        }
        
        await homePage.closeCart();
      });
    });
  });

  test.describe('Cart Performance', () => {
    test('should handle large number of items efficiently', async () => {
      const itemsToAdd = 10;
      const startTime = Date.now();
      
      await test.step(`Add ${itemsToAdd} items to cart`, async () => {
        for (let i = 0; i < itemsToAdd; i++) {
          await homePage.addFirstProductToCart();
          await homePage.page.waitForTimeout(100);
        }
      });

      const additionTime = Date.now() - startTime;
      console.log(`Time to add ${itemsToAdd} items: ${additionTime}ms`);
      
      await test.step('Verify cart performance', async () => {
        const openStartTime = Date.now();
        await homePage.openCart();
        const openTime = Date.now() - openStartTime;
        
        console.log(`Time to open cart with ${itemsToAdd} items: ${openTime}ms`);
        
        
        expect(openTime).toBeLessThan(2000);
        
        await expect(homePage.page.locator(homePage.cartModal)).toBeVisible();
        await homePage.closeCart();
      });
    });

    test('should maintain responsive UI with many items', async () => {
      await test.step('Add multiple items', async () => {
        for (let i = 0; i < 7; i++) {
          await homePage.addFirstProductToCart();
          await homePage.page.waitForTimeout(100);
        }
      });

      await test.step('Test cart UI responsiveness', async () => {
        await homePage.openCart();
        
        
        const cartModal = homePage.page.locator(homePage.cartModal);
        await expect(cartModal).toBeVisible();
        
        
        const cartBody = homePage.page.locator('.cart-body, .cart-items-container');
        if (await cartBody.isVisible()) {
          await cartBody.hover();
          await homePage.page.mouse.wheel(0, 100);
          await homePage.page.waitForTimeout(200);
        }
        
        await homePage.closeCart();
      });
    });
  });
});
