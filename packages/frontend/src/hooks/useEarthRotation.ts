import React, { useRef, useCallback, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

export interface EarthRotationConfig {
  /** Enable/disable rotation */
  enabled: boolean;
  /** Rotation speed multiplier (1.0 = 24-hour day cycle) */
  speed: number;
  /** Rotation axis (default: Y axis) */
  axis: 'x' | 'y' | 'z';
  /** Direction of rotation (1 = clockwise, -1 = counterclockwise) */
  direction: number;
}

export interface EarthRotationState {
  /** Current rotation angle in radians */
  angle: number;
  /** Current rotation speed */
  currentSpeed: number;
  /** Whether rotation is currently active */
  isRotating: boolean;
  /** Time elapsed since rotation started */
  elapsedTime: number;
}

export interface EarthRotationControls {
  /** Start rotation */
  start: () => void;
  /** Stop rotation */
  stop: () => void;
  /** Toggle rotation */
  toggle: () => void;
  /** Set rotation speed */
  setSpeed: (speed: number) => void;
  /** Reset rotation to initial state */
  reset: () => void;
  /** Get current rotation state */
  getState: () => EarthRotationState;
}

const DEFAULT_CONFIG: EarthRotationConfig = {
  enabled: true,
  speed: 1.0,
  axis: 'y',
  direction: 1
};

/**
 * Custom hook for managing Earth rotation animation
 * @param config - Rotation configuration
 * @param meshRef - Reference to the Earth mesh
 * @returns Rotation controls and state
 */
export function useEarthRotation(
  config: Partial<EarthRotationConfig> = {},
  meshRef: React.RefObject<Mesh>
): EarthRotationControls {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const [state, setState] = useState<EarthRotationState>({
    angle: 0,
    currentSpeed: finalConfig.speed,
    isRotating: finalConfig.enabled,
    elapsedTime: 0
  });

  const startTimeRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);

  // Update rotation state
  const updateState = useCallback((newState: Partial<EarthRotationState>) => {
    setState(prev => ({ ...prev, ...newState }));
  }, []);

  // Start rotation
  const start = useCallback(() => {
    startTimeRef.current = performance.now();
    lastFrameTimeRef.current = performance.now();
    updateState({ isRotating: true });
  }, [updateState]);

  // Stop rotation
  const stop = useCallback(() => {
    updateState({ isRotating: false });
  }, [updateState]);

  // Toggle rotation
  const toggle = useCallback(() => {
    if (state.isRotating) {
      stop();
    } else {
      start();
    }
  }, [state.isRotating, start, stop]);

  // Set rotation speed
  const setSpeed = useCallback((speed: number) => {
    updateState({ currentSpeed: speed });
  }, [updateState]);

  // Reset rotation
  const reset = useCallback(() => {
    if (meshRef.current) {
      meshRef.current.rotation[finalConfig.axis] = 0;
    }
    startTimeRef.current = performance.now();
    lastFrameTimeRef.current = performance.now();
    updateState({
      angle: 0,
      elapsedTime: 0,
      isRotating: finalConfig.enabled
    });
  }, [meshRef, finalConfig.axis, finalConfig.enabled, updateState]);

  // Get current state
  const getState = useCallback(() => state, [state]);

  // Animation frame update
  useFrame((_, delta) => {
    if (!meshRef.current || !state.isRotating) return;

    const currentTime = performance.now();

    if (startTimeRef.current === 0) {
      startTimeRef.current = currentTime;
      lastFrameTimeRef.current = currentTime;
    }

    const elapsedTime = (currentTime - startTimeRef.current) / 1000; // Convert to seconds
    const deltaTime = (currentTime - lastFrameTimeRef.current) / 1000;

    lastFrameTimeRef.current = currentTime;

    // Calculate rotation angle based on 24-hour day cycle
    const rotationSpeed = state.currentSpeed * finalConfig.direction;
    const angleIncrement = (deltaTime * rotationSpeed / 86400) * Math.PI * 2; // 86400 seconds in a day

    const newAngle = state.angle + angleIncrement;

    // Apply rotation to mesh
    meshRef.current.rotation[finalConfig.axis] = newAngle;

    // Update state
    updateState({
      angle: newAngle,
      elapsedTime
    });
  });

  return {
    start,
    stop,
    toggle,
    setSpeed,
    reset,
    getState
  };
}

/**
 * Hook for Earth rotation with automatic start/stop based on visibility
 * @param config - Rotation configuration
 * @param meshRef - Reference to the Earth mesh
 * @param autoStart - Whether to start rotation automatically
 * @returns Rotation controls and state
 */
export function useEarthRotationWithVisibility(
  config: Partial<EarthRotationConfig> = {},
  meshRef: React.RefObject<Mesh>,
  autoStart: boolean = true
): EarthRotationControls {
  const controls = useEarthRotation(config, meshRef);

  // Auto-start rotation if enabled
  React.useEffect(() => {
    if (autoStart && config.enabled !== false) {
      controls.start();
    }
  }, [autoStart, config.enabled, controls]);

  return controls;
}

/**
 * Hook for Earth rotation with performance monitoring
 * @param config - Rotation configuration
 * @param meshRef - Reference to the Earth mesh
 * @returns Rotation controls, state, and performance metrics
 */
export function useEarthRotationWithPerformance(
  config: Partial<EarthRotationConfig> = {},
  meshRef: React.RefObject<Mesh>
): EarthRotationControls & {
  performance: {
    fps: number;
    frameTime: number;
    isSmooth: boolean;
  };
} {
  const controls = useEarthRotation(config, meshRef);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: 60,
    frameTime: 16.67,
    isSmooth: true
  });

  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(performance.now());

  useFrame(() => {
    frameCountRef.current++;
    const currentTime = performance.now();

    // Update FPS every second
    if (currentTime - lastFpsUpdateRef.current >= 1000) {
      const fps = frameCountRef.current;
      const frameTime = 1000 / fps;
      const isSmooth = fps >= 55; // Consider smooth if 55+ FPS

      setPerformanceMetrics({ fps, frameTime, isSmooth });

      frameCountRef.current = 0;
      lastFpsUpdateRef.current = currentTime;
    }
  });

  return {
    ...controls,
    performance: performanceMetrics
  };
}
