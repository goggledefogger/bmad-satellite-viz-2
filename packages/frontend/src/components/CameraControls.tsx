import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

interface CameraControlsProps {
  onCameraReset?: () => void;
}

export const CameraControls: React.FC<CameraControlsProps> = ({ onCameraReset }) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  const resetCamera = () => {
    if (controlsRef.current) {
      // Reset camera position
      camera.position.set(0, 0, 5);
      camera.lookAt(0, 0, 0);

      // Reset controls
      controlsRef.current.reset();

      // Call callback if provided
      onCameraReset?.();
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'r':
          resetCamera();
          break;
        case 'f':
          // Focus on Earth
          if (controlsRef.current) {
            controlsRef.current.target.set(0, 0, 0);
            controlsRef.current.update();
          }
          break;
        case 'h':
          // Show help
          console.log('Camera Controls:');
          console.log('R - Reset camera');
          console.log('F - Focus on Earth');
          console.log('Mouse - Orbit around');
          console.log('Scroll - Zoom in/out');
          console.log('Right-click + drag - Pan');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={2}
      maxDistance={15}
      maxPolarAngle={Math.PI}
      minPolarAngle={0}
      enableDamping={true}
      dampingFactor={0.05}
      screenSpacePanning={false}
      mouseButtons={{
        LEFT: 0, // Rotate
        MIDDLE: 1, // Zoom
        RIGHT: 2, // Pan
      }}
      touches={{
        ONE: 0, // Rotate
        TWO: 2, // Zoom and pan
      }}
    />
  );
};
