/* eslint-disable */
export default {
  displayName: 'budget-domain',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/budget-domain',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**'],
  coveragePathIgnorePatterns: ['<rootDir>/src/index.ts'],
};
