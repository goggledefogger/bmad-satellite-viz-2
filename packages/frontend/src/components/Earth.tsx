import React, { useRef, useMemo, useState, useEffect, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, TextureLoader, RepeatWrapping, LinearFilter, LinearMipmapLinearFilter, Vector3 } from 'three';
import { primitive } from '@react-three/drei';
import { useAdaptiveShaderEffects } from '../hooks/useAdaptiveShaderEffects';
import { ParticleSystem } from './ParticleSystem';
import { Atmosphere } from './Atmosphere';

interface EarthProps {
  /** Enable/disable Earth rotation */
  enableRotation?: boolean;
  /** Rotation speed multiplier (1.0 = 24-hour day cycle) */
  rotationSpeed?: number;
  /** Enable atmospheric effects */
  enableAtmosphere?: boolean;
  /** Earth scale factor */
  scale?: number;
  /** Enable artistic shader effects */
  enableShaderEffects?: boolean;
  /** Shimmer intensity (0-1) */
  shimmerIntensity?: number;
  /** Shimmer animation speed (0-5) */
  shimmerSpeed?: number;
  /** Glow intensity (0-1) */
  glowIntensity?: number;
  /** Surface displacement amount (0-1) */
  surfaceDisplacement?: number;
  /** Enable particle system */
  enableParticles?: boolean;
  /** Number of particles in the system */
  particleCount?: number;
  /** Size of individual particles */
  particleSize?: number;
  /** Color of particles (hex string) */
  particleColor?: string;
  /** Animation speed for particles */
  animationSpeed?: number;
  /** Spread radius for particles */
  spreadRadius?: number;
  /** Enable adaptive quality adjustment */
  enableAdaptiveQuality?: boolean;
  /** Target FPS for performance monitoring */
  targetFps?: number;
}

