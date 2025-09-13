import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, ShaderMaterial, Vector3 } from 'three';

interface AtmosphereProps {
  /** Enable atmospheric glow effect */
  enableGlow?: boolean;
  /** Enable particle effects */
  enableParticles?: boolean;
  /** Atmosphere intensity (0-1) */
  intensity?: number;
  /** Atmosphere color */
  color?: string;
  /** Earth radius for atmosphere sizing */
  earthRadius?: number;
}

export const Atmosphere: React.FC<AtmosphereProps> = ({
  enableGlow = true,
  enableParticles = true,
  intensity = 0.3,
  color = '#4A90E2',
  earthRadius = 1.0
}) => {
  const atmosphereRef = useRef<Mesh>(null);
  const particlesRef = useRef<Mesh>(null);

  // Atmospheric glow shader material
  const atmosphereMaterial = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        intensity: { value: intensity },
        color: { value: new Vector3().setHex(parseInt(color.replace('#', ''), 16)) },
        earthRadius: { value: earthRadius }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float intensity;
        uniform vec3 color;
        uniform float earthRadius;

        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          // Create atmospheric glow effect
          float fresnel = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0));
          fresnel = pow(fresnel, 2.0);

          // Add subtle animation
          float pulse = sin(time * 0.5) * 0.1 + 0.9;

          // Create atmospheric scattering effect
          float distance = length(vPosition);
          float atmosphereThickness = (distance - earthRadius) / (earthRadius * 0.1);
          atmosphereThickness = clamp(atmosphereThickness, 0.0, 1.0);

          // Combine effects
          float alpha = fresnel * intensity * pulse * atmosphereThickness;
          vec3 finalColor = color * alpha;

          gl_FragColor = vec4(finalColor, alpha * 0.8);
        }
      `,
      transparent: true,
      side: 2 // DoubleSide
    });
  }, [intensity, color, earthRadius]);

  // Particle system for atmospheric effects
  const particleGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(1000 * 3);
    const colors = new Float32Array(1000 * 3);

    for (let i = 0; i < 1000; i++) {
      // Random positions around Earth
      const radius = earthRadius + Math.random() * 0.1;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Atmospheric colors
      colors[i * 3] = 0.3 + Math.random() * 0.2; // R
      colors[i * 3 + 1] = 0.5 + Math.random() * 0.3; // G
      colors[i * 3 + 2] = 0.8 + Math.random() * 0.2; // B
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    return geometry;
  }, [earthRadius]);

  // Animation frame updates
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Update atmosphere shader
    if (atmosphereRef.current && atmosphereMaterial) {
      atmosphereMaterial.uniforms.time.value = time;
    }

    // Animate particles
    if (particlesRef.current && enableParticles) {
      particlesRef.current.rotation.y += 0.001;
      particlesRef.current.rotation.x += 0.0005;
    }
  });

  return (
    <group>
      {/* Atmospheric glow effect */}
      {enableGlow && (
        <mesh ref={atmosphereRef}>
          <sphereGeometry args={[earthRadius * 1.05, 64, 64]} />
          <primitive object={atmosphereMaterial} />
        </mesh>
      )}

      {/* Particle system */}
      {enableParticles && (
        <mesh ref={particlesRef}>
          <primitive object={particleGeometry} />
          <pointsMaterial
            size={0.01}
            vertexColors
            transparent
            opacity={0.6}
            sizeAttenuation
          />
        </mesh>
      )}
    </group>
  );
};
