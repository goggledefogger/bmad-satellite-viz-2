import '@testing-library/jest-dom';

// Minimal mocks for browser APIs
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

// Mock Canvas 2D context for Earth component
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: jest.fn((contextType) => {
    if (contextType === '2d') {
      return {
        createRadialGradient: jest.fn().mockReturnValue({
          addColorStop: jest.fn(),
        }),
        createLinearGradient: jest.fn().mockReturnValue({
          addColorStop: jest.fn(),
        }),
        fillRect: jest.fn(),
        clearRect: jest.fn(),
        getImageData: jest.fn(() => ({ data: new Array(4) })),
        putImageData: jest.fn(),
        createImageData: jest.fn(() => ({ data: new Array(4) })),
        setTransform: jest.fn(),
        drawImage: jest.fn(),
        save: jest.fn(),
        restore: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        closePath: jest.fn(),
        stroke: jest.fn(),
        fill: jest.fn(),
        measureText: jest.fn(() => ({ width: 0 })),
        transform: jest.fn(),
        rect: jest.fn(),
        arc: jest.fn(),
      };
    }
    return null;
  }),
});

// Mock Canvas toDataURL method
Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
  value: jest.fn(() => 'data:image/png;base64,mock-data-url'),
});
