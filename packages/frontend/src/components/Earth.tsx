import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Mesh, TextureLoader, RepeatWrapping } from 'three';
import { useTexture } from '@react-three/drei';

export const Earth: React.FC = () => {
  const meshRef = useRef<Mesh>(null);

  // Create a simple procedural texture for now
  const earthTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Create a simple Earth-like texture
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, '#4A90E2');
    gradient.addColorStop(0.7, '#2E5B8A');
    gradient.addColorStop(1, '#1A3A5C');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    // Add some continent-like shapes
    ctx.fillStyle = '#2D5A2D';
    ctx.beginPath();
    ctx.arc(200, 200, 80, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(350, 300, 60, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(150, 400, 70, 0, Math.PI * 2);
    ctx.fill();

    const texture = new TextureLoader().load(canvas.toDataURL());
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    return texture;
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        map={earthTexture}
        roughness={0.8}
        metalness={0.1}
        emissive="#0A1A2A"
        emissiveIntensity={0.1}
      />
    </mesh>
  );
};
