module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/../tests/integration'],
  testMatch: [
    '**/integration/**/*.test.ts',
    '**/integration/**/*.spec.ts'
  ],
  collectCoverageFrom: [
    '../src/**/*.ts',
    '!../src/**/*.d.ts',
    '!../src/index.ts',
    '!../src/**/__tests__/**',
    '!../src/**/*.spec.ts'
  ],
  coverageDirectory: '../coverage/integration',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/../tests/setup/jest.setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'ES2022',
        target: 'ES2022',
        moduleResolution: 'node'
      }
    }],
  },
  testTimeout: 30000,
  verbose: true,
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ]
};