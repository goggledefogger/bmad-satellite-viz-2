import React from 'react';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { Earth } from '../../src/components/Earth';

// Scope Canvas mocks to this test to avoid global bloat
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

Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
  value: jest.fn(() => 'data:image/png;base64,mock-data-url'),
});

// Minimal mock for texture loading only
jest.mock('three', () => ({
  ...jest.requireActual('three'),
  TextureLoader: jest.fn().mockImplementation(() => ({
    load: jest.fn().mockReturnValue({
      wrapS: 1000,
      wrapT: 1000,
      generateMipmaps: true,
      minFilter: 1009,
      magFilter: 1006,
    }),
  })),
}));

describe('Earth Component', () => {
  it('renders without crashing', async () => {
    const renderer = await ReactThreeTestRenderer.create(<Earth />);
    expect(renderer.scene).toBeDefined();
  });

  it('renders with custom props', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <Earth
        enableRotation={false}
        rotationSpeed={2.0}
        enableAtmosphere={false}
        scale={1.5}
      />
    );
    expect(renderer.scene).toBeDefined();
  });

  it('handles rotation state changes', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <Earth enableRotation={true} />
    );
    expect(renderer.scene).toBeDefined();

    await renderer.update(<Earth enableRotation={false} />);
    expect(renderer.scene).toBeDefined();
  });

  it('renders with and without shader effects (smoke)', async () => {
    const noShader = await ReactThreeTestRenderer.create(
      <Earth enableShaderEffects={false} enableAtmosphere={false} enableParticles={false} />
    );
    expect(noShader.scene).toBeDefined();

    const withShader = await ReactThreeTestRenderer.create(
      <Earth enableShaderEffects={true} enableAtmosphere={false} enableParticles={false} />
    );
    expect(withShader.scene).toBeDefined();
  });

  it('renders with Atmosphere and ParticleSystem enabled (smoke)', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <Earth enableAtmosphere={true} enableParticles={true} />
    );
    expect(renderer.scene).toBeDefined();
  });
});
