/**
 * API configuration for external satellite data sources
 */

export interface ApiConfig {
  celestrak: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
  spaceTrack: {
    baseUrl: string;
    username: string;
    password: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
    rateLimit: {
      requestsPerHour: number;
      requestsPerMinute: number;
    };
  };
  redis: {
    url: string;
    ttl: {
      satelliteData: number;
      positions: number;
      metadata: number;
    };
  };
}

export const getApiConfig = (): ApiConfig => {
  return {
    celestrak: {
      baseUrl: process.env.CELESTRAK_API_URL || 'https://celestrak.com/NORAD/elements',
      timeout: parseInt(process.env.CELESTRAK_TIMEOUT || '10000'),
      retryAttempts: parseInt(process.env.CELESTRAK_RETRY_ATTEMPTS || '3'),
      retryDelay: parseInt(process.env.CELESTRAK_RETRY_DELAY || '1000'),
    },
    spaceTrack: {
      baseUrl: process.env.SPACE_TRACK_API_URL || 'https://www.space-track.org',
      username: process.env.SPACE_TRACK_USERNAME || '',
      password: process.env.SPACE_TRACK_PASSWORD || '',
      timeout: parseInt(process.env.SPACE_TRACK_TIMEOUT || '15000'),
      retryAttempts: parseInt(process.env.SPACE_TRACK_RETRY_ATTEMPTS || '3'),
      retryDelay: parseInt(process.env.SPACE_TRACK_RETRY_DELAY || '2000'),
      rateLimit: {
        requestsPerHour: parseInt(process.env.SPACE_TRACK_RATE_LIMIT_HOUR || '1000'),
        requestsPerMinute: parseInt(process.env.SPACE_TRACK_RATE_LIMIT_MINUTE || '20'),
      },
    },
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      ttl: {
        satelliteData: parseInt(process.env.REDIS_TTL_SATELLITE_DATA || '300'), // 5 minutes
        positions: parseInt(process.env.REDIS_TTL_POSITIONS || '60'), // 1 minute
        metadata: parseInt(process.env.REDIS_TTL_METADATA || '3600'), // 1 hour
      },
    },
  };
};

export const validateApiConfig = (config: ApiConfig): void => {
  if (!config.spaceTrack.username || !config.spaceTrack.password) {
    throw new Error('Space-Track API credentials are required');
  }

  if (!config.celestrak.baseUrl) {
    throw new Error('CelesTrak API URL is required');
  }

  if (!config.spaceTrack.baseUrl) {
    throw new Error('Space-Track API URL is required');
  }
};

