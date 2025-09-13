import React from 'react';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { Earth } from '../../src/components/Earth';

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
});
