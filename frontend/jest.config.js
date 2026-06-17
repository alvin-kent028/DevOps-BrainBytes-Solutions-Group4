module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!**/*.module.{js,jsx}',
    '!**/node_modules/**'
  ],
  testMatch: ['**/__tests__/**/*.{js,jsx}', '**/?(*.)+(spec|test).{js,jsx}']
};
