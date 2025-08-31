import { expect } from '@playwright/test';
import { BasePage } from '../utils/test-helpers.js';

export class TequilaPage extends BasePage {
  constructor(page) {
    super(page);
    
    this.pageTitle = 'h1, .page-title';
    this.pageDescription = '.page-description, .tequila-intro';
    this.filterContainer = '.filter-container, .tequila-filters';
    this.categoryTabs = '.category-tab, .filter-tab';
    this.allCategoryTab = '[data-category="todos"], .category-tab[data-filter="all"]';
    this.blancoTab = '[data-category="blanco"], .category-tab[data-filter="blanco"]';
    this.reposadoTab = '[data-category="reposado"], .category-tab[data-filter="reposado"]';
    this.anejoTab = '[data-category="anejo"], .category-tab[data-filter="anejo"]';
    this.extraAnejoTab = '[data-category="extra-anejo"], .category-tab[data-filter="extra-anejo"]';
    this.tequilaGrid = '.tequila-grid, .products-grid, .tequila-products';
    this.tequilaCards = '.tequila-card, .product-card, .tequila-item';
    this.tequilaName = '.tequila-name, .product-name, h3';
    this.tequilaBrand = '.tequila-brand, .brand-name';
    this.tequilaType = '.tequila-type, .product-type';
    this.tequilaPrice = '.tequila-price, .price, .product-price';
    this.originalPrice = '.original-price, .price-before';
    this.tequilaImage = '.tequila-image img, .product-image img';
    this.tequilaDescription = '.tequila-description, .product-description';
    this.alcoholContent = '.alcohol-content, .alcohol-percentage';
    this.origin = '.origin, .tequila-origin';
    this.ageInfo = '.age-info, .aging-info';
    this.stockStatus = '.stock-status, .availability';
    this.addToCartBtn = '.add-to-cart-btn, .add-to-cart, [data-testid="add-to-cart"]';
    this.productModal = '.product-modal, .tequila-modal, .product-overlay';
    this.modalClose = '.modal-close, .close-modal, [data-testid="close-modal"]';
    this.modalImage = '.modal-image img';
    this.modalDetails = '.modal-details, .product-details';
    this.quickViewBtn = '.quick-view, .view-details, [data-testid="quick-view"]';
    this.sortSelect = '.sort-select, select[name="sort"]';
    this.priceFilter = '.price-filter, .price-range';
    this.brandFilter = '.brand-filter, select[name="brand"]';
    this.searchBox = '.search-box, input[type="search"]';
    this.discountBadge = '.discount-badge, .sale-badge, .discount-tag';
    this.newBadge = '.new-badge, .new-product, .nuevo';
    this.premiumBadge = '.premium-badge, .premium-tag';
    this.loadMoreBtn = '.load-more, .show-more, [data-testid="load-more"]';
    this.pagination = '.pagination, .page-numbers';
    this.featuredSection = '.featured-tequilas, .destacados';
    this.featuredProducts = '.featured-product, .producto-destacado';
  }

  async navigateToTequilaPage() {
    await this.navigate('/tequila');
    await this.waitForPageLoad();
  }

  async selectCategory(category) {
    const categoryTab = this.page.locator(`[data-category="${category}"], .category-tab[data-filter="${category}"]`);
    await this.helpers.safeClick(categoryTab);
    await this.helpers.waitForPageLoad();
  }

  async selectAllCategories() {
    await this.helpers.safeClick(this.allCategoryTab);
    await this.helpers.waitForPageLoad();
  }

  async filterByBlanco() {
    await this.selectCategory('blanco');
  }

  async filterByReposado() {
    await this.selectCategory('reposado');
  }

  async filterByAnejo() {
    await this.selectCategory('anejo');
  }

  async filterByExtraAnejo() {
    await this.selectCategory('extra-anejo');
  }

  async sortProducts(sortOption) {
    const sortSelect = this.page.locator(this.sortSelect);
    if (await sortSelect.isVisible()) {
      await sortSelect.selectOption(sortOption);
      await this.helpers.waitForPageLoad();
    }
  }

