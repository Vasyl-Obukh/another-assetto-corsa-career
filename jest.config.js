// Jest runs against CommonJS output rather than the native ESM the app ships.
// That is deliberate: jest.mock() only hoists in CJS, and the fs-mocking the
// tests rely on would otherwise need unstable_mockModule and a dynamic import in
// every file. Nothing under test uses import.meta, so the two are equivalent.

/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],

  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.test.json',
      // tsc already typechecks both projects; re-doing it here only slows tests.
      diagnostics: false,
    }],
  },

  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],

  // Mirrors the @/* alias from src/renderer/tsconfig.json.
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/renderer/src/$1',
  },

  clearMocks: true,
  restoreMocks: true,
};
