import React from 'react';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { Atmosphere } from '../../src/components/Atmosphere';

describe('Atmosphere Component', () => {
  it('renders glow mesh when enabled (smoke)', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <Atmosphere enableGlow={true} enableParticles={false} earthRadius={1.0} intensity={0.4} />
    );
    expect(renderer.scene).toBeDefined();
  });

  it('renders particle system when enabled (smoke)', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <Atmosphere enableGlow={false} enableParticles={true} earthRadius={1.0} />
    );
    expect(renderer.scene).toBeDefined();
  });
});
