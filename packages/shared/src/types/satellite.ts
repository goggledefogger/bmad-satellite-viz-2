/**
 * Satellite data types and interfaces
 * Based on NORAD TLE data and satellite tracking standards
 */

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Vector2 {
  x: number;
  y: number;
}

export type SatelliteType =
  | 'communication'
  | 'weather'
  | 'military'
  | 'scientific'
  | 'navigation'
  | 'space-station'
  | 'debris'
  | 'unknown';

export type OrbitType =
  | 'low-earth-orbit'
  | 'medium-earth-orbit'
  | 'geostationary'
  | 'high-earth-orbit'
  | 'polar'
  | 'sun-synchronous'
  | 'molniya'
  | 'unknown';

export interface OrbitalElements {
  /** Semi-major axis in kilometers */
  semiMajorAxis: number;
  /** Eccentricity (0-1) */
  eccentricity: number;
  /** Inclination in degrees */
  inclination: number;
  /** Right ascension of ascending node in degrees */
  rightAscension: number;
  /** Argument of periapsis in degrees */
  argumentOfPeriapsis: number;
  /** Mean anomaly in degrees */
  meanAnomaly: number;
  /** Epoch time (ISO timestamp) */
  epoch: string;
  /** Mean motion in revolutions per day */
  meanMotion: number;
  /** Orbital period in minutes */
  period: number;
}

export interface SatelliteMetadata {
  /** NORAD catalog number */
  noradId: string;
  /** International designator */
  internationalDesignator: string;
  /** Launch date */
  launchDate: string;
  /** Country or organization */
  country: string;
  /** Operator */
  operator: string;
  /** Mission description */
  mission: string;
  /** Satellite mass in kg */
  mass?: number;
  /** Satellite dimensions */
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  /** Power source */
  powerSource?: string;
  /** Expected lifetime */
  lifetime?: string;
}

export interface SatelliteData {
  /** Unique identifier */
  id: string;
  /** Satellite name */
  name: string;
  /** Mission type */
  type: SatelliteType;
  /** Current 3D position in ECI coordinates (km) */
  position: Vector3;
  /** Current velocity vector (km/s) */
  velocity: Vector3;
  /** Orbital elements */
  orbitalElements: OrbitalElements;
  /** Additional metadata */
  metadata: SatelliteMetadata;
  /** Orbit type classification */
  orbitType: OrbitType;
  /** Whether satellite is currently active */
  isActive: boolean;
  /** Last updated timestamp */
  lastUpdated: string;
  /** Data source */
  dataSource: 'celestrak' | 'space-track' | 'manual';
}

export interface TLEData {
  /** NORAD catalog number */
  noradId: string;
  /** Satellite name */
  name: string;
  /** First line of TLE */
  line1: string;
  /** Second line of TLE */
  line2: string;
  /** Epoch time */
  epoch: string;
}

export interface SatellitePosition {
  /** Satellite ID */
  satelliteId: string;
  /** Position in ECI coordinates (km) */
  position: Vector3;
  /** Velocity vector (km/s) */
  velocity: Vector3;
  /** Timestamp of position calculation */
  timestamp: string;
  /** Altitude above Earth's surface (km) */
  altitude: number;
  /** Latitude (degrees) */
  latitude: number;
  /** Longitude (degrees) */
  longitude: number;
}

export interface SatelliteFilter {
  /** Filter by satellite type */
  type?: SatelliteType[];
  /** Filter by orbit type */
  orbitType?: OrbitType[];
  /** Filter by country */
  country?: string[];
  /** Filter by operator */
  operator?: string[];
  /** Filter by active status */
  isActive?: boolean;
  /** Filter by altitude range (km) */
  altitudeRange?: {
    min: number;
    max: number;
  };
  /** Filter by inclination range (degrees) */
  inclinationRange?: {
    min: number;
    max: number;
  };
}

export interface SatelliteSearchParams {
  /** Search query */
  query?: string;
  /** Filter criteria */
  filter?: SatelliteFilter;
  /** Pagination */
  pagination?: {
    page: number;
    limit: number;
  };
  /** Sort order */
  sort?: {
    field: 'name' | 'altitude' | 'inclination' | 'launchDate';
    direction: 'asc' | 'desc';
  };
}

export interface SatelliteStats {
  /** Total number of satellites */
  total: number;
  /** Number of active satellites */
  active: number;
  /** Number of inactive satellites */
  inactive: number;
  /** Breakdown by type */
  byType: Record<SatelliteType, number>;
  /** Breakdown by orbit type */
  byOrbitType: Record<OrbitType, number>;
  /** Breakdown by country */
  byCountry: Record<string, number>;
  /** Average altitude */
  averageAltitude: number;
  /** Altitude range */
  altitudeRange: {
    min: number;
    max: number;
  };
}
