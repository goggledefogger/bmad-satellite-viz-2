import React from 'react';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { ParticleSystem } from '../../src/components/ParticleSystem';

describe('ParticleSystem Component', () => {
  it('renders with default settings (smoke)', async () => {
    const renderer = await ReactThreeTestRenderer.create(<ParticleSystem enabled={true} />);
    expect(renderer.scene).toBeDefined();
  });

  it('does not crash when disabled (smoke)', async () => {
    const renderer = await ReactThreeTestRenderer.create(<ParticleSystem enabled={false} />);
    expect(renderer.scene).toBeDefined();
  });
});
