import React, { useState, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

interface PerformanceData {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  drawCalls: number;
  triangles: number;
}

interface PerformanceCollectorProps {
  onPerformanceUpdate: (data: PerformanceData) => void;
}

export const PerformanceCollector: React.FC<PerformanceCollectorProps> = ({ onPerformanceUpdate }) => {
  const { gl } = useThree();
  const [lastTime, setLastTime] = useState(0);
  const [frameCount, setFrameCount] = useState(0);

  useFrame((state, delta) => {
    const currentTime = state.clock.elapsedTime;
    const deltaTime = currentTime - lastTime;

    setFrameCount(prev => prev + 1);

    if (deltaTime >= 1) {
      const fps = Math.round(frameCount / deltaTime);
      const frameTime = delta * 1000;

      // Get WebGL info
      const info = gl.info;

      const performanceData: PerformanceData = {
        fps,
        frameTime: Math.round(frameTime * 100) / 100,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
        drawCalls: info.render.calls,
        triangles: info.render.triangles,
      };

      onPerformanceUpdate(performanceData);

      setFrameCount(0);
      setLastTime(currentTime);
    }
  });

  return null; // This component doesn't render anything
};