export const Earth = forwardRef<Mesh, EarthProps>(({
  enableRotation = true,
  rotationSpeed = 1.0,
  enableAtmosphere = true,
  scale = 1.0,
  enableShaderEffects = true,
  shimmerIntensity = 0.5,
  shimmerSpeed = 2.0,
  glowIntensity = 0.3,
  surfaceDisplacement = 0.2,
  enableParticles = true,
  particleCount = 500,
  particleSize = 0.005,
  particleColor = "#ffffff",
  animationSpeed = 0.5,
  spreadRadius = 1.5,
  enableAdaptiveQuality = true,
  targetFps = 60
}, ref) => {
  const meshRef = useRef<Mesh>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Use adaptive shader effects hook
  const {
    shaderMaterial,
    qualityLevel,
    isAdapting,
    performanceStats,
    isLowPerformance,
    adaptiveValues
  } = useAdaptiveShaderEffects({
    shimmerIntensity,
    shimmerSpeed,
    glowIntensity,
    surfaceDisplacement,
    lightDirection: new Vector3(1, 1, 1).normalize(),
    lightColor: new Vector3(1, 1, 1),
    dayNightCycle: 0.0,
    enabled: enableShaderEffects,
    targetFps,
    enableAdaptiveQuality
  });

  // Create high-quality procedural Earth texture
  const earthTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; // Higher resolution for better quality
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Create ocean base with gradient
    const oceanGradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 512);
    oceanGradient.addColorStop(0, '#1E3A8A'); // Deep blue center
    oceanGradient.addColorStop(0.3, '#3B82F6'); // Blue
    oceanGradient.addColorStop(0.7, '#60A5FA'); // Light blue
    oceanGradient.addColorStop(1, '#93C5FD'); // Very light blue

    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, 1024, 1024);

    // Add continent shapes with more realistic patterns
    ctx.fillStyle = '#16A34A'; // Forest green
    ctx.beginPath();
    ctx.arc(300, 300, 120, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(700, 400, 100, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(200, 600, 80, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(800, 200, 90, 0, Math.PI * 2);
    ctx.fill();

    // Add some desert/arid regions
    ctx.fillStyle = '#D97706'; // Orange
    ctx.beginPath();
    ctx.arc(400, 700, 60, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(600, 150, 50, 0, Math.PI * 2);
    ctx.fill();

    // Add polar ice caps
    ctx.fillStyle = '#F8FAFC'; // White
    ctx.beginPath();
    ctx.arc(512, 100, 80, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(512, 924, 80, 0, Math.PI * 2);
    ctx.fill();

    const texture = new TextureLoader().load(canvas.toDataURL());
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.generateMipmaps = true;
    texture.minFilter = LinearMipmapLinearFilter;
    texture.magFilter = LinearFilter;

    return texture;
  }, []);

  // Create normal map for surface detail
  const normalMap = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Create a subtle normal map for surface detail
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, '#8080FF');
    gradient.addColorStop(0.5, '#8080FF');
    gradient.addColorStop(1, '#8080FF');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    const texture = new TextureLoader().load(canvas.toDataURL());
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    return texture;
  }, []);

  // Earth rotation animation with realistic 24-hour day cycle
  useFrame((state, delta) => {
    if (meshRef.current && enableRotation) {
      // Rotate once per 24 hours (86400 seconds) at normal speed
      const rotationSpeedRadians = (delta * rotationSpeed) / 86400;
      meshRef.current.rotation.y += rotationSpeedRadians;
    }
  });

  // Set loaded state when texture is ready
  useEffect(() => {
    if (earthTexture && normalMap) {
      setIsLoaded(true);
    }
  }, [earthTexture, normalMap]);

  return (
    <group scale={[scale, scale, scale]}>
      {/* Main Earth mesh */}
      <mesh
        ref={ref}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[1, 128, 128]} />
        {enableShaderEffects && shaderMaterial ? (
          <primitive object={shaderMaterial} attach="material" />
        ) : (
          <meshStandardMaterial
            map={earthTexture}
            normalMap={normalMap}
            roughness={0.7}
            metalness={0.1}
            emissive="#0A1A2A"
            emissiveIntensity={0.05}
            transparent={false}
          />
        )}
      </mesh>

      {/* Enhanced atmospheric effect */}
      {enableAtmosphere && (
        <Atmosphere
          enableGlow={true}
          enableParticles={false}
          intensity={0.4}
          color="#4A90E2"
          earthRadius={1.0}
          glowIntensity={adaptiveValues.glowIntensity}
          animationSpeed={adaptiveValues.shimmerSpeed * 0.5}
          enableDynamicColors={true}
        />
      )}

      {/* Particle system for space environment */}
      {enableParticles && (
        <ParticleSystem
          particleCount={particleCount}
          particleSize={particleSize}
          particleColor={particleColor}
          animationSpeed={animationSpeed}
          spreadRadius={spreadRadius}
          enabled={enableParticles}
        />
      )}

      {/* Performance monitoring indicator */}
      {process.env.NODE_ENV === 'development' && (
        <group position={[0, 0, 1.5]}>
          {/* Load status indicator */}
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.05, 0.05, 0.05]} />
            <meshBasicMaterial
              color={isLoaded ? "#00FF00" : "#FF0000"}
              transparent
              opacity={0.8}
            />
          </mesh>

          {/* Performance quality indicator */}
          <mesh position={[0, -0.1, 0]}>
            <boxGeometry args={[0.05, 0.05, 0.05]} />
            <meshBasicMaterial
              color={
                isLowPerformance ? "#FF0000" :
                isAdapting ? "#FFA500" :
                qualityLevel === 'ultra' ? "#00FF00" :
                qualityLevel === 'high' ? "#00FF80" :
                qualityLevel === 'medium' ? "#FFFF00" :
                qualityLevel === 'low' ? "#FF8000" : "#FF0000"
              }
              transparent
              opacity={0.8}
            />
          </mesh>
        </group>
      )}
    </group>
  );
});
