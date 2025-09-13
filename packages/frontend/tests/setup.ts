import '@testing-library/jest-dom';

// Lightweight, shared browser API mocks
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mute noisy act(...) warnings from R3F test renderer to keep output clean
const originalConsoleError = console.error;
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('not configured to support act')) {
      return;
    }
    originalConsoleError(...(args as any));
  });
});

afterAll(() => {
  (console.error as unknown as jest.Mock).mockRestore();
});
