import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { createEarthShaderMaterial } from '../utils/shaders';
import { usePerformanceMonitor } from './usePerformanceMonitor';
import { detectWebGLCapabilities, getShaderCompatibility, getBrowserOptimizations } from '../utils/webglDetection';

interface AdaptiveShaderEffectsOptions {
  /** Base shimmer intensity (0-1) */
  shimmerIntensity?: number;
  /** Base shimmer speed (0-5) */
  shimmerSpeed?: number;
  /** Base glow intensity (0-1) */
  glowIntensity?: number;
  /** Base surface displacement (0-1) */
  surfaceDisplacement?: number;
  /** Light direction for lighting calculations */
  lightDirection?: Vector3;
  /** Light color for lighting calculations */
  lightColor?: Vector3;
  /** Day/night cycle progress (0-1) */
  dayNightCycle?: number;
  /** Enable/disable effects for performance */
  enabled?: boolean;
  /** Target FPS for performance monitoring */
  targetFps?: number;
  /** Enable automatic quality adjustment */
  enableAdaptiveQuality?: boolean;
}

interface QualityLevel {
  shimmerIntensity: number;
  shimmerSpeed: number;
  glowIntensity: number;
  surfaceDisplacement: number;
  name: string;
}

const QUALITY_LEVELS: QualityLevel[] = [
  {
    name: 'ultra',
    shimmerIntensity: 1.0,
    shimmerSpeed: 1.0,
    glowIntensity: 1.0,
    surfaceDisplacement: 1.0
  },
  {
    name: 'high',
    shimmerIntensity: 0.8,
    shimmerSpeed: 0.8,
    glowIntensity: 0.8,
    surfaceDisplacement: 0.8
  },
  {
    name: 'medium',
    shimmerIntensity: 0.6,
    shimmerSpeed: 0.6,
    glowIntensity: 0.6,
    surfaceDisplacement: 0.6
  },
  {
    name: 'low',
    shimmerIntensity: 0.4,
    shimmerSpeed: 0.4,
    glowIntensity: 0.4,
    surfaceDisplacement: 0.4
  },
  {
    name: 'minimal',
    shimmerIntensity: 0.2,
    shimmerSpeed: 0.2,
    glowIntensity: 0.2,
    surfaceDisplacement: 0.2
  }
];

