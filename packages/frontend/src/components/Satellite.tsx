import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, MeshStandardMaterial } from 'three';
import type { SatelliteData } from '@shared/types';

interface SatelliteProps {
  satellite: SatelliteData;
}

const getSatelliteColor = (type: string): string => {
  const colors = {
    communication: '#3B82F6',
    weather: '#10B981',
    military: '#EF4444',
    scientific: '#8B5CF6',
    navigation: '#F59E0B',
    'space-station': '#EC4899',
    debris: '#6B7280',
    other: '#9CA3AF',
  };
  return colors[type as keyof typeof colors] || colors.other;
};

const getSatelliteSize = (type: string): number => {
  const sizes = {
    communication: 0.08,
    weather: 0.1,
    military: 0.06,
    scientific: 0.12,
    navigation: 0.09,
    'space-station': 0.15,
    debris: 0.03,
    other: 0.05,
  };
  return sizes[type as keyof typeof sizes] || sizes.other;
};

export const Satellite: React.FC<SatelliteProps> = ({ satellite }) => {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);

  const color = useMemo(() => getSatelliteColor(satellite.type), [satellite.type]);
  const size = useMemo(() => getSatelliteSize(satellite.type), [satellite.type]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;

      // Add subtle pulsing effect
      if (materialRef.current) {
        const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.9;
        materialRef.current.emissiveIntensity = pulse * 0.3;
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[satellite.position.x, satellite.position.y, satellite.position.z]}
      castShadow
    >
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial
        ref={materialRef}
        color={color}
        emissive={color}
        emissiveIntensity={0.2}
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  );
};
