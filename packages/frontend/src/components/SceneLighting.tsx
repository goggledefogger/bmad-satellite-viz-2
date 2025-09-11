import React from 'react';

export const SceneLighting: React.FC = () => {
  return (
    <>
      {/* Ambient light for overall scene illumination */}
      <ambientLight intensity={0.3} color="#4A90E2" />

      {/* Main directional light (sun) */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.2}
        color="#FFE4B5"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Secondary directional light for fill */}
      <directionalLight
        position={[-5, -5, -2]}
        intensity={0.4}
        color="#87CEEB"
      />

      {/* Point light for atmospheric effect */}
      <pointLight
        position={[0, 0, 0]}
        intensity={0.5}
        color="#4A90E2"
        distance={20}
        decay={2}
      />

      {/* Hemisphere light for sky/ground lighting */}
      <hemisphereLight
        args={["#4A90E2", "#2D3748", 0.6]}
      />
    </>
  );
};
