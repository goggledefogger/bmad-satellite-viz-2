import base from '../../jest.base.config.js';

/** @type {import('jest').Config} */
export default {
  ...base,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/../shared/src/$1',
    '^@ui/(.*)$': '<rootDir>/../ui/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          jsx: 'react-jsx',
        },
      },
    ],
  },
  collectCoverageFrom: [
    ...base.collectCoverageFrom,
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(three|@react-three|@react-three/fiber|@react-three/drei)/)',
  ],
};
