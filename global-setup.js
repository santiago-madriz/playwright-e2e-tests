/**
 * Global Setup for Playwright Tests
 * 
 * This file runs once before all tests start.
 * Used for:
 * - Environment preparation
 * - Database seeding
 * - Authentication setup
 * - Global state initialization
 */

async function globalSetup(config) {
  console.log('🚀 Starting Galeria Mexicana E2E Test Suite Setup...');

  // Environment validation
  const requiredEnvVars = ['NODE_ENV'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missingVars.join(', ')}`);
  }

  // Set test environment
  process.env.NODE_ENV = process.env.NODE_ENV || 'test';
  
  // Log test configuration
  console.log(`📋 Base URL: ${config.use?.baseURL || 'https://galeriamexicanacr.com/'}`);
  console.log(`🔧 Test Environment: ${process.env.NODE_ENV || 'test'}`);
  console.log(`🖥️  Projects: ${config.projects?.map(p => p.name).join(', ') || 'chromium'}`);
  
  // Wait for server to be ready (if using webServer)
  if (config.webServer) {
    console.log('⏳ Waiting for development server to be ready...');
    // Additional wait time to ensure the server is fully ready
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log('✅ Global setup completed successfully!');
}

module.exports = globalSetup;
