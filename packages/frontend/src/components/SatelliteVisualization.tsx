import React, { Suspense, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stats } from '@react-three/drei';
import { Earth } from './Earth';
import { Atmosphere } from './Atmosphere';
import { EarthControls } from './EarthControls';
import { Satellites } from './Satellites';
import { SceneLighting } from './SceneLighting';
import { PerformanceMonitor } from './PerformanceMonitor';
import { PerformanceCollector } from './PerformanceCollector';
import { WebGLFallback } from './WebGLFallback';
import { CameraControls } from './CameraControls';
import { useEarthPerformance } from '../hooks/useEarthPerformance';

interface PerformanceData {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  drawCalls: number;
  triangles: number;
}

export const SatelliteVisualization: React.FC = () => {
  const earthRef = useRef(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
    drawCalls: 0,
    triangles: 0,
  });

  // Earth-specific state
  const [earthConfig, setEarthConfig] = useState({
    enableRotation: true,
    rotationSpeed: 1.0,
    enableAtmosphere: true,
    scale: 1.0
  });

  // Performance monitoring for Earth
  const { metrics: earthPerformance } = useEarthPerformance({}, earthRef);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{
          position: [0, 0, 5],
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true
        }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        className="w-full h-full"
        onCreated={({ gl }) => {
          gl.setClearColor('#0B0E14', 1);
        }}
      >
        <Suspense fallback={null}>
          <SceneLighting />
          <Earth
            ref={earthRef}
            enableRotation={earthConfig.enableRotation}
            rotationSpeed={earthConfig.rotationSpeed}
            enableAtmosphere={earthConfig.enableAtmosphere}
            scale={earthConfig.scale}
          />
          <Atmosphere
            enableGlow={earthConfig.enableAtmosphere}
            enableParticles={earthConfig.enableAtmosphere}
            intensity={0.3}
            earthRadius={earthConfig.scale}
          />
          <Satellites />
          <CameraControls />
          <PerformanceCollector onPerformanceUpdate={setPerformanceData} />
          {process.env.NODE_ENV === 'development' && <Stats />}
        </Suspense>
      </Canvas>

      {/* Performance Monitor */}
      <PerformanceMonitor performanceData={performanceData} />

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <h1 className="text-xl font-bold text-white mb-2">
            Satellite Visualization Platform
          </h1>
          <p className="text-gray-300 text-sm mb-3">
            Explore satellites in real-time 3D visualization
          </p>
          <div className="text-xs text-gray-400 space-y-1">
            <div>Press <kbd className="bg-gray-700 px-1 rounded">R</kbd> to reset camera</div>
            <div>Press <kbd className="bg-gray-700 px-1 rounded">F</kbd> to focus on Earth</div>
            <div>Press <kbd className="bg-gray-700 px-1 rounded">P</kbd> to toggle performance</div>
            <div>Press <kbd className="bg-gray-700 px-1 rounded">H</kbd> for help</div>
          </div>
        </div>
      </div>

      {/* Earth Controls */}
      <EarthControls
        onRotationToggle={(enabled) => setEarthConfig(prev => ({ ...prev, enableRotation: enabled }))}
        onRotationSpeedChange={(speed) => setEarthConfig(prev => ({ ...prev, rotationSpeed: speed }))}
        onAtmosphereToggle={(enabled) => setEarthConfig(prev => ({ ...prev, enableAtmosphere: enabled }))}
        onScaleChange={(scale) => setEarthConfig(prev => ({ ...prev, scale }))}
        initialRotationEnabled={earthConfig.enableRotation}
        initialRotationSpeed={earthConfig.rotationSpeed}
        initialAtmosphereEnabled={earthConfig.enableAtmosphere}
        initialScale={earthConfig.scale}
      />

      {/* WebGL Fallback */}
      <WebGLFallback />
    </div>
  );
};
