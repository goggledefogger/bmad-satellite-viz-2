import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Memory management utilities for Three.js
export const useMemoryManagement = () => {
  const { gl, scene } = useThree();
  const disposedObjects = useRef<Set<THREE.Object3D>>(new Set());

  // Dispose of Three.js resources
  const disposeObject = (object: THREE.Object3D) => {
    if (disposedObjects.current.has(object)) {
      return;
    }

    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Dispose geometry
        if (child.geometry) {
          child.geometry.dispose();
        }

        // Dispose material
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => disposeMaterial(material));
          } else {
            disposeMaterial(child.material);
          }
        }
      }
    });

    disposedObjects.current.add(object);
  };

  // Dispose material resources
  const disposeMaterial = (material: THREE.Material) => {
    if ('map' in material && material.map) (material.map as THREE.Texture).dispose();
    if ('normalMap' in material && material.normalMap) (material.normalMap as THREE.Texture).dispose();
    if ('bumpMap' in material && material.bumpMap) (material.bumpMap as THREE.Texture).dispose();
    if ('specularMap' in material && material.specularMap) (material.specularMap as THREE.Texture).dispose();
    if ('envMap' in material && material.envMap) (material.envMap as THREE.Texture).dispose();

    // Dispose textures in material
    Object.values(material).forEach((value) => {
      if (value && typeof value === 'object' && 'dispose' in value) {
        (value as any).dispose();
      }
    });

    material.dispose();
  };

  // Cleanup function
  const cleanup = () => {
    // Clear disposed objects tracking
    disposedObjects.current.clear();

    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
  };

  // Monitor memory usage
  const getMemoryInfo = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }
    return null;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  return {
    disposeObject,
    disposeMaterial,
    cleanup,
    getMemoryInfo,
  };
};
