/**
 * Satellite data types for the visualization platform
 */

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface OrbitalElements {
  semiMajorAxis: number; // km
  eccentricity: number;
  inclination: number; // degrees
  rightAscensionOfAscendingNode: number; // degrees
  argumentOfPeriapsis: number; // degrees
  meanAnomaly: number; // degrees
  epoch: string; // ISO date string
}

export type SatelliteType =
  | 'communication'
  | 'weather'
  | 'military'
  | 'scientific'
  | 'navigation'
  | 'space-station'
  | 'debris'
  | 'other';

export interface SatelliteData {
  id: string;
  name: string;
  type: SatelliteType;
  position: Vector3;
  velocity?: Vector3;
  orbitalElements: OrbitalElements;
  launchDate?: string;
  operator?: string;
  country?: string;
  mission?: string;
  status: 'active' | 'inactive' | 'decayed';
  lastUpdated: string;
}

export interface SatelliteFilter {
  types?: SatelliteType[];
  countries?: string[];
  operators?: string[];
  status?: ('active' | 'inactive' | 'decayed')[];
  launchDateRange?: {
    start: string;
    end: string;
  };
}

export interface SatelliteSearchResult {
  satellites: SatelliteData[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
