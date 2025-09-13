import { useRef, useState, useCallback, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

export interface EarthPerformanceMetrics {
  /** Current FPS */
  fps: number;
  /** Average frame time in milliseconds */
  frameTime: number;
  /** Memory usage in MB */
  memoryUsage: number;
  /** Number of draw calls */
  drawCalls: number;
  /** Whether performance is smooth (55+ FPS) */
  isSmooth: boolean;
  /** Performance level (low, medium, high) */
  performanceLevel: 'low' | 'medium' | 'high';
  /** Recommended quality settings */
  recommendedQuality: {
    geometryDetail: number;
    textureResolution: number;
    enableShadows: boolean;
    enableParticles: boolean;
  };
}

export interface EarthPerformanceConfig {
  /** Target FPS for smooth performance */
  targetFPS: number;
  /** Performance monitoring interval in milliseconds */
  monitoringInterval: number;
  /** Enable automatic quality adjustment */
  autoAdjustQuality: boolean;
  /** Performance thresholds */
  thresholds: {
    low: number;    // FPS below this is considered low performance
    medium: number; // FPS below this is considered medium performance
  };
}

const DEFAULT_CONFIG: EarthPerformanceConfig = {
  targetFPS: 60,
  monitoringInterval: 1000,
  autoAdjustQuality: true,
  thresholds: {
    low: 30,
    medium: 45
  }
};

/**
 * Custom hook for monitoring Earth rendering performance
 * @param config - Performance monitoring configuration
 * @param earthMeshRef - Reference to the Earth mesh
 * @returns Performance metrics and controls
 */
export function useEarthPerformance(
  config: Partial<EarthPerformanceConfig> = {},
  earthMeshRef: React.RefObject<Mesh>
): {
  metrics: EarthPerformanceMetrics;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  resetMetrics: () => void;
  getPerformanceReport: () => string;
} {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const [metrics, setMetrics] = useState<EarthPerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    memoryUsage: 0,
    drawCalls: 0,
    isSmooth: true,
    performanceLevel: 'high',
    recommendedQuality: {
      geometryDetail: 128,
      textureResolution: 1024,
      enableShadows: true,
      enableParticles: true
    }
  });

  const frameCountRef = useRef(0);
  const lastUpdateRef = useRef(performance.now());
  const frameTimesRef = useRef<number[]>([]);
  const isMonitoringRef = useRef(false);

  // Calculate performance level based on FPS
  const calculatePerformanceLevel = useCallback((fps: number): 'low' | 'medium' | 'high' => {
    if (fps < finalConfig.thresholds.low) return 'low';
    if (fps < finalConfig.thresholds.medium) return 'medium';
    return 'high';
  }, [finalConfig.thresholds]);

  // Calculate recommended quality settings based on performance
  const calculateRecommendedQuality = useCallback((fps: number) => {
    if (fps < finalConfig.thresholds.low) {
      return {
        geometryDetail: 64,
        textureResolution: 512,
        enableShadows: false,
        enableParticles: false
      };
    } else if (fps < finalConfig.thresholds.medium) {
      return {
        geometryDetail: 96,
        textureResolution: 768,
        enableShadows: true,
        enableParticles: false
      };
    } else {
      return {
        geometryDetail: 128,
        textureResolution: 1024,
        enableShadows: true,
        enableParticles: true
      };
    }
  }, [finalConfig.thresholds]);

  // Update performance metrics
  const updateMetrics = useCallback(() => {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastUpdateRef.current;

    if (deltaTime >= finalConfig.monitoringInterval) {
      const fps = Math.round((frameCountRef.current * 1000) / deltaTime);
      const frameTime = deltaTime / frameCountRef.current;

      // Calculate average frame time from recent frames
      const avgFrameTime = frameTimesRef.current.length > 0
        ? frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length
        : frameTime;

      // Get memory usage (if available)
      const memoryUsage = (performance as any).memory
        ? (performance as any).memory.usedJSHeapSize / (1024 * 1024)
        : 0;

      const isSmooth = fps >= 55;
      const performanceLevel = calculatePerformanceLevel(fps);
      const recommendedQuality = calculateRecommendedQuality(fps);

      setMetrics({
        fps,
        frameTime: avgFrameTime,
        memoryUsage,
        drawCalls: 0, // Would need to be tracked by renderer
        isSmooth,
        performanceLevel,
        recommendedQuality
      });

      // Reset counters
      frameCountRef.current = 0;
      lastUpdateRef.current = currentTime;
      frameTimesRef.current = [];
    }
  }, [finalConfig.monitoringInterval, calculatePerformanceLevel, calculateRecommendedQuality]);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    isMonitoringRef.current = true;
    lastUpdateRef.current = performance.now();
    frameCountRef.current = 0;
    frameTimesRef.current = [];
  }, []);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    isMonitoringRef.current = false;
  }, []);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    setMetrics({
      fps: 60,
      frameTime: 16.67,
      memoryUsage: 0,
      drawCalls: 0,
      isSmooth: true,
      performanceLevel: 'high',
      recommendedQuality: {
        geometryDetail: 128,
        textureResolution: 1024,
        enableShadows: true,
        enableParticles: true
      }
    });
    startMonitoring();
  }, [startMonitoring]);

  // Get performance report
  const getPerformanceReport = useCallback(() => {
    const { fps, frameTime, memoryUsage, performanceLevel, isSmooth } = metrics;

    return `
Earth Performance Report:
- FPS: ${fps} (${isSmooth ? 'Smooth' : 'Choppy'})
- Frame Time: ${frameTime.toFixed(2)}ms
- Memory Usage: ${memoryUsage.toFixed(2)}MB
- Performance Level: ${performanceLevel.toUpperCase()}
- Target FPS: ${finalConfig.targetFPS}
- Status: ${fps >= finalConfig.targetFPS ? '✅ Good' : '⚠️ Needs Optimization'}
    `.trim();
  }, [metrics, finalConfig.targetFPS]);

  // Frame update for performance monitoring
  useFrame((state, delta) => {
    if (!isMonitoringRef.current) return;

    frameCountRef.current++;
    frameTimesRef.current.push(delta * 1000); // Convert to milliseconds

    // Keep only recent frame times (last 60 frames)
    if (frameTimesRef.current.length > 60) {
      frameTimesRef.current.shift();
    }

    updateMetrics();
  });

  // Auto-start monitoring
  useEffect(() => {
    startMonitoring();
    return () => stopMonitoring();
  }, [startMonitoring, stopMonitoring]);

  return {
    metrics,
    startMonitoring,
    stopMonitoring,
    resetMetrics,
    getPerformanceReport
  };
}

