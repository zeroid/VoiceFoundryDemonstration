module.exports = {
  roots: ['<rootDir>'], // use ['<rootDir>/lambdas', '<rootDir>/www'] to not run the CDK test
  testMatch: ['**/*.test.ts','**/*.test.js'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};