export const useAdaptiveShaderEffects = (options: AdaptiveShaderEffectsOptions = {}) => {
  const {
    shimmerIntensity = 0.5,
    shimmerSpeed = 2.0,
    glowIntensity = 0.3,
    surfaceDisplacement = 0.2,
    lightDirection = new Vector3(1, 1, 1).normalize(),
    lightColor = new Vector3(1, 1, 1),
    dayNightCycle = 0.0,
    enabled = true,
    targetFps = 60,
    enableAdaptiveQuality = true
  } = options;

  const [currentQualityLevel, setCurrentQualityLevel] = useState<number>(0);
  const [isAdapting, setIsAdapting] = useState<boolean>(false);
  const [webglCapabilities, setWebglCapabilities] = useState<any>(null);
  const timeRef = useRef(0);

  // Detect WebGL capabilities on mount
  useEffect(() => {
    const capabilities = detectWebGLCapabilities();
    const compatibility = getShaderCompatibility(capabilities);
    const optimizations = getBrowserOptimizations();

    setWebglCapabilities({ capabilities, compatibility, optimizations });

    // Set initial quality level based on WebGL capabilities
    const initialQualityIndex = QUALITY_LEVELS.findIndex(level => level.name === compatibility.recommendedQualityLevel);
    if (initialQualityIndex !== -1) {
      setCurrentQualityLevel(initialQualityIndex);
    }
  }, []);

  // Performance monitoring
  const { stats, isLowPerformance } = usePerformanceMonitor({
    targetFps,
    enabled: enableAdaptiveQuality,
    onPerformanceDrop: (stats) => {
      console.log(`Performance drop detected: ${stats.averageFps.toFixed(1)} FPS`);
      if (enableAdaptiveQuality && currentQualityLevel < QUALITY_LEVELS.length - 1) {
        setIsAdapting(true);
        setCurrentQualityLevel(prev => Math.min(prev + 1, QUALITY_LEVELS.length - 1));
        setTimeout(() => setIsAdapting(false), 1000);
      }
    },
    onPerformanceRecover: (stats) => {
      console.log(`Performance recovered: ${stats.averageFps.toFixed(1)} FPS`);
      if (enableAdaptiveQuality && currentQualityLevel > 0) {
        setIsAdapting(true);
        setCurrentQualityLevel(prev => Math.max(prev - 1, 0));
        setTimeout(() => setIsAdapting(false), 2000);
      }
    }
  });

  // Get current quality level
  const qualityLevel = QUALITY_LEVELS[currentQualityLevel];

  // Calculate adaptive values
  const adaptiveShimmerIntensity = useMemo(() => {
    return shimmerIntensity * qualityLevel.shimmerIntensity;
  }, [shimmerIntensity, qualityLevel.shimmerIntensity]);

  const adaptiveShimmerSpeed = useMemo(() => {
    return shimmerSpeed * qualityLevel.shimmerSpeed;
  }, [shimmerSpeed, qualityLevel.shimmerSpeed]);

  const adaptiveGlowIntensity = useMemo(() => {
    return glowIntensity * qualityLevel.glowIntensity;
  }, [glowIntensity, qualityLevel.glowIntensity]);

  const adaptiveSurfaceDisplacement = useMemo(() => {
    return surfaceDisplacement * qualityLevel.surfaceDisplacement;
  }, [surfaceDisplacement, qualityLevel.surfaceDisplacement]);

  // Create shader material with adaptive settings
  const shaderMaterial = useMemo(() => {
    if (!enabled) return null;

    return createEarthShaderMaterial(0, {
      shimmerIntensity: adaptiveShimmerIntensity,
      shimmerSpeed: adaptiveShimmerSpeed,
      glowIntensity: adaptiveGlowIntensity,
      surfaceDisplacement: adaptiveSurfaceDisplacement,
      lightDirection,
      lightColor,
      dayNightCycle
    });
  }, [
    enabled,
    adaptiveShimmerIntensity,
    adaptiveShimmerSpeed,
    adaptiveGlowIntensity,
    adaptiveSurfaceDisplacement,
    lightDirection,
    lightColor,
    dayNightCycle
  ]);

  // Update time uniform for animations
  useFrame((state) => {
    if (shaderMaterial && enabled) {
      timeRef.current = state.clock.elapsedTime;
      shaderMaterial.uniforms.time.value = timeRef.current;
      shaderMaterial.uniforms.shimmerSpeed.value = adaptiveShimmerSpeed;
    }
  });

  // Update material uniforms when options change
  useMemo(() => {
    if (shaderMaterial && enabled) {
      shaderMaterial.uniforms.shimmerIntensity.value = adaptiveShimmerIntensity;
      shaderMaterial.uniforms.glowIntensity.value = adaptiveGlowIntensity;
      shaderMaterial.uniforms.surfaceDisplacement.value = adaptiveSurfaceDisplacement;
      shaderMaterial.uniforms.lightDirection.value = lightDirection;
      shaderMaterial.uniforms.lightColor.value = lightColor;
      shaderMaterial.uniforms.dayNightCycle.value = dayNightCycle;
    }
  }, [
    shaderMaterial,
    enabled,
    adaptiveShimmerIntensity,
    adaptiveGlowIntensity,
    adaptiveSurfaceDisplacement,
    lightDirection,
    lightColor,
    dayNightCycle
  ]);

  return {
    shaderMaterial,
    qualityLevel: qualityLevel.name,
    currentQualityIndex: currentQualityLevel,
    isAdapting,
    performanceStats: stats,
    isLowPerformance,
    webglCapabilities,
    adaptiveValues: {
      shimmerIntensity: adaptiveShimmerIntensity,
      shimmerSpeed: adaptiveShimmerSpeed,
      glowIntensity: adaptiveGlowIntensity,
      surfaceDisplacement: adaptiveSurfaceDisplacement
    }
  };
};
