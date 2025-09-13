import base from '../../jest.base.config.js';

/** @type {import('jest').Config} */
export default {
  ...base,
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
