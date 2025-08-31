async function globalTeardown(config) {
  console.log('🧹 Starting Galeria Mexicana E2E Test Suite Teardown...');

  console.log('📊 Test execution completed');
  console.log(`📁 Test artifacts saved to: ${process.env.PLAYWRIGHT_TEST_RESULTS || 'test-results'}`);
  console.log('📋 Available reports:');
  console.log('  - HTML Report: test-results/html-report/index.html');
  console.log('  - JSON Results: test-results/results.json');
  console.log('  - JUnit XML: test-results/junit.xml');

  console.log('✅ Global teardown completed successfully!');
}

module.exports = globalTeardown;