/**
 * Hook for Earth performance with automatic quality adjustment
 * @param config - Performance monitoring configuration
 * @param earthMeshRef - Reference to the Earth mesh
 * @returns Performance metrics and quality adjustment controls
 */
export function useEarthPerformanceWithAutoAdjust(
  config: Partial<EarthPerformanceConfig> = {},
  earthMeshRef: React.RefObject<Mesh>
): {
  metrics: EarthPerformanceMetrics;
  qualitySettings: EarthPerformanceMetrics['recommendedQuality'];
  applyQualitySettings: (settings: EarthPerformanceMetrics['recommendedQuality']) => void;
  autoAdjustQuality: () => void;
} {
  const { metrics, startMonitoring, stopMonitoring, resetMetrics, getPerformanceReport } =
    useEarthPerformance(config, earthMeshRef);

  const [qualitySettings, setQualitySettings] = useState(metrics.recommendedQuality);

  // Apply quality settings
  const applyQualitySettings = useCallback((settings: EarthPerformanceMetrics['recommendedQuality']) => {
    setQualitySettings(settings);

    // Here you would apply the settings to your Earth component
    // This would typically involve updating props or state in the parent component
    console.log('Applying quality settings:', settings);
  }, []);

  // Auto-adjust quality based on performance
  const autoAdjustQuality = useCallback(() => {
    if (config.autoAdjustQuality !== false) {
      applyQualitySettings(metrics.recommendedQuality);
    }
  }, [config.autoAdjustQuality, metrics.recommendedQuality, applyQualitySettings]);

  // Auto-adjust when performance changes
  useEffect(() => {
    autoAdjustQuality();
  }, [metrics.performanceLevel, autoAdjustQuality]);

  return {
    metrics,
    qualitySettings,
    applyQualitySettings,
    autoAdjustQuality
  };
}
