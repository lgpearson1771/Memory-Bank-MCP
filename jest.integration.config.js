const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/integration/**/*.test.ts',
    '**/integration/**/*.spec.ts'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/integration/setup.ts'],
  testTimeout: 30000
};

export default config;