  async filterByBrand(brand) {
    const brandFilter = this.page.locator(this.brandFilter);
    if (await brandFilter.isVisible()) {
      await brandFilter.selectOption(brand);
      await this.helpers.waitForPageLoad();
    }
  }

  async searchTequilas(searchTerm) {
    const searchBox = this.page.locator(this.searchBox);
    if (await searchBox.isVisible()) {
      await this.helpers.safeFill(searchBox, searchTerm);
      await searchBox.press('Enter');
      await this.helpers.waitForPageLoad();
    }
  }

  async getTequilaCount() {
    const tequilas = this.page.locator(this.tequilaCards);
    return await tequilas.count();
  }

  async getFirstTequila() {
    return this.page.locator(this.tequilaCards).first();
  }

  async getTequilaByName(name) {
    return this.page.locator(this.tequilaCards).filter({ hasText: name });
  }

  async getTequilaByBrand(brand) {
    return this.page.locator(this.tequilaCards).filter({ hasText: brand });
  }

  async addTequilaToCart(tequilaElement) {
    const addButton = tequilaElement.locator(this.addToCartBtn);
    await addButton.click();
    await this.page.waitForTimeout(500);
  }

  async addFirstTequilaToCart() {
    const firstTequila = await this.getFirstTequila();
    await this.addTequilaToCart(firstTequila);
  }

  async viewTequilaDetails(tequilaElement) {
    const quickViewBtn = tequilaElement.locator(this.quickViewBtn);
    if (await quickViewBtn.isVisible()) {
      await quickViewBtn.click();
      await this.helpers.waitForElement(this.productModal);
    }
  }

  async closeProductModal() {
    await this.helpers.safeClick(this.modalClose);
    await this.helpers.waitForElementToDisappear(this.productModal);
  }

  async getTequilaInfo(tequilaElement) {
    const name = await tequilaElement.locator(this.tequilaName).textContent();
    const brand = await tequilaElement.locator(this.tequilaBrand).textContent();
    const type = await tequilaElement.locator(this.tequilaType).textContent();
    const price = await tequilaElement.locator(this.tequilaPrice).textContent();
    
    return { name, brand, type, price };
  }

  async getTequilaPrice(tequilaElement) {
    const priceElement = tequilaElement.locator(this.tequilaPrice);
    return await priceElement.textContent();
  }

  async getTequilaBrand(tequilaElement) {
    const brandElement = tequilaElement.locator(this.tequilaBrand);
    return await brandElement.textContent();
  }

  async getTequilaType(tequilaElement) {
    const typeElement = tequilaElement.locator(this.tequilaType);
    return await typeElement.textContent();
  }

  async isInStock(tequilaElement) {
    const stockElement = tequilaElement.locator(this.stockStatus);
    if (await stockElement.isVisible()) {
      const status = await stockElement.textContent();
      return !status.toLowerCase().includes('agotado');
    }
    return true;
  }

  async hasDiscount(tequilaElement) {
    const discountBadge = tequilaElement.locator(this.discountBadge);
    return await discountBadge.isVisible();
  }

  async isNewProduct(tequilaElement) {
    const newBadge = tequilaElement.locator(this.newBadge);
    return await newBadge.isVisible();
  }

  async isPremium(tequilaElement) {
    const premiumBadge = tequilaElement.locator(this.premiumBadge);
    return await premiumBadge.isVisible();
  }

  async loadMoreProducts() {
    const loadMoreBtn = this.page.locator(this.loadMoreBtn);
    if (await loadMoreBtn.isVisible()) {
      await loadMoreBtn.click();
      await this.helpers.waitForPageLoad();
    }
  }

  async verifyTequilaPageLoaded() {
    await expect(this.page.locator(this.pageTitle)).toBeVisible();
    await expect(this.page.locator(this.tequilaGrid)).toBeVisible();
    await expect(this.page.locator(this.filterContainer)).toBeVisible();
  }

  async verifyTequilasDisplayed() {
    const tequilaCount = await this.getTequilaCount();
    expect(tequilaCount).toBeGreaterThan(0);
    
    const firstTequila = await this.getFirstTequila();
    await expect(firstTequila.locator(this.tequilaName)).toBeVisible();
    await expect(firstTequila.locator(this.tequilaPrice)).toBeVisible();
    await expect(firstTequila.locator(this.tequilaImage)).toBeVisible();
  }

