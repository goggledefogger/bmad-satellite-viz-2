/**
 * Satellite Data Service
 * Handles fetching, processing, and caching satellite data from external APIs
 */

import { HttpClient, createHttpClient } from '../../utils/httpClient';
import { RedisClient, getRedisClient } from '../../utils/redisClient';
import { TLEParser } from '../../utils/tleParser';
import { getApiConfig } from '../../config/api';
import { logger } from '../../utils/logger';
import {
  SatelliteData,
  SatelliteType,
  OrbitType,
  SatelliteFilter,
  SatelliteStats,
  TLEData
} from '@shared/types/satellite';
import { ApiError } from '@shared/types/api';

export interface SatelliteServiceConfig {
  cacheEnabled: boolean;
  cacheTTL: number;
  maxRetries: number;
  retryDelay: number;
}

export class SatelliteService {
  private celestrakClient: HttpClient;
  private spaceTrackClient: HttpClient;
  private redisClient: RedisClient;
  private config: SatelliteServiceConfig;

  constructor(config?: Partial<SatelliteServiceConfig>) {
    const apiConfig = getApiConfig();
    
    logger.info('Initializing SatelliteService', {
      celestrakUrl: apiConfig.celestrak.baseUrl,
      spaceTrackUrl: apiConfig.spaceTrack.baseUrl,
      spaceTrackUsername: apiConfig.spaceTrack.username ? 'configured' : 'missing',
      redisUrl: apiConfig.redis.url,
    });
    
    this.celestrakClient = createHttpClient({
      baseURL: apiConfig.celestrak.baseUrl,
      timeout: apiConfig.celestrak.timeout,
      retryAttempts: apiConfig.celestrak.retryAttempts,
      retryDelay: apiConfig.celestrak.retryDelay,
    });

    this.spaceTrackClient = createHttpClient({
      baseURL: apiConfig.spaceTrack.baseUrl,
      timeout: apiConfig.spaceTrack.timeout,
      retryAttempts: apiConfig.spaceTrack.retryAttempts,
      retryDelay: apiConfig.spaceTrack.retryDelay,
      headers: {
        'Authorization': `Basic ${Buffer.from(
          `${apiConfig.spaceTrack.username}:${apiConfig.spaceTrack.password}`
        ).toString('base64')}`,
      },
    });

    this.redisClient = getRedisClient();
    
    this.config = {
      cacheEnabled: true,
      cacheTTL: apiConfig.redis.ttl.satelliteData,
      maxRetries: 3,
      retryDelay: 1000,
      ...config,
    };

    logger.info('SatelliteService initialized', {
      cacheEnabled: this.config.cacheEnabled,
      cacheTTL: this.config.cacheTTL,
    });
  }

  /**
   * Get all active satellites
   */
  async getActiveSatellites(filter?: SatelliteFilter): Promise<SatelliteData[]> {
    const cacheKey = `satellites:active:${JSON.stringify(filter || {})}`;
    
    logger.info('Fetching active satellites', { filter, cacheKey });
    
    if (this.config.cacheEnabled) {
      const cached = await this.getCachedSatellites(cacheKey);
      if (cached) {
        logger.cacheHit(cacheKey, { count: cached.length });
        return cached;
      }
      logger.cacheMiss(cacheKey);
    }

    try {
      logger.info('Attempting to fetch from CelesTrak');
      const satellites = await this.fetchFromCelesTrak();
      
      // Apply filters
      const filteredSatellites = this.applyFilters(satellites, filter);
      
      logger.satelliteData(filteredSatellites.length, 'celestrak', {
        originalCount: satellites.length,
        filteredCount: filteredSatellites.length,
        filter,
      });
      
      // Cache the results
      if (this.config.cacheEnabled) {
        await this.cacheSatellites(cacheKey, filteredSatellites);
      }
      
      return filteredSatellites;
    } catch (error) {
      logger.error('Failed to fetch satellites from CelesTrak', { error: error instanceof Error ? error.message : 'Unknown error' });
      
      // Fallback to Space-Track if available
      try {
        logger.info('Attempting fallback to Space-Track');
        const satellites = await this.fetchFromSpaceTrack();
        const filteredSatellites = this.applyFilters(satellites, filter);
        
        logger.satelliteData(filteredSatellites.length, 'space-track', {
          originalCount: satellites.length,
          filteredCount: filteredSatellites.length,
          filter,
        });
        
        if (this.config.cacheEnabled) {
          await this.cacheSatellites(cacheKey, filteredSatellites);
        }
        
        return filteredSatellites;
      } catch (fallbackError) {
        logger.error('Failed to fetch satellites from Space-Track', { 
          originalError: error instanceof Error ? error.message : 'Unknown error',
          fallbackError: fallbackError instanceof Error ? fallbackError.message : 'Unknown error'
        });
        const apiError = new Error('SATELLITE_FETCH_FAILED: Failed to fetch satellite data from all sources') as any;
        apiError.code = 'SATELLITE_FETCH_FAILED';
        apiError.status = 500;
        apiError.details = { originalError: error, fallbackError };
        throw apiError;
      }
    }
  }

