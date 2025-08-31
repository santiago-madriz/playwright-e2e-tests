import { defineConfig, devices } from '@playwright/test';

/**
 * Comprehensive Playwright Configuration for Galeria Mexicana E2E Tests
 * 
 * This configuration provides:
 * - Multi-browser testing (Chrome, Firefox, Safari)
 * - Mobile device testing
 * - Parallel execution
 * - Video recording on failures
 * - Screenshots on failures
 * - Custom test timeout settings
 * - Environment-specific base URLs
 */

export default defineConfig({
  // Test directory
  testDir: './tests',
  
  // Test file patterns
  testMatch: ['**/*.test.js', '**/*.spec.js'],
  
  // Parallel execution
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Number of parallel workers
  workers: process.env.CI ? 1 : undefined,
  
  // Global test timeout
  timeout: 30 * 1000, // 30 seconds
  
  // Global action timeout
  use: {
    // Base URL for all tests
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // Browser context options
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    
    // Viewport
    viewport: { width: 1280, height: 720 },
    
    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
    
    // Action timeout
    actionTimeout: 10 * 1000, // 10 seconds
    
    // Navigation timeout
    navigationTimeout: 15 * 1000, // 15 seconds
  },

  // Expect configuration
  expect: {
    // Maximum time expect() should wait for the condition to be met
    timeout: 5000,
    
    // Threshold for image comparisons
    threshold: 0.2,
  },

  // Projects for different browsers and devices
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Additional Chrome-specific options
        channel: 'chrome',
        launchOptions: {
          args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
        }
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        // Firefox-specific options
        launchOptions: {
          firefoxUserPrefs: {
            'network.http.referer.XOriginPolicy': 0,
          }
        }
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        // Safari-specific options
        viewport: { width: 1280, height: 720 }
      },
    },

    // Mobile browsers
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
        // Mobile Chrome specific settings
        isMobile: true,
        hasTouch: true
      },
    },
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 12'],
        // Mobile Safari specific settings
        isMobile: true,
        hasTouch: true
      },
    },

    // Tablet
    {
      name: 'tablet',
      use: { 
        ...devices['iPad Pro'],
        // Tablet specific settings
        isMobile: true,
        hasTouch: true
      },
    },

    // Microsoft Edge
    {
      name: 'edge',
      use: { 
        ...devices['Desktop Edge'],
        channel: 'msedge'
      },
    },
  ],

  // Web server configuration for development
  webServer: process.env.CI ? undefined : {
    command: 'cd .. && npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes
    env: {
      NODE_ENV: 'test',
    },
  },

  // Reporter configuration
  reporter: [
    // Console reporter for terminal output
    ['list'],
    
    // JSON reporter for CI/CD
    ['json', { outputFile: 'test-results/results.json' }],
    
    // HTML reporter for detailed results
    ['html', { 
      outputFolder: 'test-results/html-report',
      open: !process.env.CI ? 'on-failure' : 'never'
    }],
    
    // JUnit reporter for CI/CD integration
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  // Output directory for test artifacts
  outputDir: 'test-results/',
  
  // Global setup and teardown
  globalSetup: require.resolve('./global-setup.js'),
  globalTeardown: require.resolve('./global-teardown.js'),
});
