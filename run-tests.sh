#!/bin/bash

# Galería Mexicana E2E Test Runner
# This script helps you run different types of tests easily

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "playwright.config.js" ]; then
    print_error "Please run this script from the e2e-tests directory"
    print_status "cd e2e-tests && ./run-tests.sh"
    exit 1
fi

# Function to check if the app is running
check_app_running() {
    print_status "Checking if the app is running on http://localhost:3000..."
    if curl -s http://localhost:3000 > /dev/null; then
        print_success "App is running on port 3000"
        return 0
    else
        print_error "App is not running on port 3000"
        print_status "Please start your Next.js app with: npm run dev"
        return 1
    fi
}

# Function to install dependencies
install_deps() {
    print_status "Installing dependencies..."
    npm install
    print_status "Installing Playwright browsers..."
    npx playwright install
    print_success "Dependencies installed successfully"
}

# Function to run specific test suites
run_test_suite() {
    local suite=$1
    case $suite in
        "homepage")
            print_status "Running homepage tests..."
            npx playwright test homepage.test.js
            ;;
        "tequila")
            print_status "Running tequila page tests..."
            npx playwright test tequila.test.js
            ;;
        "cart")
            print_status "Running shopping cart tests..."
            npx playwright test cart.test.js
            ;;
        "accessibility")
            print_status "Running cross-browser and accessibility tests..."
            npx playwright test cross-browser-accessibility.test.js
            ;;
        "performance")
            print_status "Running performance and SEO tests..."
            npx playwright test performance-seo.test.js
            ;;
        "all")
            print_status "Running all test suites..."
            npm test
            ;;
        *)
            print_error "Unknown test suite: $suite"
            show_help
            exit 1
            ;;
    esac
}

# Function to run tests with different options
run_with_options() {
    local option=$1
    case $option in
        "headed")
            print_status "Running tests in headed mode (browser visible)..."
            npx playwright test --headed
            ;;
        "debug")
            print_status "Running tests in debug mode..."
            npx playwright test --debug
            ;;
        "ui")
            print_status "Running tests with UI mode..."
            npx playwright test --ui
            ;;
        "mobile")
            print_status "Running mobile tests..."
            npx playwright test --project=mobile-chrome --project=mobile-safari
            ;;
        "ci")
            print_status "Running tests in CI mode..."
            npm run test:ci
            ;;
        *)
            print_error "Unknown option: $option"
            show_help
            exit 1
            ;;
    esac
}

# Function to show help
show_help() {
    echo "Galería Mexicana E2E Test Runner"
    echo "================================"
    echo ""
    echo "Usage: ./run-tests.sh [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  install          Install dependencies and Playwright browsers"
    echo "  check            Check if the app is running"
    echo "  suite [NAME]     Run a specific test suite"
    echo "  run [OPTION]     Run tests with specific options"
    echo "  report           Generate and open test report"
    echo "  clean            Clean test results and cache"
    echo "  help             Show this help message"
    echo ""
    echo "Test Suites:"
    echo "  homepage         Homepage functionality tests"
    echo "  tequila          Tequila page filtering tests"
    echo "  cart             Shopping cart tests"
    echo "  accessibility    Cross-browser and accessibility tests"
    echo "  performance      Performance and SEO tests"
    echo "  all              All test suites"
    echo ""
    echo "Run Options:"
    echo "  headed           Run tests with browser visible"
    echo "  debug            Run tests in debug mode"
    echo "  ui               Run tests with interactive UI"
    echo "  mobile           Run mobile-specific tests"
    echo "  ci               Run tests in CI mode"
    echo ""
    echo "Examples:"
    echo "  ./run-tests.sh install"
    echo "  ./run-tests.sh check"
    echo "  ./run-tests.sh suite homepage"
    echo "  ./run-tests.sh suite all"
    echo "  ./run-tests.sh run headed"
    echo "  ./run-tests.sh run debug"
    echo "  ./run-tests.sh report"
}

# Main script logic
case ${1:-help} in
    "install")
        install_deps
        ;;
    "check")
        check_app_running
        ;;
    "suite")
        if [ -z "$2" ]; then
            print_error "Please specify a test suite"
            show_help
            exit 1
        fi
        check_app_running || exit 1
        run_test_suite "$2"
        ;;
    "run")
        if [ -z "$2" ]; then
            print_error "Please specify run options"
            show_help
            exit 1
        fi
        check_app_running || exit 1
        run_with_options "$2"
        ;;
    "report")
        print_status "Generating test report..."
        npx playwright show-report
        ;;
    "clean")
        print_status "Cleaning test results and cache..."
        rm -rf test-results/ playwright-report/
        print_success "Cleaned test artifacts"
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac

print_success "Script execution completed!"
