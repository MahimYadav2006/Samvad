module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
  ],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'Models/**/*.js',
    'middleware/**/*.js',
    'socketHandlers/**/*.js',
    'services/**/*.js',
    'utilities/**/*.js',
    'routes/**/*.js',
    'app.js',
    'socketServer.js',
    '!**/node_modules/**',
  ],
  testTimeout: 30000,
  verbose: true,
  // Automatically use __mocks__ directory for manual mocks
  automock: false,
  // Ensure proper module isolation between test files
  restoreMocks: true,
};
