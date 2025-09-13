/**
 * API response types and interfaces
 * Standardized API response formats for the satellite visualization platform
 */

import { SatelliteData, SatelliteStats, SatelliteSearchParams } from './satellite';
import { OrbitalState, OrbitalPrediction } from './orbit';

export interface ApiResponse<T> {
  /** Response data */
  data: T;
  /** Success status */
  success: boolean;
  /** Optional message */
  message?: string;
  /** Response timestamp */
  timestamp: string;
  /** Request ID for tracking */
  requestId?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  /** Pagination information */
  pagination: {
    /** Current page number */
    page: number;
    /** Items per page */
    limit: number;
    /** Total number of items */
    total: number;
    /** Total number of pages */
    totalPages: number;
    /** Whether there are more pages */
    hasNext: boolean;
    /** Whether there are previous pages */
    hasPrevious: boolean;
  };
}

export interface ApiError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** HTTP status code */
  status: number;
  /** Additional error details */
  details?: Record<string, unknown>;
  /** Request ID for tracking */
  requestId?: string;
  /** Timestamp of error */
  timestamp: string;
}

export interface ApiRequest {
  /** Request ID */
  requestId: string;
  /** Request method */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  /** Request URL */
  url: string;
  /** Request headers */
  headers: Record<string, string>;
  /** Request body */
  body?: unknown;
  /** Request timestamp */
  timestamp: string;
  /** User agent */
  userAgent?: string;
  /** Client IP */
  clientIp?: string;
}

export interface ApiMetrics {
  /** Request duration in milliseconds */
  duration: number;
  /** Response size in bytes */
  responseSize: number;
  /** Cache hit status */
  cacheHit: boolean;
  /** Database query count */
  dbQueries: number;
  /** External API calls */
  externalApiCalls: number;
  /** Memory usage in MB */
  memoryUsage: number;
}

export interface HealthCheckResponse {
  /** Service status */
  status: 'healthy' | 'degraded' | 'unhealthy';
  /** Service name */
  service: string;
  /** Version */
  version: string;
  /** Uptime in seconds */
  uptime: number;
  /** Dependencies status */
  dependencies: {
    database: 'healthy' | 'degraded' | 'unhealthy';
    redis: 'healthy' | 'degraded' | 'unhealthy';
    externalApis: 'healthy' | 'degraded' | 'unhealthy';
  };
  /** Performance metrics */
  metrics: {
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  /** Timestamp */
  timestamp: string;
}

// Satellite-specific API types
export interface GetSatellitesRequest {
  /** Search parameters */
  search?: SatelliteSearchParams;
  /** Include inactive satellites */
  includeInactive?: boolean;
  /** Data source filter */
  dataSource?: ('celestrak' | 'space-track' | 'manual')[];
  /** Last updated since */
  updatedSince?: string;
}

export interface GetSatellitesResponse extends PaginatedResponse<SatelliteData> {
  /** Satellite statistics */
  stats: SatelliteStats;
  /** Data freshness */
  dataFreshness: {
    lastUpdated: string;
    nextUpdate: string;
    source: string;
  };
}

export interface GetSatelliteRequest {
  /** Satellite ID */
  id: string;
  /** Include orbital predictions */
  includePredictions?: boolean;
  /** Prediction time range in hours */
  predictionHours?: number;
}

export interface GetSatelliteResponse extends ApiResponse<SatelliteData> {
  /** Orbital predictions */
  predictions?: OrbitalPrediction[];
  /** Ground track */
  groundTrack?: Array<{
    latitude: number;
    longitude: number;
    timestamp: string;
  }>;
}

export interface UpdateSatelliteRequest {
  /** Satellite ID */
  id: string;
  /** Updated satellite data */
  data: Partial<SatelliteData>;
}

export interface UpdateSatelliteResponse extends ApiResponse<SatelliteData> {
  /** Update timestamp */
  updatedAt: string;
  /** Update source */
  source: string;
}

export interface GetSatellitePositionsRequest {
  /** Satellite IDs */
  satelliteIds: string[];
  /** Time for position calculation */
  time?: string;
  /** Include velocity */
  includeVelocity?: boolean;
}

export interface GetSatellitePositionsResponse extends ApiResponse<OrbitalState[]> {
  /** Calculation method */
  method: string;
  /** Calculation accuracy */
  accuracy: number;
  /** Calculation time */
  calculationTime: number;
}

export interface GetSatelliteStatsRequest {
  /** Filter criteria */
  filter?: {
    type?: string[];
    country?: string[];
    isActive?: boolean;
  };
  /** Time range */
  timeRange?: {
    start: string;
    end: string;
  };
}

export interface GetSatelliteStatsResponse extends ApiResponse<SatelliteStats> {
  /** Time range of statistics */
  timeRange: {
    start: string;
    end: string;
  };
  /** Data source */
  dataSource: string;
}

// WebSocket message types
export interface WebSocketMessage<T = unknown> {
  /** Message type */
  type: string;
  /** Message data */
  data: T;
  /** Message timestamp */
  timestamp: string;
  /** Message ID */
  id: string;
}

export interface SatelliteUpdateMessage {
  /** Message type */
  type: 'satellite_update';
  /** Updated satellite data */
  data: SatelliteData;
  /** Update type */
  updateType: 'position' | 'metadata' | 'status';
  /** Update timestamp */
  timestamp: string;
}

export interface SatelliteBulkUpdateMessage {
  /** Message type */
  type: 'satellite_bulk_update';
  /** Updated satellites */
  data: SatelliteData[];
  /** Update type */
  updateType: 'positions' | 'metadata' | 'status';
  /** Update timestamp */
  timestamp: string;
}

export interface ErrorMessage {
  /** Message type */
  type: 'error';
  /** Error details */
  data: ApiError;
  /** Error timestamp */
  timestamp: string;
}

export interface HeartbeatMessage {
  /** Message type */
  type: 'heartbeat';
  /** Server timestamp */
  data: {
    timestamp: string;
    serverTime: string;
  };
}

// Cache-related types
export interface CacheInfo {
  /** Cache key */
  key: string;
  /** Cache hit status */
  hit: boolean;
  /** Cache TTL in seconds */
  ttl: number;
  /** Cache size in bytes */
  size: number;
  /** Cache timestamp */
  timestamp: string;
}

export interface CacheStats {
  /** Total cache hits */
  hits: number;
  /** Total cache misses */
  misses: number;
  /** Hit rate percentage */
  hitRate: number;
  /** Cache size in bytes */
  size: number;
  /** Number of keys */
  keyCount: number;
  /** Memory usage in MB */
  memoryUsage: number;
}