/**
 * Test Utilities and Helper Functions
 * 
 * Common utilities used across all test files for:
 * - Element interactions
 * - Wait conditions
 * - Data generation
 * - Assertions
 * - API interactions
 */

import { expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

export class TestHelpers {
  constructor(page) {
    this.page = page;
  }

  /**
   * Wait for page to be fully loaded including network requests
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Wait for element to be visible and stable
   */
  async waitForElement(selector, options = {}) {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible', ...options });
    await element.waitFor({ state: 'attached' });
    return element;
  }

  /**
   * Safely click an element with retry logic
   */
  async safeClick(selector, options = {}) {
    const element = await this.waitForElement(selector);
    await element.click({ force: true, ...options });
    await this.page.waitForTimeout(100); // Small delay after click
  }

  /**
   * Safely fill input with validation
   */
  async safeFill(selector, value, options = {}) {
    const element = await this.waitForElement(selector);
    await element.clear();
    await element.fill(value, options);
    
    // Verify the value was set correctly
    const inputValue = await element.inputValue();
    expect(inputValue).toBe(value);
  }

  /**
   * Take screenshot with timestamp
   */
  async takeScreenshot(name = '') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    await this.page.screenshot({
      path: `test-results/screenshots/${filename}`,
      fullPage: true
    });
    return filename;
  }

  /**
   * Wait for API response with specific URL pattern
   */
  async waitForAPIResponse(urlPattern, timeout = 10000) {
    return await this.page.waitForResponse(
      response => response.url().includes(urlPattern) && response.status() === 200,
      { timeout }
    );
  }

  /**
   * Check if element exists without throwing
   */
  async elementExists(selector) {
    try {
      await this.page.locator(selector).waitFor({ state: 'attached', timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Scroll element into view
   */
  async scrollIntoView(selector) {
    const element = this.page.locator(selector);
    await element.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(200);
  }

  /**
   * Get element text content safely
   */
  async getTextContent(selector) {
    const element = await this.waitForElement(selector);
    return await element.textContent();
  }

  /**
   * Hover over element
   */
  async hover(selector) {
    const element = await this.waitForElement(selector);
    await element.hover();
    await this.page.waitForTimeout(200);
  }

  /**
   * Wait for element to disappear
   */
  async waitForElementToDisappear(selector, timeout = 5000) {
    await this.page.locator(selector).waitFor({ state: 'detached', timeout });
  }

  /**
   * Check page accessibility
   */
  async checkAccessibility() {
    // Basic accessibility checks
    await expect(this.page.locator('h1')).toBeVisible();
    await expect(this.page.locator('[alt]')).toHaveAttribute('alt');
  }

  /**
   * Simulate mobile device interaction
   */
  async simulateMobileTouch(selector) {
    const element = await this.waitForElement(selector);
    await element.tap();
  }

  /**
   * Check responsive behavior
   */
  async checkResponsive() {
    // Test different viewport sizes
    const viewports = [
      { width: 375, height: 667 },  // iPhone
      { width: 768, height: 1024 }, // iPad
      { width: 1920, height: 1080 } // Desktop
    ];

    for (const viewport of viewports) {
      await this.page.setViewportSize(viewport);
      await this.page.waitForTimeout(500);
      await this.waitForPageLoad();
    }
  }
}

/**
 * Data generators for testing
 */
export class TestDataGenerator {
  static generateCustomer() {
    return {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number('+506-####-####'),
      address: faker.location.streetAddress(),
      city: faker.location.city()
    };
  }

  static generateProduct() {
    const mexicanProducts = [
      'Tequila Don Julio',
      'Mezcal Oaxaca',
      'Cerveza Corona',
      'Dulces de la Rosa',
      'Chiles Jalapeños',
      'Salsa Valentina'
    ];

    return {
      name: faker.helpers.arrayElement(mexicanProducts),
      price: faker.number.int({ min: 1000, max: 50000 }),
      category: faker.helpers.arrayElement(['Bebidas Alcohólicas', 'Dulces y Confitería', 'Condimentos']),
      description: faker.commerce.productDescription()
    };
  }

  static generateSearchTerm() {
    const searchTerms = [
      'tequila',
      'mezcal',
      'don julio',
      'dulces',
      'cerveza',
      'corona',
      'modelo',
      'valentina'
    ];
    return faker.helpers.arrayElement(searchTerms);
  }

  static generateWhatsAppMessage() {
    return `Hola, me interesa información sobre ${this.generateProduct().name}. ¿Podrían ayudarme?`;
  }
}

/**
 * Page Object Model base class
 */
export class BasePage {
  constructor(page) {
    this.page = page;
    this.helpers = new TestHelpers(page);
  }

  async navigate(path = '') {
    await this.page.goto(path);
    await this.helpers.waitForPageLoad();
  }

  async getTitle() {
    return await this.page.title();
  }

  async getURL() {
    return this.page.url();
  }

  async checkSEO() {
    // Check meta tags
    await expect(this.page.locator('meta[name="description"]')).toHaveAttribute('content');
    await expect(this.page.locator('title')).not.toBeEmpty();
    
    // Check structured data
    const jsonLd = await this.page.locator('script[type="application/ld+json"]').count();
    expect(jsonLd).toBeGreaterThan(0);
  }

  async checkPerformance() {
    // Basic performance checks
    const navigationStart = await this.page.evaluate(() => performance.timing.navigationStart);
    const loadComplete = await this.page.evaluate(() => performance.timing.loadEventEnd);
    const loadTime = loadComplete - navigationStart;
    
    // Load time should be under 5 seconds
    expect(loadTime).toBeLessThan(5000);
  }
}

/**
 * Assertion helpers
 */
export class CustomAssertions {
  static async toBeLoaded(page) {
    await expect(page).toHaveURL(/.*/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
  }

  static async toHaveValidPrice(element) {
    const text = await element.textContent();
    expect(text).toMatch(/₡[\d,]+/);
  }

  static async toHaveValidWhatsAppLink(element) {
    const href = await element.getAttribute('href');
    expect(href).toContain('api.whatsapp.com');
    expect(href).toContain('50687396001');
  }

  static async toBeAccessible(page) {
    // Check for basic accessibility requirements
    const images = await page.locator('img').all();
    for (const img of images) {
      await expect(img).toHaveAttribute('alt');
    }
    
    // Check for proper heading structure
    await expect(page.locator('h1')).toBeVisible();
  }
}

const testHelpers = {
  TestHelpers,
  TestDataGenerator,
  BasePage,
  CustomAssertions
};

export default testHelpers;
