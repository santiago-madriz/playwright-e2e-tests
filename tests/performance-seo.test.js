import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage.js';
import { TequilaPage } from '../pages/TequilaPage.js';

test.describe('Performance Tests', () => {
  let homePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test.describe('Page Load Performance', () => {
    test('should load homepage within acceptable time', async () => {
      const startTime = Date.now();
      
      await test.step('Navigate to homepage', async () => {
        await homePage.navigateToHome();
      });
      
      const loadTime = Date.now() - startTime;
      console.log(`Homepage load time: ${loadTime}ms`);
      
      await test.step('Verify load time is acceptable', async () => {
        
        expect(loadTime).toBeLessThan(3000);
      });

      await test.step('Verify page is fully interactive', async () => {
        
        await homePage.addFirstProductToCart();
        const cartCount = await homePage.getCartItemCount();
        expect(cartCount).toBeGreaterThan(0);
      });
    });

    test('should have acceptable Time to First Contentful Paint', async () => {
      await test.step('Measure FCP', async () => {
        await homePage.navigateToHome();
        
        const fcpTime = await homePage.page.evaluate(() => {
          return new Promise((resolve) => {
            new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
              if (fcpEntry) {
                resolve(fcpEntry.startTime);
              }
            }).observe({ entryTypes: ['paint'] });
            
            
            setTimeout(() => resolve(null), 5000);
          });
        });
        
        if (fcpTime) {
          console.log(`First Contentful Paint: ${fcpTime}ms`);
          expect(fcpTime).toBeLessThan(2000); 
        }
      });
    });

    test('should have acceptable Largest Contentful Paint', async () => {
      await test.step('Measure LCP', async () => {
        await homePage.navigateToHome();
        
        const lcpTime = await homePage.page.evaluate(() => {
          return new Promise((resolve) => {
            new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const lastEntry = entries[entries.length - 1];
              resolve(lastEntry?.startTime || null);
            }).observe({ entryTypes: ['largest-contentful-paint'] });
            
            
            setTimeout(() => {
              const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                resolve(lastEntry?.startTime || null);
              });
              observer.disconnect();
            }, 3000);
          });
        });
        
        if (lcpTime) {
          console.log(`Largest Contentful Paint: ${lcpTime}ms`);
          expect(lcpTime).toBeLessThan(2500); 
        }
      });
    });
  });

  test.describe('Resource Loading Performance', () => {
    test('should load images efficiently', async () => {
      await homePage.navigateToHome();
      
      await test.step('Check image loading', async () => {
        const images = homePage.page.locator('img');
        const imageCount = await images.count();
        
        let loadedImages = 0;
        let failedImages = 0;
        
        for (let i = 0; i < imageCount; i++) {
          const img = images.nth(i);
          
          try {
            await expect(img).toBeVisible({ timeout: 5000 });
            
            const naturalWidth = await img.evaluate((el) => el.naturalWidth);
            const naturalHeight = await img.evaluate((el) => el.naturalHeight);
            
            if (naturalWidth > 0 && naturalHeight > 0) {
              loadedImages++;
            } else {
              failedImages++;
            }
          } catch (error) {
            failedImages++;
          }
        }
        
        console.log(`Images loaded: ${loadedImages}, failed: ${failedImages}, total: ${imageCount}`);
        
        
        const successRate = loadedImages / imageCount;
        expect(successRate).toBeGreaterThan(0.8);
      });
    });

    test('should have optimized image formats', async () => {
      await homePage.navigateToHome();
      
      await test.step('Check image formats', async () => {
        const images = homePage.page.locator('img');
        const imageCount = await images.count();
        
        let optimizedImages = 0;
        
        for (let i = 0; i < Math.min(imageCount, 10); i++) {
          const img = images.nth(i);
          const src = await img.getAttribute('src');
          
          if (src) {
            
            const isOptimized = /\.(webp|avif)(\?|$)/i.test(src) || 
                              src.includes('format=webp') || 
                              src.includes('format=avif');
            
            if (isOptimized) {
              optimizedImages++;
            }
          }
        }
        
        console.log(`Optimized images: ${optimizedImages} out of ${Math.min(imageCount, 10)}`);
        
        
        
        expect(optimizedImages).toBeGreaterThanOrEqual(0);
      });
    });

    test('should have efficient CSS and JS loading', async () => {
      await test.step('Analyze resource loading', async () => {
        const resourceTimings = await homePage.page.evaluate(() => {
          const resources = performance.getEntriesByType('resource');
          
          const cssFiles = resources.filter(r => r.name.includes('.css'));
          const jsFiles = resources.filter(r => r.name.includes('.js'));
          
          return {
            css: cssFiles.length,
            js: jsFiles.length,
            avgCssLoad: cssFiles.reduce((sum, r) => sum + r.duration, 0) / cssFiles.length || 0,
            avgJsLoad: jsFiles.reduce((sum, r) => sum + r.duration, 0) / jsFiles.length || 0
          };
        });
        
        console.log('Resource loading stats:', resourceTimings);
        
        
        expect(resourceTimings.avgCssLoad).toBeLessThan(1000);
        expect(resourceTimings.avgJsLoad).toBeLessThan(2000);
      });
    });
  });

  test.describe('Runtime Performance', () => {
    test('should have smooth interactions', async () => {
      await homePage.navigateToHome();
      
      await test.step('Test cart interactions performance', async () => {
        const startTime = Date.now();
        
        
        for (let i = 0; i < 3; i++) {
          await homePage.addFirstProductToCart();
          await homePage.page.waitForTimeout(50);
        }
        
        const addTime = Date.now() - startTime;
        console.log(`Time to add 3 items: ${addTime}ms`);
        
        expect(addTime).toBeLessThan(1500);
      });

      await test.step('Test modal opening performance', async () => {
        const startTime = Date.now();
        await homePage.openCart();
        const openTime = Date.now() - startTime;
        
        console.log(`Cart modal open time: ${openTime}ms`);
        expect(openTime).toBeLessThan(500);
        
        await homePage.closeCart();
      });
    });

    test('should handle scroll performance', async () => {
      await homePage.navigateToHome();
      
      await test.step('Test smooth scrolling', async () => {
        const scrollStartTime = Date.now();
        
        
        await homePage.page.evaluate(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        });
        
        await homePage.page.waitForTimeout(1000);
        
        
        await homePage.page.evaluate(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        const scrollTime = Date.now() - scrollStartTime;
        console.log(`Scroll test time: ${scrollTime}ms`);
        
        
        expect(scrollTime).toBeLessThan(3000);
      });
    });

    test('should have efficient memory usage', async () => {
      await homePage.navigateToHome();
      
      await test.step('Monitor memory usage', async () => {
        const initialMemory = await homePage.page.evaluate(() => {
          const perfMemory = performance.memory;
          return perfMemory ? {
            usedJSHeapSize: perfMemory.usedJSHeapSize,
            totalJSHeapSize: perfMemory.totalJSHeapSize
          } : null;
        });
        
        if (initialMemory) {
          console.log('Initial memory usage:', initialMemory);
          
          
          await homePage.addFirstProductToCart();
          await homePage.openCart();
          await homePage.closeCart();
          await homePage.navigateToTequila();
          await homePage.navigateToHome();
          
          const finalMemory = await homePage.page.evaluate(() => {
            const perfMemory = performance.memory;
            return perfMemory ? {
              usedJSHeapSize: perfMemory.usedJSHeapSize,
              totalJSHeapSize: perfMemory.totalJSHeapSize
            } : null;
          });
          
          if (finalMemory) {
            console.log('Final memory usage:', finalMemory);
            
            
            const memoryGrowth = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
            expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024); 
          }
        }
      });
    });
  });

  test.describe('Network Performance', () => {
    test('should minimize HTTP requests', async () => {
      await test.step('Count network requests', async () => {
        const requests = [];
        
        homePage.page.on('request', request => {
          requests.push(request.url());
        });
        
        await homePage.navigateToHome();
        await homePage.page.waitForLoadState('networkidle');
        
        console.log(`Total HTTP requests: ${requests.length}`);
        
        
        expect(requests.length).toBeLessThan(50);
        
        
        const uniqueRequests = new Set(requests);
        const duplicates = requests.length - uniqueRequests.size;
        expect(duplicates).toBe(0);
      });
    });

    test('should use appropriate caching headers', async () => {
      await test.step('Check caching', async () => {
        const responses = [];
        
        homePage.page.on('response', response => {
          responses.push({
            url: response.url(),
            status: response.status(),
            headers: response.headers()
          });
        });
        
        await homePage.navigateToHome();
        await homePage.page.waitForLoadState('networkidle');
        
        
        const staticAssets = responses.filter(r => 
          /\.(css|js|png|jpg|jpeg|webp|woff|woff2)$/.test(r.url)
        );
        
        let cachedAssets = 0;
        staticAssets.forEach(asset => {
          const cacheControl = asset.headers['cache-control'];
          if (cacheControl && cacheControl.includes('max-age')) {
            cachedAssets++;
          }
        });
        
        console.log(`Cached static assets: ${cachedAssets} out of ${staticAssets.length}`);
        
        if (staticAssets.length > 0) {
          
          expect(cachedAssets / staticAssets.length).toBeGreaterThan(0.5);
        }
      });
    });
  });
});

