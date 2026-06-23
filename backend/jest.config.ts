import type { Config } from 'jest';

const config: Config = {
  displayName: 'backend',
  preset: '../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../coverage/backend',
  testMatch: ['**/*.spec.ts'],
};

export default config;
