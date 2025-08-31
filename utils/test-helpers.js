import { expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

export class TestHelpers {
  constructor(page) {
    this.page = page;
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async waitForElement(selector, options = {}) {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible', ...options });
    await element.waitFor({ state: 'attached' });
    return element;
  }

  async safeClick(selector, options = {}) {
    const element = await this.waitForElement(selector);
    await element.click({ force: true, ...options });
    await this.page.waitForTimeout(100);
  }

  async safeFill(selector, value, options = {}) {
    const element = await this.waitForElement(selector);
    await element.clear();
    await element.fill(value, options);
    
    const inputValue = await element.inputValue();
    expect(inputValue).toBe(value);
  }

  async takeScreenshot(name = '') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    await this.page.screenshot({
      path: `test-results/screenshots/${filename}`,
      fullPage: true
    });
    return filename;
  }

  async waitForAPIResponse(urlPattern, timeout = 10000) {
    return await this.page.waitForResponse(
      response => response.url().includes(urlPattern) && response.status() === 200,
      { timeout }
    );
  }

  async elementExists(selector) {
    try {
      await this.page.locator(selector).waitFor({ state: 'attached', timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  async scrollIntoView(selector) {
    const element = this.page.locator(selector);
    await element.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(200);
  }

  async getTextContent(selector) {
    const element = await this.waitForElement(selector);
    return await element.textContent();
  }

  async hover(selector) {
    const element = await this.waitForElement(selector);
    await element.hover();
    await this.page.waitForTimeout(200);
  }

  async waitForElementToDisappear(selector, timeout = 5000) {
    await this.page.locator(selector).waitFor({ state: 'detached', timeout });
  }

  async checkAccessibility() {
    await expect(this.page.locator('h1')).toBeVisible();
    await expect(this.page.locator('[alt]')).toHaveAttribute('alt');
  }

  async simulateMobileTouch(selector) {
    const element = await this.waitForElement(selector);
    await element.tap();
  }

  async checkResponsive() {
    const viewports = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      await this.page.setViewportSize(viewport);
      await this.page.waitForTimeout(500);
      await this.waitForPageLoad();
    }
  }
}

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
    await expect(this.page.locator('meta[name="description"]')).toHaveAttribute('content');
    await expect(this.page.locator('title')).not.toBeEmpty();
    
    const jsonLd = await this.page.locator('script[type="application/ld+json"]').count();
    expect(jsonLd).toBeGreaterThan(0);
  }

  async checkPerformance() {
    const navigationStart = await this.page.evaluate(() => performance.timing.navigationStart);
    const loadComplete = await this.page.evaluate(() => performance.timing.loadEventEnd);
    const loadTime = loadComplete - navigationStart;
    
    expect(loadTime).toBeLessThan(5000);
  }
}

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
    const images = await page.locator('img').all();
    for (const img of images) {
      await expect(img).toHaveAttribute('alt');
    }
    
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
