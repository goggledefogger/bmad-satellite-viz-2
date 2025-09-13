/**
 * Application constants
 */

export const API_ENDPOINTS = {
  SATELLITES: '/api/satellites',
  SATELLITE_DETAILS: '/api/satellites/:id',
  SATELLITES_STATS: '/api/satellites/stats',
} as const;

export const SATELLITE_TYPES = {
  COMMUNICATION: 'communication',
  WEATHER: 'weather',
  MILITARY: 'military',
  SCIENTIFIC: 'scientific',
  NAVIGATION: 'navigation',
  SPACE_STATION: 'space-station',
  DEBRIS: 'debris',
  UNKNOWN: 'unknown',
} as const;

export const PERFORMANCE_TARGETS = {
  TARGET_FPS: 60,
  MIN_FPS: 30,
  MAX_LOAD_TIME: 3000, // 3 seconds
  MAX_MEMORY_USAGE: 100 * 1024 * 1024, // 100MB
} as const;

export const EARTH_CONSTANTS = {
  RADIUS: 6371, // km
  MASS: 5.972e24, // kg
  STANDARD_GRAVITATIONAL_PARAMETER: 3.986004418e14, // m³/s²
} as const;

export const ORBITAL_CONSTANTS = {
  EARTH_RADIUS: 6371, // km
  GEOSTATIONARY_ALTITUDE: 35786, // km
  LOW_EARTH_ORBIT_MAX: 2000, // km
  MEDIUM_EARTH_ORBIT_MIN: 2000, // km
  MEDIUM_EARTH_ORBIT_MAX: 35786, // km
} as const;
