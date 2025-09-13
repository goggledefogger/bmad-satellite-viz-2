import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { createEarthShaderMaterial } from '../utils/shaders';

interface ShaderEffectsOptions {
  /** Intensity of shimmering effect (0-1) */
  shimmerIntensity?: number;
  /** Speed of shimmering animation (0-5) */
  shimmerSpeed?: number;
  /** Intensity of atmospheric glow (0-1) */
  glowIntensity?: number;
  /** Surface displacement amount (0-1) */
  surfaceDisplacement?: number;
  /** Light direction for lighting calculations */
  lightDirection?: Vector3;
  /** Light color for lighting calculations */
  lightColor?: Vector3;
  /** Day/night cycle progress (0-1) */
  dayNightCycle?: number;
  /** Enable/disable effects for performance */
  enabled?: boolean;
}

export const useShaderEffects = (options: ShaderEffectsOptions = {}) => {
  const {
    shimmerIntensity = 0.5,
    shimmerSpeed = 2.0,
    glowIntensity = 0.3,
    surfaceDisplacement = 0.2,
    lightDirection = new Vector3(1, 1, 1).normalize(),
    lightColor = new Vector3(1, 1, 1),
    dayNightCycle = 0.0,
    enabled = true
  } = options;

  const timeRef = useRef(0);
  const materialRef = useRef<any>(null);

  // Create shader material with current options
  const shaderMaterial = useMemo(() => {
    if (!enabled) return null;

    return createEarthShaderMaterial(0, {
      shimmerIntensity,
      shimmerSpeed,
      glowIntensity,
      surfaceDisplacement,
      lightDirection,
      lightColor,
      dayNightCycle
    });
  }, [
    enabled,
    shimmerIntensity,
    shimmerSpeed,
    glowIntensity,
    surfaceDisplacement,
    lightDirection,
    lightColor,
    dayNightCycle
  ]);

  // Update time uniform for animations
  useFrame((state) => {
    if (shaderMaterial && enabled) {
      timeRef.current = state.clock.elapsedTime;
      shaderMaterial.uniforms.time.value = timeRef.current;
      shaderMaterial.uniforms.shimmerSpeed.value = shimmerSpeed;
    }
  });

  // Update material uniforms when options change
  useMemo(() => {
    if (shaderMaterial && enabled) {
      shaderMaterial.uniforms.shimmerIntensity.value = shimmerIntensity;
      shaderMaterial.uniforms.glowIntensity.value = glowIntensity;
      shaderMaterial.uniforms.surfaceDisplacement.value = surfaceDisplacement;
      shaderMaterial.uniforms.lightDirection.value = lightDirection;
      shaderMaterial.uniforms.lightColor.value = lightColor;
      shaderMaterial.uniforms.dayNightCycle.value = dayNightCycle;
    }
  }, [
    shaderMaterial,
    enabled,
    shimmerIntensity,
    glowIntensity,
    surfaceDisplacement,
    lightDirection,
    lightColor,
    dayNightCycle
  ]);

  return {
    shaderMaterial,
    time: timeRef.current,
    updateUniforms: (newOptions: Partial<ShaderEffectsOptions>) => {
      if (shaderMaterial && enabled) {
        if (newOptions.shimmerIntensity !== undefined) {
          shaderMaterial.uniforms.shimmerIntensity.value = newOptions.shimmerIntensity;
        }
        if (newOptions.glowIntensity !== undefined) {
          shaderMaterial.uniforms.glowIntensity.value = newOptions.glowIntensity;
        }
        if (newOptions.surfaceDisplacement !== undefined) {
          shaderMaterial.uniforms.surfaceDisplacement.value = newOptions.surfaceDisplacement;
        }
        if (newOptions.lightDirection !== undefined) {
          shaderMaterial.uniforms.lightDirection.value = newOptions.lightDirection;
        }
        if (newOptions.lightColor !== undefined) {
          shaderMaterial.uniforms.lightColor.value = newOptions.lightColor;
        }
        if (newOptions.dayNightCycle !== undefined) {
          shaderMaterial.uniforms.dayNightCycle.value = newOptions.dayNightCycle;
        }
      }
    }
  };
};
