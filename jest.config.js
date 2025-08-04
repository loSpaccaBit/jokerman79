/**
 * Configurazione Jest per test Evolution Gaming
 * Supporta TypeScript, React Testing Library, mocking SSE
 */

const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Path dell'app Next.js per caricare next.config.js e .env
  dir: './',
});

const customJestConfig = {
  // Ambiente di test
  testEnvironment: 'jsdom',
  
  // Setup files che vengono eseguiti prima di ogni test
  setupFilesAfterEnv: [
    '<rootDir>/src/__tests__/setup/jest.setup.ts'
  ],
  
  // Pattern per trovare i file di test
  testMatch: [
    '<rootDir>/src/__tests__/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],
  
  // Ignora test E2E di Playwright
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/src/__tests__/e2e/'
  ],
  
  // Mapping dei moduli per alias
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1'
  },
  
  // Estensioni dei file da considerare
  moduleFileExtensions: [
    'js',
    'jsx',
    'ts',
    'tsx',
    'json'
  ],
  
  // Trasformazioni per diversi tipi di file
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
    '^.+\\.css$': 'jest-transform-stub',
    '^.+\\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$': 'jest-transform-stub'
  },
  
  // File che non devono essere trasformati
  transformIgnorePatterns: [
    '/node_modules/(?!(eventsource)/)', // Permetti trasformazione di eventsource per test SSE
    '^.+\\.module\\.(css|sass|scss)$'
  ],
  
  // Mocking automatico
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
  
  // Coverage configuration
  collectCoverageFrom: [
    '!src/**/*.d.ts',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**/*',
    '!src/test-utils/**/*'
  ],
  
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],
  
  coverageDirectory: '<rootDir>/coverage',
  
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Timeout per test lunghi (SSE)
  testTimeout: 30000,
  
  // Variables globali per test
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  
  // Setup per test specifici
  projects: [
    {
      displayName: 'unit',
      testMatch: [
        '<rootDir>/src/__tests__/**/*.test.{js,jsx,ts,tsx}'
      ],
      testEnvironment: 'jsdom'
    },
    {
      displayName: 'integration',
      testMatch: [
        '<rootDir>/src/__tests__/integration/**/*.test.{js,jsx,ts,tsx}'
      ],
      testEnvironment: 'node'
    }
  ],
  
  // Reporter personalizzati
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './coverage/html-report',
        filename: 'evolution-test-report.html',
        pageTitle: 'Evolution Gaming Test Report',
        logoImgPath: './public/assets/logo.svg',
        hideIcon: false,
        expand: true,
        openReport: false
      }
    ]
  ],
  
  // Watch mode configuration
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/coverage/'
  ],
  
  // Verbose output per debug
  verbose: true,
  
  // Silent per ridurre output in CI
  silent: false,
  
  // Error handling
  errorOnDeprecated: true,
  
  // Performance monitoring
  detectOpenHandles: true,
  detectLeaks: true,
  
  // Retry failed tests
  maxWorkers: '50%'
};

// Crea ed esporta la configurazione
module.exports = createJestConfig(customJestConfig);