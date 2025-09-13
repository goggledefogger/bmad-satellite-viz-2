import { useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';

interface PerformanceStats {
  fps: number;
  frameTime: number;
  averageFps: number;
  minFps: number;
  maxFps: number;
  frameCount: number;
}

interface PerformanceMonitorOptions {
  /** Target FPS for performance monitoring */
  targetFps?: number;
  /** Number of frames to average for FPS calculation */
  averageFrames?: number;
  /** Callback when performance drops below target */
  onPerformanceDrop?: (stats: PerformanceStats) => void;
  /** Callback when performance recovers */
  onPerformanceRecover?: (stats: PerformanceStats) => void;
  /** Enable performance monitoring */
  enabled?: boolean;
}

export const usePerformanceMonitor = (options: PerformanceMonitorOptions = {}) => {
  const {
    targetFps = 60,
    averageFrames = 60,
    onPerformanceDrop,
    onPerformanceRecover,
    enabled = true
  } = options;

  const statsRef = useRef<PerformanceStats>({
    fps: 60,
    frameTime: 16.67,
    averageFps: 60,
    minFps: 60,
    maxFps: 60,
    frameCount: 0
  });

  const frameTimesRef = useRef<number[]>([]);
  const lastTimeRef = useRef<number>(0);
  const isLowPerformanceRef = useRef<boolean>(false);

  const updateStats = useCallback((deltaTime: number) => {
    if (!enabled) return;

    const currentTime = performance.now();
    const frameTime = deltaTime * 1000; // Convert to milliseconds
    const fps = 1000 / frameTime;

    // Update frame times array for averaging
    frameTimesRef.current.push(frameTime);
    if (frameTimesRef.current.length > averageFrames) {
      frameTimesRef.current.shift();
    }

    // Calculate average FPS
    const averageFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
    const averageFps = 1000 / averageFrameTime;

    // Update min/max FPS
    const minFps = Math.min(statsRef.current.minFps, fps);
    const maxFps = Math.max(statsRef.current.maxFps, fps);

    // Update stats
    statsRef.current = {
      fps,
      frameTime,
      averageFps,
      minFps,
      maxFps,
      frameCount: statsRef.current.frameCount + 1
    };

    // Check for performance issues
    const isLowPerformance = averageFps < targetFps * 0.9; // 10% tolerance

    if (isLowPerformance && !isLowPerformanceRef.current) {
      isLowPerformanceRef.current = true;
      onPerformanceDrop?.(statsRef.current);
    } else if (!isLowPerformance && isLowPerformanceRef.current) {
      isLowPerformanceRef.current = false;
      onPerformanceRecover?.(statsRef.current);
    }

    lastTimeRef.current = currentTime;
  }, [enabled, targetFps, averageFrames, onPerformanceDrop, onPerformanceRecover]);

  // Monitor performance every frame
  useFrame((state, delta) => {
    updateStats(delta);
  });

  const getStats = useCallback(() => statsRef.current, []);
  const resetStats = useCallback(() => {
    statsRef.current = {
      fps: 60,
      frameTime: 16.67,
      averageFps: 60,
      minFps: 60,
      maxFps: 60,
      frameCount: 0
    };
    frameTimesRef.current = [];
    isLowPerformanceRef.current = false;
  }, []);

  return {
    stats: statsRef.current,
    getStats,
    resetStats,
    isLowPerformance: isLowPerformanceRef.current
  };
};

