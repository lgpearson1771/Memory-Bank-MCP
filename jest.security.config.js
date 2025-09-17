const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/security'],
  testMatch: [
    '**/security/**/*.test.ts',
    '**/security/**/*.spec.ts'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/security/setup.ts'],
  testTimeout: 10000
};

export default config;