import React from 'react';
import { render } from '@testing-library/react';
import { SatelliteVisualization } from '../../src/components/SatelliteVisualization';

// Mock React Three Fiber hooks that are used outside Canvas
jest.mock('@react-three/fiber', () => ({
  ...jest.requireActual('@react-three/fiber'),
  useThree: jest.fn(() => ({
    camera: { position: { x: 0, y: 0, z: 5 } },
    scene: {},
    gl: {},
  })),
}));

// Only mock the performance hook to avoid complex calculations
jest.mock('../../src/hooks/useEarthPerformance', () => ({
  useEarthPerformance: () => ({
    metrics: {
      fps: 60,
      frameTime: 16.67,
      memoryUsage: 0,
      drawCalls: 0,
      isSmooth: true,
      performanceLevel: 'high' as const,
      recommendedQuality: {
        geometryDetail: 128,
        textureResolution: 1024,
        enableShadows: true,
        enableParticles: true,
      },
    },
  }),
}));

describe('SatelliteVisualization Component', () => {
  it('renders without crashing', () => {
    render(<SatelliteVisualization />);
  });

  it('renders the main container', () => {
    const { container } = render(<SatelliteVisualization />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
