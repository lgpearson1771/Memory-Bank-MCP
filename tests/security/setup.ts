/**
 * Security test setup
 * Configures security-focused testing environment
 */

beforeAll(() => {
  // Set strict security mode for tests
  process.env.NODE_ENV = 'test';
  process.env.SECURITY_MODE = 'strict';
});

beforeEach(() => {
  // Clear any cached modules that might affect security
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up any test artifacts
});