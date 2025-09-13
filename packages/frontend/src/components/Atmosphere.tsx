import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, ShaderMaterial, Vector3, Color, BufferGeometry, BufferAttribute } from 'three';
import { primitive } from '@react-three/drei';

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
  /** Glow intensity multiplier */
  glowIntensity?: number;
  /** Animation speed for atmospheric effects */
  animationSpeed?: number;
  /** Enable dynamic color changes */
  enableDynamicColors?: boolean;
}

export const Atmosphere: React.FC<AtmosphereProps> = ({
  enableGlow = true,
  enableParticles = true,
  intensity = 0.3,
  color = '#4A90E2',
  earthRadius = 1.0,
  glowIntensity = 1.0,
  animationSpeed = 0.5,
  enableDynamicColors = true
}) => {
  const atmosphereRef = useRef<Mesh>(null);
  const particlesRef = useRef<Mesh>(null);

  // Enhanced atmospheric glow shader material
  const atmosphereMaterial = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        intensity: { value: intensity },
        glowIntensity: { value: glowIntensity },
        animationSpeed: { value: animationSpeed },
        color: { value: new Color(color) },
        earthRadius: { value: earthRadius },
        enableDynamicColors: { value: enableDynamicColors ? 1.0 : 0.0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        varying vec3 vViewDirection;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          vViewDirection = normalize(cameraPosition - vWorldPosition);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float intensity;
        uniform float glowIntensity;
        uniform float animationSpeed;
        uniform vec3 color;
        uniform float earthRadius;
        uniform float enableDynamicColors;

        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        varying vec3 vViewDirection;

        // Noise function for atmospheric effects
        float noise(vec3 p) {
          return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
        }

        float smoothNoise(vec3 p) {
          vec3 i = floor(p);
          vec3 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);

          float a = noise(i);
          float b = noise(i + vec3(1.0, 0.0, 0.0));
          float c = noise(i + vec3(0.0, 1.0, 0.0));
          float d = noise(i + vec3(1.0, 1.0, 0.0));

          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        void main() {
          // Enhanced Fresnel-based atmospheric scattering
          float fresnel = 1.0 - max(0.0, dot(vNormal, vViewDirection));
          fresnel = pow(fresnel, 1.5);

          // Atmospheric thickness calculation
          float distance = length(vWorldPosition);
          float atmosphereThickness = (distance - earthRadius) / (earthRadius * 0.08);
          atmosphereThickness = clamp(atmosphereThickness, 0.0, 1.0);
          atmosphereThickness = pow(atmosphereThickness, 0.5);

          // Dynamic color based on time and position
          vec3 dynamicColor = color;
          if (enableDynamicColors > 0.5) {
            float colorShift = sin(time * animationSpeed + vPosition.x * 2.0) * 0.3;
            dynamicColor = mix(color, vec3(0.6, 0.8, 1.0), colorShift * 0.5);

            // Add subtle atmospheric noise
            float atmosphericNoise = smoothNoise(vWorldPosition * 0.5 + time * animationSpeed * 0.1);
            dynamicColor += vec3(atmosphericNoise * 0.1);
          }

          // Enhanced animation with multiple layers
          float pulse1 = sin(time * animationSpeed) * 0.1 + 0.9;
          float pulse2 = sin(time * animationSpeed * 1.5 + vPosition.x * 3.0) * 0.05 + 0.95;
          float combinedPulse = pulse1 * pulse2;

          // Atmospheric glow intensity
          float glow = fresnel * atmosphereThickness * intensity * glowIntensity * combinedPulse;

          // Add subtle rim lighting
          float rimLight = pow(fresnel, 0.5) * 0.3;
          glow += rimLight;

          // Final color calculation
          vec3 finalColor = dynamicColor * glow;
          float alpha = glow * 0.8;

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      side: 2 // DoubleSide
    });
  }, [intensity, glowIntensity, animationSpeed, color, earthRadius, enableDynamicColors]);

  // Particle system for atmospheric effects
  const particleGeometry = useMemo(() => {
    const geometry = new BufferGeometry();
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

    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('color', new BufferAttribute(colors, 3));

    return geometry;
  }, [earthRadius]);

  // Animation frame updates
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Update atmosphere shader uniforms
    if (atmosphereRef.current && atmosphereMaterial) {
      atmosphereMaterial.uniforms.time.value = time;
      atmosphereMaterial.uniforms.animationSpeed.value = animationSpeed;
      atmosphereMaterial.uniforms.glowIntensity.value = glowIntensity;
    }

    // Animate particles with enhanced movement
    if (particlesRef.current && enableParticles) {
      particlesRef.current.rotation.y += 0.001 * animationSpeed;
      particlesRef.current.rotation.x += 0.0005 * animationSpeed;
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