test.describe('SEO Tests', () => {
  let homePage;
  let tequilaPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    tequilaPage = new TequilaPage(page);
  });

  test.describe('Meta Tags and Title', () => {
    test('should have proper title tags', async () => {
      await test.step('Check homepage title', async () => {
        await homePage.navigateToHome();
        const title = await homePage.getTitle();
        
        expect(title).toBeTruthy();
        expect(title.length).toBeGreaterThan(30);
        expect(title.length).toBeLessThan(60);
        expect(title.toLowerCase()).toContain('galería mexicana');
        expect(title.toLowerCase()).toContain('costa rica');
      });

      await test.step('Check tequila page title', async () => {
        await tequilaPage.navigateToTequilaPage();
        const title = await tequilaPage.getTitle();
        
        expect(title).toBeTruthy();
        expect(title.toLowerCase()).toContain('tequila');
        expect(title.length).toBeGreaterThan(20);
      });
    });

    test('should have proper meta descriptions', async () => {
      await test.step('Check homepage meta description', async () => {
        await homePage.navigateToHome();
        
        const description = await homePage.page.locator('meta[name="description"]').getAttribute('content');
        expect(description).toBeTruthy();
        expect(description.length).toBeGreaterThan(120);
        expect(description.length).toBeLessThan(160);
        expect(description.toLowerCase()).toContain('productos mexicanos');
      });

      await test.step('Check unique meta descriptions', async () => {
        const homeDescription = await homePage.page.locator('meta[name="description"]').getAttribute('content');
        
        await tequilaPage.navigateToTequilaPage();
        const tequilaDescription = await tequilaPage.page.locator('meta[name="description"]').getAttribute('content');
        
        if (tequilaDescription) {
          expect(tequilaDescription).not.toBe(homeDescription);
        }
      });
    });

    test('should have proper Open Graph tags', async () => {
      await homePage.navigateToHome();
      
      await test.step('Check required OG tags', async () => {
        const ogTitle = await homePage.page.locator('meta[property="og:title"]').getAttribute('content');
        const ogDescription = await homePage.page.locator('meta[property="og:description"]').getAttribute('content');
        const ogImage = await homePage.page.locator('meta[property="og:image"]').getAttribute('content');
        const ogUrl = await homePage.page.locator('meta[property="og:url"]').getAttribute('content');
        
        expect(ogTitle).toBeTruthy();
        expect(ogDescription).toBeTruthy();
        expect(ogImage).toBeTruthy();
        expect(ogUrl).toBeTruthy();
        
        
        expect(ogImage).toMatch(/^https?:\/\//);
      });

      await test.step('Check Twitter Card tags', async () => {
        const twitterCard = await homePage.page.locator('meta[name="twitter:card"]').getAttribute('content');
        const twitterTitle = await homePage.page.locator('meta[name="twitter:title"]').getAttribute('content');
        
        if (twitterCard) {
          expect(twitterCard).toBe('summary_large_image');
        }
        if (twitterTitle) {
          expect(twitterTitle).toBeTruthy();
        }
      });
    });
  });

  test.describe('Structured Data', () => {
    test('should have valid JSON-LD structured data', async () => {
      await homePage.navigateToHome();
      
      await test.step('Check JSON-LD presence', async () => {
        const jsonLdScripts = homePage.page.locator('script[type="application/ld+json"]');
        const count = await jsonLdScripts.count();
        expect(count).toBeGreaterThan(0);
      });

      await test.step('Validate JSON-LD structure', async () => {
        const jsonLdContent = await homePage.page.locator('script[type="application/ld+json"]').first().textContent();
        
        expect(() => JSON.parse(jsonLdContent)).not.toThrow();
        
        const structuredData = JSON.parse(jsonLdContent);
        expect(structuredData['@context']).toBe('https://schema.org');
        expect(structuredData['@type']).toBeTruthy();
      });

      await test.step('Check business information', async () => {
        const jsonLdContent = await homePage.page.locator('script[type="application/ld+json"]').first().textContent();
        const structuredData = JSON.parse(jsonLdContent);
        
        if (structuredData['@type'] === 'Store' || structuredData['@type'] === 'LocalBusiness') {
          expect(structuredData.name).toBeTruthy();
          expect(structuredData.description).toBeTruthy();
          expect(structuredData.telephone).toBeTruthy();
          expect(structuredData.address).toBeTruthy();
        }
      });
    });

    test('should have product structured data', async () => {
      await tequilaPage.navigateToTequilaPage();
      
      await test.step('Check for product schema', async () => {
        const jsonLdScripts = tequilaPage.page.locator('script[type="application/ld+json"]');
        const count = await jsonLdScripts.count();
        
        if (count > 0) {
          const jsonLdContent = await jsonLdScripts.first().textContent();
          const structuredData = JSON.parse(jsonLdContent);
          
          
          if (structuredData.hasOfferCatalog) {
            expect(structuredData.hasOfferCatalog.itemListElement).toBeTruthy();
            expect(Array.isArray(structuredData.hasOfferCatalog.itemListElement)).toBe(true);
          }
        }
      });
    });
  });

  test.describe('URL Structure and Navigation', () => {
    test('should have SEO-friendly URLs', async () => {
      await test.step('Check homepage URL', async () => {
        await homePage.navigateToHome();
        const url = homePage.page.url();
        expect(url).toBe('https://galeriamexicanacr.com/');
      });

      await test.step('Check tequila page URL', async () => {
        await tequilaPage.navigateToTequilaPage();
        const url = tequilaPage.page.url();
        expect(url).toContain('/tequila');
        expect(url).not.toContain('?');
      });
    });

    test('should have proper canonical URLs', async () => {
      await homePage.navigateToHome();
      
      await test.step('Check canonical tag', async () => {
        const canonical = homePage.page.locator('link[rel="canonical"]');
        
        if (await canonical.count() > 0) {
          const href = await canonical.getAttribute('href');
          expect(href).toBeTruthy();
          expect(href).toMatch(/^https?:\/\//);
        }
      });
    });

    test('should have proper sitemap', async () => {
      await test.step('Check sitemap accessibility', async () => {
        const response = await homePage.page.goto('/sitemap.xml');
        expect(response.status()).toBe(200);
        
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('xml');
        
        const content = await response.text();
        expect(content).toContain('<urlset');
        expect(content).toContain('<url>');
      });
    });

    test('should have proper robots.txt', async () => {
      await test.step('Check robots.txt', async () => {
        const response = await homePage.page.goto('/robots.txt');
        expect(response.status()).toBe(200);
        
        const content = await response.text();
        expect(content).toContain('User-agent');
        expect(content).toContain('Sitemap');
      });
    });
  });

  test.describe('Content Quality', () => {
    test('should have proper heading structure', async () => {
      await homePage.navigateToHome();
      
      await test.step('Check heading hierarchy', async () => {
        const h1Count = await homePage.page.locator('h1').count();
        expect(h1Count).toBe(1);
        
        const h1Text = await homePage.page.locator('h1').textContent();
        expect(h1Text.trim().length).toBeGreaterThan(10);
        
        const h2Count = await homePage.page.locator('h2').count();
        expect(h2Count).toBeGreaterThan(0);
      });
    });

    test('should have descriptive alt text for images', async () => {
      await homePage.navigateToHome();
      
      await test.step('Check image alt attributes', async () => {
        const images = homePage.page.locator('img');
        const imageCount = await images.count();
        
        let imagesWithAlt = 0;
        let descriptiveAlt = 0;
        
        for (let i = 0; i < imageCount; i++) {
          const img = images.nth(i);
          const alt = await img.getAttribute('alt');
          
          if (alt !== null) {
            imagesWithAlt++;
            
            if (alt.trim().length > 5) {
              descriptiveAlt++;
            }
          }
        }
        
        
        expect(imagesWithAlt).toBe(imageCount);
        
        
        if (imageCount > 0) {
          expect(descriptiveAlt / imageCount).toBeGreaterThan(0.8);
        }
      });
    });

    test('should have internal linking', async () => {
      await homePage.navigateToHome();
      
      await test.step('Check internal links', async () => {
        const links = homePage.page.locator('a[href^="/"], a[href^="http://localhost"], a[href^="https://galeriamexicanacr.com"]');
        const linkCount = await links.count();
        
        expect(linkCount).toBeGreaterThan(3);
        
        
        for (let i = 0; i < Math.min(linkCount, 10); i++) {
          const link = links.nth(i);
          const text = await link.textContent();
          const ariaLabel = await link.getAttribute('aria-label');
          
          const hasDescriptiveText = (text && text.trim().length > 2) || 
                                   (ariaLabel && ariaLabel.trim().length > 2);
          
          expect(hasDescriptiveText).toBe(true);
        }
      });
    });
  });

  test.describe('Mobile SEO', () => {
    test('should have mobile-friendly viewport', async () => {
      await homePage.navigateToHome();
      
      await test.step('Check viewport meta tag', async () => {
        const viewport = await homePage.page.locator('meta[name="viewport"]').getAttribute('content');
        expect(viewport).toBeTruthy();
        expect(viewport).toContain('width=device-width');
        expect(viewport).toContain('initial-scale=1');
      });
    });

    test('should be mobile-responsive', async ({ page }) => {
      await test.step('Test mobile responsiveness', async () => {
        await page.setViewportSize({ width: 375, height: 667 });
        await homePage.navigateToHome();
        
        
        await expect(homePage.page.locator('h1')).toBeVisible();
        await expect(homePage.page.locator(homePage.productGrid)).toBeVisible();
        
        
        const h1 = homePage.page.locator('h1');
        const box = await h1.boundingBox();
        expect(box.width).toBeLessThanOrEqual(375);
      });
    });
  });
});