  /**
   * Get satellite by ID
   */
  async getSatelliteById(id: string): Promise<SatelliteData | null> {
    const cacheKey = `satellite:${id}`;

    if (this.config.cacheEnabled) {
      const cached = await this.getCachedSatellite(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const satellites = await this.getActiveSatellites();
    const satellite = satellites.find(s => s.id === id);

    if (satellite && this.config.cacheEnabled) {
      await this.cacheSatellite(cacheKey, satellite);
    }

    return satellite || null;
  }

  /**
   * Get satellite statistics
   */
  async getSatelliteStats(filter?: SatelliteFilter): Promise<SatelliteStats> {
    const satellites = await this.getActiveSatellites(filter);

    const stats: SatelliteStats = {
      total: satellites.length,
      active: satellites.filter(s => s.isActive).length,
      inactive: satellites.filter(s => !s.isActive).length,
      byType: {} as Record<SatelliteType, number>,
      byOrbitType: {} as Record<OrbitType, number>,
      byCountry: {},
      averageAltitude: 0,
      altitudeRange: { min: 0, max: 0 },
    };

    // Calculate type breakdown
    satellites.forEach(satellite => {
      stats.byType[satellite.type] = (stats.byType[satellite.type] || 0) + 1;
      stats.byOrbitType[satellite.orbitType] = (stats.byOrbitType[satellite.orbitType] || 0) + 1;
      stats.byCountry[satellite.metadata.country] = (stats.byCountry[satellite.metadata.country] || 0) + 1;
    });

    // Calculate altitude statistics
    const altitudes = satellites.map(s => this.calculateAltitude(s.orbitalElements.semiMajorAxis));
    if (altitudes.length > 0) {
      stats.averageAltitude = altitudes.reduce((sum, alt) => sum + alt, 0) / altitudes.length;
      stats.altitudeRange.min = Math.min(...altitudes);
      stats.altitudeRange.max = Math.max(...altitudes);
    }

    return stats;
  }

  /**
   * Fetch satellite data from CelesTrak
   */
  private async fetchFromCelesTrak(): Promise<SatelliteData[]> {
    const endpoints = [
      '/active.txt',
      '/stations.txt',
      '/weather.txt',
      '/noaa.txt',
      '/gps-ops.txt',
      '/glo-ops.txt',
      '/galileo.txt',
      '/beidou.txt',
    ];

    const allSatellites: SatelliteData[] = [];

    for (const endpoint of endpoints) {
      try {
        const tleData = await this.celestrakClient.get<string>(endpoint);
        const parsedTLEs = TLEParser.parseCelesTrakTLE(tleData);

        for (const tle of parsedTLEs) {
          const satellite = this.convertTLEToSatellite(tle, endpoint);
          allSatellites.push(satellite);
        }
      } catch (error) {
        console.warn(`Failed to fetch from CelesTrak ${endpoint}:`, error);
      }
    }

    return allSatellites;
  }

  /**
   * Fetch satellite data from Space-Track
   */
  private async fetchFromSpaceTrack(): Promise<SatelliteData[]> {
    const query = {
      class: 'tle_latest',
      format: 'json',
      orderby: 'NORAD_CAT_ID',
    };

    const response = await this.spaceTrackClient.get<any[]>('/api/basicspacedata/query', {
      query,
    });

    const parsedTLEs = TLEParser.parseSpaceTrackTLE(response);
    const satellites: SatelliteData[] = [];

    for (const tle of parsedTLEs) {
      const satellite = this.convertTLEToSatellite(tle, 'space-track');
      satellites.push(satellite);
    }

    return satellites;
  }

  /**
   * Convert TLE to SatelliteData
   */
  private convertTLEToSatellite(tle: any, source: string): SatelliteData {
    const satellite: SatelliteData = {
      id: tle.noradId,
      name: tle.name,
      type: this.classifySatelliteType(tle.name, source),
      position: { x: 0, y: 0, z: 0 }, // Will be calculated separately
      velocity: { x: 0, y: 0, z: 0 }, // Will be calculated separately
      orbitalElements: tle.orbitalElements,
      metadata: {
        noradId: tle.noradId,
        internationalDesignator: tle.metadata.internationalDesignator || '',
        country: 'Unknown',
        operator: 'Unknown',
        mission: 'Unknown',
        ...tle.metadata,
      },
      orbitType: this.classifyOrbitType(tle.orbitalElements),
      isActive: true,
      lastUpdated: new Date().toISOString(),
      dataSource: source === 'space-track' ? 'space-track' : 'celestrak',
    };

    return satellite;
  }

  /**
   * Classify satellite type based on name and source
   */
  private classifySatelliteType(name: string, source: string): SatelliteType {
    const lowerName = name.toLowerCase();

    if (lowerName.includes('iss') || lowerName.includes('station')) {
      return 'space-station';
    }
    if (lowerName.includes('gps') || lowerName.includes('glonass') || lowerName.includes('galileo') || lowerName.includes('beidou')) {
      return 'navigation';
    }
    if (lowerName.includes('weather') || lowerName.includes('meteor') || lowerName.includes('noaa')) {
      return 'weather';
    }
    if (lowerName.includes('military') || lowerName.includes('defense') || lowerName.includes('classified')) {
      return 'military';
    }
    if (lowerName.includes('starlink') || lowerName.includes('oneweb') || lowerName.includes('iridium')) {
      return 'communication';
    }
    if (lowerName.includes('hubble') || lowerName.includes('james webb') || lowerName.includes('telescope')) {
      return 'scientific';
    }

    return 'unknown';
  }

  /**
   * Classify orbit type based on orbital elements
   */
  private classifyOrbitType(orbitalElements: any): OrbitType {
    const altitude = this.calculateAltitude(orbitalElements.semiMajorAxis);
    const inclination = orbitalElements.inclination;

    if (altitude < 2000) {
      return 'low-earth-orbit';
    }
    if (altitude < 35786) {
      return 'medium-earth-orbit';
    }
    if (altitude >= 35786 && altitude < 36000) {
      return 'geostationary';
    }
    if (altitude > 36000) {
      return 'high-earth-orbit';
    }
    if (Math.abs(inclination - 90) < 10) {
      return 'polar';
    }
    if (Math.abs(inclination - 98) < 5) {
      return 'sun-synchronous';
    }

    return 'unknown';
  }

  /**
   * Calculate altitude from semi-major axis
   */
  private calculateAltitude(semiMajorAxis: number): number {
    const earthRadius = 6371; // km
    return semiMajorAxis - earthRadius;
  }

  /**
   * Apply filters to satellite list
   */
  private applyFilters(satellites: SatelliteData[], filter?: SatelliteFilter): SatelliteData[] {
    if (!filter) return satellites;

    return satellites.filter(satellite => {
      if (filter.type && !filter.type.includes(satellite.type)) return false;
      if (filter.orbitType && !filter.orbitType.includes(satellite.orbitType)) return false;
      if (filter.country && !filter.country.includes(satellite.metadata.country)) return false;
      if (filter.operator && !filter.operator.includes(satellite.metadata.operator)) return false;
      if (filter.isActive !== undefined && satellite.isActive !== filter.isActive) return false;

      if (filter.altitudeRange) {
        const altitude = this.calculateAltitude(satellite.orbitalElements.semiMajorAxis);
        if (altitude < filter.altitudeRange.min || altitude > filter.altitudeRange.max) return false;
      }

      if (filter.inclinationRange) {
        const inclination = satellite.orbitalElements.inclination;
        if (inclination < filter.inclinationRange.min || inclination > filter.inclinationRange.max) return false;
      }

      return true;
    });
  }

  /**
   * Cache management methods
   */
  private async getCachedSatellites(key: string): Promise<SatelliteData[] | null> {
    try {
      const cached = await this.redisClient.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Failed to get cached satellites:', error);
      return null;
    }
  }

  private async cacheSatellites(key: string, satellites: SatelliteData[]): Promise<void> {
    try {
      await this.redisClient.set(key, JSON.stringify(satellites), this.config.cacheTTL);
    } catch (error) {
      console.error('Failed to cache satellites:', error);
    }
  }

  private async getCachedSatellite(key: string): Promise<SatelliteData | null> {
    try {
      const cached = await this.redisClient.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Failed to get cached satellite:', error);
      return null;
    }
  }

  private async cacheSatellite(key: string, satellite: SatelliteData): Promise<void> {
    try {
      await this.redisClient.set(key, JSON.stringify(satellite), this.config.cacheTTL);
    } catch (error) {
      console.error('Failed to cache satellite:', error);
    }
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    try {
      const keys = await this.redisClient.keys('satellites:*');
      if (keys.length > 0) {
        await this.redisClient.mDel(keys);
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }
}
