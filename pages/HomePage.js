/**
 * Homepage Page Object Model
 * 
 * Represents the main landing page of Galeria Mexicana
 * Contains all selectors and actions for the homepage
 */

import { expect } from '@playwright/test';
import { BasePage } from '../utils/test-helpers.js';

export class HomePage extends BasePage {
  constructor(page) {
    super(page);
    
    // Header selectors
    this.header = '#unified-header';
    this.logo = 'img[alt*="Galería Mexicana"]';
    this.cartButton = '[data-testid="cart-button"], .cart-icon, [class*="cart"]';
    this.cartCounter = '.cart-counter, [data-testid="cart-counter"]';
    
    // Navigation selectors
    this.navMenu = '.nav-menu, [data-testid="nav-menu"]';
    this.tequilaLink = 'a[href="/tequila"], a[href*="tequila"]';
    this.blogLink = 'a[href="/blog"], a[href*="blog"]';
    this.adminLink = 'a[href="/admin"], a[href*="admin"]';
    
    // Banner selectors
    this.banner = '.banner, [data-testid="banner"]';
    this.bannerTitle = '.banner h1, .banner-title';
    this.bannerSubtitle = '.banner-subtitle, .banner p';
    
    // Product grid selectors
    this.productGrid = '.product-grid, [data-testid="product-grid"]';
    this.productCards = '.product-card, [data-testid="product-card"]';
    this.productName = '.product-name, .product-title';
    this.productPrice = '.product-price, .price';
    this.productImage = '.product-image img';
    this.addToCartButtons = '.add-to-cart, [data-testid="add-to-cart"]';
    
    // Filter selectors
    this.filterContainer = '.product-filter, [data-testid="filter"]';
    this.categoryFilter = '.category-filter, select[name="category"]';
    this.searchInput = '.search-input, input[type="search"], input[placeholder*="buscar"]';
    this.searchButton = '.search-button, [data-testid="search-btn"]';
    this.sortSelect = '.sort-select, select[name="sort"]';
    
    // Brands section selectors
    this.brandsSection = '.brands-section, [data-testid="brands"]';
    this.brandLogos = '.brand-logo, .brands-section img';
    
    // Blog section selectors
    this.blogSection = '.blog-section, [data-testid="blog-section"]';
    this.blogPosts = '.blog-post, .blog-card';
    this.blogTitles = '.blog-title, .blog-post h3';
    
    // Footer selectors
    this.footer = 'footer, .footer';
    this.footerLinks = 'footer a, .footer a';
    this.socialLinks = '.social-links a, [data-testid="social-link"]';
    
    // WhatsApp floating button
    this.whatsappButton = '.whatsapp-float, [data-testid="whatsapp"], .floating-whatsapp';
    
    // Cart modal selectors
    this.cartModal = '.cart-modal, [data-testid="cart-modal"]';
    this.cartItems = '.cart-item, [data-testid="cart-item"]';
    this.cartTotal = '.cart-total, [data-testid="cart-total"]';
    this.checkoutButton = '.checkout-btn, [data-testid="checkout"]';
    this.cartCloseButton = '.cart-close, [data-testid="cart-close"]';
    this.removeItemButton = '.remove-item, [data-testid="remove-item"]';
    this.quantityInput = '.quantity-input, input[type="number"]';
    this.clearCartButton = '.clear-cart, [data-testid="clear-cart"]';
  }

  // Navigation actions
  async navigateToHome() {
    await this.navigate('/');
    await this.waitForPageLoad();
  }

  async clickLogo() {
    await this.helpers.safeClick(this.logo);
  }

  async navigateToTequila() {
    await this.helpers.safeClick(this.tequilaLink);
    await this.helpers.waitForPageLoad();
  }

  async navigateToBlog() {
    await this.helpers.safeClick(this.blogLink);
    await this.helpers.waitForPageLoad();
  }

  // Product interactions
  async getProductCount() {
    const products = this.page.locator(this.productCards);
    return await products.count();
  }

  async getFirstProduct() {
    return this.page.locator(this.productCards).first();
  }

  async getProductByName(name) {
    return this.page.locator(this.productCards).filter({ hasText: name });
  }

  async addFirstProductToCart() {
    const firstProduct = await this.getFirstProduct();
    const addButton = firstProduct.locator(this.addToCartButtons);
    await addButton.click();
    await this.page.waitForTimeout(500); // Wait for cart animation
  }

  async addProductToCartByName(productName) {
    const product = await this.getProductByName(productName);
    const addButton = product.locator(this.addToCartButtons);
    await addButton.click();
    await this.page.waitForTimeout(500);
  }

  async getProductPrice(productElement) {
    const priceElement = productElement.locator(this.productPrice);
    return await priceElement.textContent();
  }

  async getProductName(productElement) {
    const nameElement = productElement.locator(this.productName);
    return await nameElement.textContent();
  }

  // Search and filter actions
  async searchProducts(searchTerm) {
    await this.helpers.safeFill(this.searchInput, searchTerm);
    
    // Try to click search button if it exists, otherwise press Enter
    if (await this.helpers.elementExists(this.searchButton)) {
      await this.helpers.safeClick(this.searchButton);
    } else {
      await this.page.locator(this.searchInput).press('Enter');
    }
    
    await this.helpers.waitForPageLoad();
  }

