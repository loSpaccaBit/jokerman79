/**
 * Configurazione Playwright per test E2E Evolution Gaming
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Directory dei test E2E
  testDir: './src/__tests__/e2e',
  
  // Pattern per i file di test
  testMatch: '**/*.spec.ts',
  
  // Timeout per test
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  
  // Configurazione globale
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['junit', { outputFile: 'playwright-report/results.xml' }],
    process.env.CI ? ['github'] : ['list']
  ],
  
  // Configurazione output
  outputDir: 'test-results/',
  
  // Setup globale
  globalSetup: require.resolve('./src/__tests__/setup/playwright.global-setup.ts'),
  globalTeardown: require.resolve('./src/__tests__/setup/playwright.global-teardown.ts'),
  
  // Configurazioni per tutti i test
  use: {
    // Base URL per test
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001',
    
    // Trace per debug
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video recording
    video: 'retain-on-failure',
    
    // Timeout per azioni
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    // Locale
    locale: 'it-IT',
    timezoneId: 'Europe/Rome',
    
    // Permissions
    permissions: [],
    
    // Ignora HTTPS errors per sviluppo
    ignoreHTTPSErrors: true,
    
    // User agent
    userAgent: 'Evolution-Gaming-E2E-Test'
  },

  // Progetti per diversi browser e dispositivi
  projects: [
    {
      name: 'chromium-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
    },
    
    {
      name: 'firefox-desktop',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 }
      },
    },
    
    {
      name: 'webkit-desktop',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 }
      },
    },
    
    // Test mobile
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'] 
      },
    },
    
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 12'] 
      },
    },
    
    // Test tablet
    {
      name: 'tablet-chrome',
      use: { 
        ...devices['iPad Pro'] 
      },
    },
    
    // Test setup specifico per Evolution Gaming
    {
      name: 'evolution-gaming-tests',
      testMatch: '**/evolution-integration.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        // Configurazioni specifiche per test SSE
        extraHTTPHeaders: {
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache'
        }
      },
    }
  ],

  // Web Server per test (Next.js dev server)
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      NODE_ENV: 'test',
      NEXT_PUBLIC_API_URL: 'http://localhost:3001/api',
      // Disabilita analytics nei test
      NEXT_PUBLIC_ANALYTICS_DISABLED: 'true'
    }
  }
});