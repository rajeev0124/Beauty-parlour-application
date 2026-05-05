/**
 * Jest Setup File
 * Global configuration for all tests
 */

import { config } from 'dotenv';

// Load environment variables from .env.test
config({ path: '.env.test' });

// Set test timeout
jest.setTimeout(10000);

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Handle async errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Setup global test utilities
global.testUtils = {
  /**
   * Sleep for specified milliseconds
   */
  sleep: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

  /**
   * Retry function for flaky tests
   */
  retry: async (
    fn: () => Promise<void>,
    retries: number = 3,
    delayMs: number = 1000,
  ) => {
    for (let i = 0; i < retries; i++) {
      try {
        await fn();
        return;
      } catch (error) {
        if (i === retries - 1) throw error;
        await global.testUtils.sleep(delayMs);
      }
    }
  },

  /**
   * Wait for condition to be true
   */
  waitFor: async (
    condition: () => boolean,
    timeoutMs: number = 5000,
    intervalMs: number = 100,
  ) => {
    const startTime = Date.now();
    while (!condition()) {
      if (Date.now() - startTime > timeoutMs) {
        throw new Error('Timeout waiting for condition');
      }
      await global.testUtils.sleep(intervalMs);
    }
  },
};

// TypeScript declaration for global test utilities
declare global {
  const testUtils: any;
}
