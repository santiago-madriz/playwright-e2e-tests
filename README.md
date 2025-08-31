# Galería Mexicana E2E Test Suite

End-to-end test suite for Galería Mexicana's Next.js e-commerce platform built with Playwright.

## Features

- Complete test coverage for homepage, product pages, and shopping cart
- Cross-browser support (Chrome, Firefox, Safari, Edge)
- Mobile device testing and responsive design validation
- Accessibility compliance testing (WCAG guidelines)
- Performance monitoring and SEO validation
- Visual regression testing

## Project Structure

```
e2e-tests/
├── pages/                   # Page Object Models
│   ├── HomePage.js          # Homepage interactions
│   └── TequilaPage.js       # Tequila page interactions
├── tests/                   # Test files
│   ├── homepage.test.js     # Homepage functionality tests
│   ├── tequila.test.js      # Tequila page tests
│   ├── cart.test.js         # Shopping cart tests
│   ├── cross-browser-accessibility.test.js  # Cross-browser & accessibility tests
│   └── performance-seo.test.js              # Performance & SEO tests
├── utils/                   # Utility functions
│   └── test-helpers.js      # Common test utilities
├── test-results/            # Test output and reports
├── playwright.config.js     # Playwright configuration
├── global-setup.js         # Global test setup
├── global-teardown.js      # Global test cleanup
└── README.md               # This file
```

## Setup and Installation

### Prerequisites

- Node.js 16 or higher
- Next.js application running on `https://galeriamexicanacr.com/`

### Installation

1. Navigate to the e2e-tests directory:
```bash
cd e2e-tests
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install
```

### Running Specific Test Suites

```bash
# Homepage tests only
npx playwright test homepage.test.js

```

## Test Categories

### 1. Homepage Tests (`homepage.test.js`)
- Layout and visual elements verification
- Product grid functionality
- Shopping cart integration
- Navigation tests
- WhatsApp integration
- SEO and accessibility checks
- Performance validation
- Error handling

### 2. Tequila Page Tests (`tequila.test.js`)
- Product filtering by category (Blanco, Reposado, Añejo)
- Product information display
- Cart integration from product page
- Responsive design verification
- SEO elements validation
- Navigation integration

### 3. Shopping Cart Tests (`cart.test.js`)
- Adding/removing items
- Quantity management
- Cart persistence across navigation
- WhatsApp checkout integration
- Mobile cart functionality
- Error handling and edge cases
- Performance with multiple items

### 4. Cross-Browser & Accessibility Tests (`cross-browser-accessibility.test.js`)
- Browser-specific feature testing
- CSS and layout consistency
- JavaScript compatibility
- Keyboard navigation
- Screen reader support
- ARIA attributes validation
- Color contrast verification
- Focus management

### 5. Performance & SEO Tests (`performance-seo.test.js`)
- Page load performance
- Resource loading optimization
- Runtime performance metrics
- Meta tags and titles
- Structured data validation
- URL structure and navigation
- Content quality assessment
- Mobile SEO compliance