  async filterByCategory(category) {
    const categorySelect = this.page.locator(this.categoryFilter);
    if (await categorySelect.isVisible()) {
      await categorySelect.selectOption(category);
      await this.helpers.waitForPageLoad();
    }
  }

  async sortProducts(sortOption) {
    const sortSelect = this.page.locator(this.sortSelect);
    if (await sortSelect.isVisible()) {
      await sortSelect.selectOption(sortOption);
      await this.helpers.waitForPageLoad();
    }
  }

  // Cart actions
  async openCart() {
    await this.helpers.safeClick(this.cartButton);
    await this.helpers.waitForElement(this.cartModal);
  }

  async closeCart() {
    await this.helpers.safeClick(this.cartCloseButton);
    await this.helpers.waitForElementToDisappear(this.cartModal);
  }

  async getCartItemCount() {
    const counter = this.page.locator(this.cartCounter);
    if (await counter.isVisible()) {
      const text = await counter.textContent();
      return parseInt(text) || 0;
    }
    return 0;
  }

  async getCartTotal() {
    const total = this.page.locator(this.cartTotal);
    return await total.textContent();
  }

  async removeFirstCartItem() {
    await this.openCart();
    const removeButton = this.page.locator(this.removeItemButton).first();
    await removeButton.click();
    await this.page.waitForTimeout(300);
  }

  async clearCart() {
    await this.openCart();
    const clearButton = this.page.locator(this.clearCartButton);
    if (await clearButton.isVisible()) {
      await clearButton.click();
      await this.page.waitForTimeout(300);
    }
  }

  async proceedToCheckout() {
    await this.openCart();
    await this.helpers.safeClick(this.checkoutButton);
    // This should open WhatsApp
    await this.page.waitForTimeout(1000);
  }

  // WhatsApp interactions
  async clickWhatsAppButton() {
    await this.helpers.safeClick(this.whatsappButton);
    await this.page.waitForTimeout(1000);
  }

  // Validation methods
  async verifyHomepageLoaded() {
    await expect(this.page.locator(this.header)).toBeVisible();
    await expect(this.page.locator(this.banner)).toBeVisible();
    await expect(this.page.locator(this.productGrid)).toBeVisible();
    await expect(this.page.locator(this.footer)).toBeVisible();
  }

  async verifyProductsDisplayed() {
    const productCount = await this.getProductCount();
    expect(productCount).toBeGreaterThan(0);
    
    // Verify first product has required elements
    const firstProduct = await this.getFirstProduct();
    await expect(firstProduct.locator(this.productName)).toBeVisible();
    await expect(firstProduct.locator(this.productPrice)).toBeVisible();
    await expect(firstProduct.locator(this.productImage)).toBeVisible();
  }

  async verifyBrandsSection() {
    await expect(this.page.locator(this.brandsSection)).toBeVisible();
    const brandLogos = this.page.locator(this.brandLogos);
    const logoCount = await brandLogos.count();
    expect(logoCount).toBeGreaterThan(0);
  }

  async verifyBlogSection() {
    await expect(this.page.locator(this.blogSection)).toBeVisible();
    const blogPosts = this.page.locator(this.blogPosts);
    const postCount = await blogPosts.count();
    expect(postCount).toBeGreaterThan(0);
  }

  async verifyNavigation() {
    await expect(this.page.locator(this.logo)).toBeVisible();
    await expect(this.page.locator(this.cartButton)).toBeVisible();
  }

  async verifySearchFunctionality() {
    await expect(this.page.locator(this.searchInput)).toBeVisible();
  }

  async verifyResponsiveElements() {
    // Check that key elements are visible on current viewport
    await expect(this.page.locator(this.header)).toBeVisible();
    await expect(this.page.locator(this.productGrid)).toBeVisible();
    
    // On mobile, some elements might be in a hamburger menu
    const viewport = this.page.viewportSize();
    if (viewport.width < 768) {
      // Mobile specific checks
      console.log('Mobile viewport detected, checking mobile-specific elements');
    }
  }

  async verifyCartFunctionality() {
    // Add a product and verify cart updates
    const initialCount = await this.getCartItemCount();
    await this.addFirstProductToCart();
    
    const newCount = await this.getCartItemCount();
    expect(newCount).toBeGreaterThan(initialCount);
  }

  async verifyWhatsAppIntegration() {
    await expect(this.page.locator(this.whatsappButton)).toBeVisible();
  }

  // SEO and performance checks
  async verifySEO() {
    await this.checkSEO();
    
    // Check specific meta tags for homepage
    await expect(this.page.locator('meta[property="og:title"]')).toHaveAttribute('content');
    await expect(this.page.locator('meta[property="og:description"]')).toHaveAttribute('content');
    await expect(this.page.locator('meta[property="og:image"]')).toHaveAttribute('content');
  }

  async verifyAccessibility() {
    // Check images have alt text
    const images = this.page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      await expect(img).toHaveAttribute('alt');
    }
    
    // Check heading structure
    await expect(this.page.locator('h1')).toBeVisible();
  }

  // Utility methods
  async waitForPageLoad() {
    await this.helpers.waitForPageLoad();
    await this.page.waitForLoadState('networkidle');
  }

  async takeScreenshot(name = 'homepage') {
    return await this.helpers.takeScreenshot(name);
  }
}
