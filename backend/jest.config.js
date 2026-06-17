module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    '**/*.js',
    '!node_modules/**',
    '!jest.config.js'
  ],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js']
};
