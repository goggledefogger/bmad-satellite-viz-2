import { Vector3, Color, Texture, CanvasTexture } from 'three';

/**
 * Earth utility functions for 3D visualization
 */

export interface EarthConfig {
  radius: number;
  rotationSpeed: number;
  atmosphereThickness: number;
  textureResolution: number;
  geometryDetail: number;
}

export const DEFAULT_EARTH_CONFIG: EarthConfig = {
  radius: 1.0,
  rotationSpeed: 1.0,
  atmosphereThickness: 0.05,
  textureResolution: 1024,
  geometryDetail: 128
};

/**
 * Calculate Earth's position based on time
 * @param time - Time in seconds since epoch
 * @param radius - Earth's orbital radius (default: 1.0)
 * @returns Earth's 3D position
 */
export function calculateEarthPosition(time: number, radius: number = 1.0): Vector3 {
  // Simple circular orbit calculation
  const angle = (time / 365.25) * Math.PI * 2; // One year cycle
  return new Vector3(
    Math.cos(angle) * radius,
    0,
    Math.sin(angle) * radius
  );
}

/**
 * Calculate atmospheric color based on viewing angle
 * @param viewDirection - Direction from camera to Earth
 * @param sunDirection - Direction of sunlight
 * @returns Atmospheric color
 */
export function calculateAtmosphericColor(
  viewDirection: Vector3,
  sunDirection: Vector3
): Color {
  const dot = Math.max(0, viewDirection.dot(sunDirection));
  const intensity = Math.pow(dot, 0.5);

  // Atmospheric scattering colors
  const baseColor = new Color(0x4A90E2);
  const sunColor = new Color(0xFFE4B5);

  return baseColor.lerp(sunColor, intensity * 0.3);
}

/**
 * Generate procedural Earth texture
 * @param width - Texture width
 * @param height - Texture height
 * @param seed - Random seed for consistent generation
 * @returns Canvas texture
 */
export function generateEarthTexture(
  width: number = 1024,
  height: number = 1024,
  seed: number = 12345
): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Set random seed for consistent generation
  const random = (min: number, max: number) => {
    seed = (seed * 9301 + 49297) % 233280;
    return min + (seed / 233280) * (max - min);
  };

  // Create ocean base
  const oceanGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
  oceanGradient.addColorStop(0, '#1E3A8A');
  oceanGradient.addColorStop(0.3, '#3B82F6');
  oceanGradient.addColorStop(0.7, '#60A5FA');
  oceanGradient.addColorStop(1, '#93C5FD');

  ctx.fillStyle = oceanGradient;
  ctx.fillRect(0, 0, width, height);

  // Add continents
  const continentCount = 8;
  for (let i = 0; i < continentCount; i++) {
    const x = random(0, width);
    const y = random(0, height);
    const size = random(50, 150);

    // Different continent types
    const continentType = Math.floor(random(0, 3));
    let color: string;

    switch (continentType) {
      case 0: // Forest
        color = '#16A34A';
        break;
      case 1: // Desert
        color = '#D97706';
        break;
      case 2: // Tundra
        color = '#6B7280';
        break;
      default:
        color = '#16A34A';
    }

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Add polar ice caps
  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath();
  ctx.arc(width/2, 50, 80, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(width/2, height - 50, 80, 0, Math.PI * 2);
  ctx.fill();

  return new CanvasTexture(canvas);
}

/**
 * Generate normal map for Earth surface
 * @param width - Texture width
 * @param height - Texture height
 * @returns Canvas texture
 */
export function generateEarthNormalMap(
  width: number = 512,
  height: number = 512
): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Create subtle normal map
  const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
  gradient.addColorStop(0, '#8080FF');
  gradient.addColorStop(0.5, '#8080FF');
  gradient.addColorStop(1, '#8080FF');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Add some surface detail
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 30 + 10;

    ctx.fillStyle = `rgb(${128 + Math.random() * 20}, ${128 + Math.random() * 20}, 255)`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  return new CanvasTexture(canvas);
}

/**
 * Calculate optimal LOD level based on camera distance
 * @param cameraPosition - Camera position
 * @param earthPosition - Earth position
 * @param maxDetail - Maximum geometry detail level
 * @returns LOD level (0 = lowest detail, maxDetail = highest detail)
 */
export function calculateEarthLOD(
  cameraPosition: Vector3,
  earthPosition: Vector3,
  maxDetail: number = 128
): number {
  const distance = cameraPosition.distanceTo(earthPosition);

  // LOD thresholds
  if (distance > 10) return 32;      // Very far
  if (distance > 5) return 64;       // Far
  if (distance > 2) return 96;       // Medium
  return maxDetail;                  // Close
}

/**
 * Calculate Earth's rotation angle for given time
 * @param time - Time in seconds
 * @param speedMultiplier - Speed multiplier (1.0 = 24-hour cycle)
 * @returns Rotation angle in radians
 */
export function calculateEarthRotation(
  time: number,
  speedMultiplier: number = 1.0
): number {
  // One full rotation per 24 hours (86400 seconds)
  return (time * speedMultiplier / 86400) * Math.PI * 2;
}

/**
 * Validate Earth configuration
 * @param config - Earth configuration
 * @returns Validation result
 */
export function validateEarthConfig(config: EarthConfig): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (config.radius <= 0) {
    errors.push('Earth radius must be positive');
  }

  if (config.rotationSpeed < 0) {
    errors.push('Rotation speed cannot be negative');
  }

  if (config.atmosphereThickness < 0 || config.atmosphereThickness > 1) {
    errors.push('Atmosphere thickness must be between 0 and 1');
  }

  if (config.textureResolution < 64 || config.textureResolution > 4096) {
    errors.push('Texture resolution must be between 64 and 4096');
  }

  if (config.geometryDetail < 8 || config.geometryDetail > 256) {
    errors.push('Geometry detail must be between 8 and 256');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calculate performance metrics for Earth rendering
 * @param geometryDetail - Geometry detail level
 * @param textureResolution - Texture resolution
 * @returns Performance metrics
 */
export function calculateEarthPerformanceMetrics(
  geometryDetail: number,
  textureResolution: number
): {
  vertexCount: number;
  triangleCount: number;
  textureMemoryMB: number;
  estimatedFPS: number;
} {
  const vertexCount = geometryDetail * geometryDetail * 6; // 6 vertices per quad
  const triangleCount = geometryDetail * geometryDetail * 2; // 2 triangles per quad
  const textureMemoryMB = (textureResolution * textureResolution * 4) / (1024 * 1024); // 4 bytes per pixel (RGBA)

  // Rough FPS estimation based on complexity
  const complexity = (vertexCount / 1000) + (textureMemoryMB / 10);
  const estimatedFPS = Math.max(30, 120 - complexity * 2);

  return {
    vertexCount,
    triangleCount,
    textureMemoryMB,
    estimatedFPS
  };
}
