/**
 * Shared package exports
 */

// Types
export * from './types/satellite';
export * from './types/orbit';
export * from './types/api';

// Utils
export * from './utils/constants';

// Re-export commonly used types
export type { 
  Vector3, 
  SatelliteData, 
  SatelliteType, 
  OrbitalElements, 
  OrbitType,
  SatelliteMetadata,
  TLEData,
  SatelliteFilter,
  SatelliteStats
} from './types/satellite';
export type { OrbitalState, OrbitalParameters, KeplerianElements } from './types/orbit';
export type { ApiResponse, PaginatedResponse, ApiError } from './types/api';
