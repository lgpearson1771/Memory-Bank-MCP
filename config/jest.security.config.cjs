module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/../tests/security'],
  testMatch: [
    '**/security/**/*.test.ts',
    '**/security/**/*.spec.ts'
  ],
  setupFilesAfterEnv: ['<rootDir>/../tests/setup/jest.setup.js'],
  testTimeout: 10000,
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true
    }],
  }
};