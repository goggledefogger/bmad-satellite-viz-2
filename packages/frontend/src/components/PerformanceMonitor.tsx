import React, { useState, useEffect } from 'react';

interface PerformanceData {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  drawCalls: number;
  triangles: number;
}

interface PerformanceMonitorProps {
  performanceData: PerformanceData;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ performanceData }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'p' || event.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!isVisible || process.env.NODE_ENV === 'production') {
    return null;
  }

  const formatMemory = (bytes: number): string => {
    if (bytes === 0) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getFPSColor = (fps: number): string => {
    if (fps >= 55) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 border border-gray-700 text-xs font-mono">
        <div className="text-gray-400 mb-2">Performance Monitor (Press P to toggle)</div>

        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-300">FPS:</span>
            <span className={getFPSColor(performanceData.fps)}>
              {performanceData.fps}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-300">Frame Time:</span>
            <span className="text-blue-400">
              {performanceData.frameTime}ms
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-300">Memory:</span>
            <span className="text-purple-400">
              {formatMemory(performanceData.memoryUsage)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-300">Draw Calls:</span>
            <span className="text-orange-400">
              {performanceData.drawCalls}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-300">Triangles:</span>
            <span className="text-cyan-400">
              {performanceData.triangles.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
