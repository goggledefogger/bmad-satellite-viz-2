import { SatelliteService } from '../../../src/services/satellite/satelliteService';

// Mock dependencies with proper jest mocks
const mockHttpClient = {
  get: jest.fn(),
};

const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
};

const mockTLEParser = {
  parseTLE: jest.fn(),
  parseCelesTrakTLE: jest.fn(),
  parseSpaceTrackTLE: jest.fn(),
};

jest.mock('../../../src/utils/httpClient', () => ({
  createHttpClient: jest.fn(() => mockHttpClient),
  HttpClient: jest.fn().mockImplementation(() => mockHttpClient),
}));

jest.mock('../../../src/utils/redisClient', () => ({
  createRedisClient: jest.fn(() => mockRedisClient),
  getRedisClient: jest.fn(() => mockRedisClient),
  RedisClient: jest.fn().mockImplementation(() => mockRedisClient),
}));

jest.mock('../../../src/utils/tleParser', () => ({
  // Service uses static methods: TLEParser.parseCelesTrakTLE(...)
  TLEParser: {
    parseTLE: (...args: any[]) => (mockTLEParser.parseTLE as any)(...args),
    parseCelesTrakTLE: (...args: any[]) => (mockTLEParser.parseCelesTrakTLE as any)(...args),
    parseSpaceTrackTLE: (...args: any[]) => (mockTLEParser.parseSpaceTrackTLE as any)(...args),
  },
}));

describe('SatelliteService', () => {
  let satelliteService: SatelliteService;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create new service instance
    satelliteService = new SatelliteService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getActiveSatellites', () => {
    it('should fetch active satellites successfully', async () => {
      const mockTLEData = '1 25544U 98067A   24123.45678901  .00001234  00000-0  12345-4 0  9999\n2 25544  51.6416 123.4567 0001647 123.4567 234.5678 15.49123456789012';

      mockHttpClient.get.mockResolvedValue(mockTLEData);
      mockTLEParser.parseCelesTrakTLE.mockReturnValue([{
        id: '25544',
        name: 'ISS',
        type: 'space-station',
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        orbitalElements: {
          semiMajorAxis: 6798,
          eccentricity: 0.0001647,
          inclination: 51.6416,
          rightAscension: 123.4567,
          argumentOfPeriapsis: 123.4567,
          meanAnomaly: 234.5678,
          epoch: '2024-05-02T10:57:46.000Z',
          meanMotion: 15.49123456789012,
          period: 92.5,
        },
        metadata: {
          noradId: '25544',
          internationalDesignator: '1998-067A',
          launchDate: '1998-11-20',
          country: 'International',
          operator: 'NASA',
          mission: 'International Space Station',
        },
        orbitType: 'low-earth-orbit',
        isActive: true,
        lastUpdated: new Date().toISOString(),
        dataSource: 'celestrak',
      }]);
      mockRedisClient.get.mockResolvedValue(null);
      mockRedisClient.set.mockResolvedValue('OK');

      const result = await satelliteService.getActiveSatellites();

      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0].name).toBe('ISS');
      expect(mockHttpClient.get).toHaveBeenCalledWith('/active.txt');
      expect(mockRedisClient.set).toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('API Error'));
      mockRedisClient.get.mockResolvedValue(null);

      const result = await satelliteService.getActiveSatellites();
      expect(result).toEqual([]);
    });

    it('should return cached data when available', async () => {
      const cachedData = JSON.stringify([{
        id: '25544',
        name: 'ISS',
        type: 'space-station',
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        orbitalElements: {
          semiMajorAxis: 6798,
          eccentricity: 0.0001647,
          inclination: 51.6416,
          rightAscension: 123.4567,
          argumentOfPeriapsis: 123.4567,
          meanAnomaly: 234.5678,
          epoch: '2024-05-02T10:57:46.000Z',
          meanMotion: 15.49123456789012,
          period: 92.5,
        },
        metadata: {
          noradId: '25544',
          internationalDesignator: '1998-067A',
          launchDate: '1998-11-20',
          country: 'International',
          operator: 'NASA',
          mission: 'International Space Station',
        },
        orbitType: 'low-earth-orbit',
        isActive: true,
        lastUpdated: new Date().toISOString(),
        dataSource: 'celestrak',
      }]);

      mockRedisClient.get.mockResolvedValue(cachedData);

      const result = await satelliteService.getActiveSatellites();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('ISS');
      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });
  });

  describe('getSatelliteById', () => {
    it('should fetch satellite by ID successfully', async () => {
      const mockSatellite = {
        id: '25544',
        name: 'ISS',
        type: 'space-station' as const,
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        orbitalElements: {
          semiMajorAxis: 6798,
          eccentricity: 0.0001647,
          inclination: 51.6416,
          rightAscension: 123.4567,
          argumentOfPeriapsis: 123.4567,
          meanAnomaly: 234.5678,
          epoch: '2024-05-02T10:57:46.000Z',
          meanMotion: 15.49123456789012,
          period: 92.5,
        },
        metadata: {
          noradId: '25544',
          internationalDesignator: '1998-067A',
          launchDate: '1998-11-20',
          country: 'International',
          operator: 'NASA',
          mission: 'International Space Station',
        },
        orbitType: 'low-earth-orbit' as const,
        isActive: true,
        lastUpdated: new Date().toISOString(),
        dataSource: 'celestrak' as const,
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(mockSatellite));

      const result = await satelliteService.getSatelliteById('25544');

      expect(result).toEqual(mockSatellite);
      expect(mockRedisClient.get).toHaveBeenCalledWith('satellite:25544');
    });

    it('should return null for non-existent satellite', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await satelliteService.getSatelliteById('99999');

      expect(result).toBeNull();
    });
  });
});
