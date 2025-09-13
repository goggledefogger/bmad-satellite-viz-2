import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferGeometry, BufferAttribute, Points, Vector3 } from 'three';

interface ParticleSystemProps {
  /** Number of particles to create */
  particleCount?: number;
  /** Particle size */
  particleSize?: number;
  /** Particle color */
  particleColor?: string;
  /** Animation speed */
  animationSpeed?: number;
  /** Particle spread radius */
  spreadRadius?: number;
  /** Enable/disable particle system */
  enabled?: boolean;
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  particleCount = 1000,
  particleSize = 0.01,
  particleColor = '#ffffff',
  animationSpeed = 1.0,
  spreadRadius = 2.0,
  enabled = true
}) => {
  const pointsRef = useRef<Points>(null);
  const timeRef = useRef(0);

  // Create particle geometry
  const particleGeometry = useMemo(() => {
    const geometry = new BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // Parse color - handle test environment
    const color = new Vector3();
    if (particleColor.startsWith('#')) {
      const hex = parseInt(particleColor.slice(1), 16);
      // Convert hex to RGB values
      color.x = ((hex >> 16) & 255) / 255;
      color.y = ((hex >> 8) & 255) / 255;
      color.z = (hex & 255) / 255;
    } else {
      color.set(1, 1, 1); // Default white
    }

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Random positions within spread radius
      positions[i3] = (Math.random() - 0.5) * spreadRadius * 2;
      positions[i3 + 1] = (Math.random() - 0.5) * spreadRadius * 2;
      positions[i3 + 2] = (Math.random() - 0.5) * spreadRadius * 2;

      // Random colors with slight variation
      colors[i3] = color.x + (Math.random() - 0.5) * 0.2;
      colors[i3 + 1] = color.y + (Math.random() - 0.5) * 0.2;
      colors[i3 + 2] = color.z + (Math.random() - 0.5) * 0.2;

      // Random sizes
      sizes[i] = particleSize * (0.5 + Math.random() * 0.5);
    }

    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('color', new BufferAttribute(colors, 3));
    geometry.setAttribute('size', new BufferAttribute(sizes, 1));

    return geometry;
  }, [particleCount, particleSize, particleColor, spreadRadius]);

  // Animate particles
  useFrame((state, delta) => {
    if (pointsRef.current && enabled) {
      timeRef.current += delta * animationSpeed;

      const positions = particleGeometry.attributes.position.array as Float32Array;
      const colors = particleGeometry.attributes.color.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Gentle floating animation
        positions[i3 + 1] += Math.sin(timeRef.current + i * 0.01) * 0.0001;

        // Subtle color pulsing
        const pulse = Math.sin(timeRef.current * 0.5 + i * 0.1) * 0.1 + 0.9;
        colors[i3] *= pulse;
        colors[i3 + 1] *= pulse;
        colors[i3 + 2] *= pulse;
      }

      particleGeometry.attributes.position.needsUpdate = true;
      particleGeometry.attributes.color.needsUpdate = true;
    }
  });

  if (!enabled) return null;

  return (
    <points ref={pointsRef} geometry={particleGeometry}>
      <shaderMaterial
        vertexShader={`
          attribute float size;
          varying vec3 vColor;

          void main() {
            // 'color' attribute is provided by THREE when vertexColors is enabled
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          varying vec3 vColor;

          void main() {
            float distance = length(gl_PointCoord - vec2(0.5));
            if (distance > 0.5) discard;

            float alpha = 1.0 - smoothstep(0.0, 0.5, distance);
            gl_FragColor = vec4(vColor, alpha * 0.6);
          }
        `}
        transparent
        vertexColors
      />
    </points>
  );
};
