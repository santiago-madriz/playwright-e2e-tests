import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: ['**/*.test.js', '**/*.spec.js'],
  fullyParallel: true,
  
  forbidOnly: !!process.env.CI,
  
  retries: process.env.CI ? 2 : 0,
  
  workers: process.env.CI ? 1 : undefined,
  
  timeout: 30 * 1000,
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    
    viewport: { width: 1280, height: 720 },
    
    ignoreHTTPSErrors: true,
    
    actionTimeout: 10 * 1000,
    
    navigationTimeout: 15 * 1000,
  },

  expect: {
    timeout: 5000,
    
    threshold: 0.2,
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        launchOptions: {
          args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
        }
      },
    }
  ],

  webServer: process.env.CI ? undefined : {
    command: 'cd .. && npm run dev',
    url: 'https://galeriamexicanacr.com/',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      NODE_ENV: 'test',
    },
  },

  reporter: [
    ['list'],
    
    ['json', { outputFile: 'test-results/results.json' }],
    
    ['html', { 
      outputFolder: 'test-results/html-report',
      open: !process.env.CI ? 'on-failure' : 'never'
    }],
    
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  outputDir: 'test-results/',
  
  globalSetup: require.resolve('./global-setup.js'),
  globalTeardown: require.resolve('./global-teardown.js'),
});