  async verifyFilterTabs() {
    await expect(this.page.locator(this.allCategoryTab)).toBeVisible();
    await expect(this.page.locator(this.blancoTab)).toBeVisible();
    await expect(this.page.locator(this.reposadoTab)).toBeVisible();
    await expect(this.page.locator(this.anejoTab)).toBeVisible();
  }

  async verifyFilterFunctionality(category) {
    await this.selectCategory(category);
    
    const activeTab = this.page.locator(`[data-category="${category}"].active, .category-tab[data-filter="${category}"].active`);
    await expect(activeTab).toBeVisible();
    
    const tequilaCount = await this.getTequilaCount();
    expect(tequilaCount).toBeGreaterThan(0);
  }

  async verifyTequilaDetails() {
    const firstTequila = await this.getFirstTequila();
    const info = await this.getTequilaInfo(firstTequila);
    
    expect(info.name).toBeTruthy();
    expect(info.price).toMatch(/₡[\d,]+/);
    expect(info.brand).toBeTruthy();
  }

  async verifyPriceFormat() {
    const tequilas = this.page.locator(this.tequilaCards);
    const count = await tequilas.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const tequila = tequilas.nth(i);
      const price = await this.getTequilaPrice(tequila);
      expect(price).toMatch(/₡[\d,]+/);
    }
  }

  async verifyDonJulioProducts() {
    const donJulioProducts = this.page.locator(this.tequilaCards).filter({ hasText: 'Don Julio' });
    const count = await donJulioProducts.count();
    expect(count).toBeGreaterThan(0);
    
    if (count > 0) {
      const firstDonJulio = donJulioProducts.first();
      await expect(firstDonJulio.locator(this.tequilaName)).toContainText('Don Julio');
    }
  }

  async verifyProductModal() {
    const firstTequila = await this.getFirstTequila();
    await this.viewTequilaDetails(firstTequila);
    
    await expect(this.page.locator(this.productModal)).toBeVisible();
    await expect(this.page.locator(this.modalImage)).toBeVisible();
    await expect(this.page.locator(this.modalDetails)).toBeVisible();
    
    await this.closeProductModal();
  }

  async verifyResponsiveDesign() {
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.helpers.waitForPageLoad();
    
    await expect(this.page.locator(this.tequilaGrid)).toBeVisible();
    await expect(this.page.locator(this.filterContainer)).toBeVisible();
    
    await this.page.setViewportSize({ width: 768, height: 1024 });
    await this.helpers.waitForPageLoad();
    
    await expect(this.page.locator(this.tequilaGrid)).toBeVisible();
    
    await this.page.setViewportSize({ width: 1280, height: 720 });
    await this.helpers.waitForPageLoad();
  }

  async verifySEOElements() {
    await this.checkSEO();
    
    const title = await this.page.title();
    expect(title.toLowerCase()).toContain('tequila');
    
    const jsonLdScripts = this.page.locator('script[type="application/ld+json"]');
    const count = await jsonLdScripts.count();
    expect(count).toBeGreaterThan(0);
  }

  async verifyCartIntegration() {
    const initialCartCount = await this.getCartItemCount();
    await this.addFirstTequilaToCart();
    
    await this.page.waitForTimeout(1000);
    
    const newCartCount = await this.getCartItemCount();
    expect(newCartCount).toBeGreaterThan(initialCartCount);
  }

  async getCartItemCount() {
    const cartCounter = this.page.locator('.cart-counter, [data-testid="cart-counter"]');
    if (await cartCounter.isVisible()) {
      const text = await cartCounter.textContent();
      return parseInt(text) || 0;
    }
    return 0;
  }

  async waitForPageLoad() {
    await this.helpers.waitForPageLoad();
    await this.page.waitForLoadState('networkidle');
  }

  async takeScreenshot(name = 'tequila-page') {
    return await this.helpers.takeScreenshot(name);
  }
}
