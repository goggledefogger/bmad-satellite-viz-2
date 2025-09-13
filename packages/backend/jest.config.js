import base from '../../jest.base.config.js';

/** @type {import('jest').Config} */
export default {
  ...base,
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/../shared/src/$1',
  },
  collectCoverageFrom: [
    ...base.collectCoverageFrom,
    '!src/server.ts',
  ],
};
