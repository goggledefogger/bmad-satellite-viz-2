import { Satellite, OrbitType } from '../../src/types/satellite';

describe('Satellite Types', () => {
  it('should define valid orbit types', () => {
    const orbitTypes: OrbitType[] = [
      'low-earth-orbit',
      'medium-earth-orbit',
      'geostationary-orbit',
      'high-earth-orbit',
      'sun-synchronous-orbit',
      'polar-orbit',
      'molniya-orbit',
      'tundra-orbit'
    ];

    orbitTypes.forEach(type => {
      expect(type).toBeDefined();
    });
  });

  it('should create a valid satellite object', () => {
    const satellite: Satellite = {
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
    };

    expect(satellite.id).toBe('25544');
    expect(satellite.name).toBe('ISS');
    expect(satellite.type).toBe('space-station');
    expect(satellite.orbitType).toBe('low-earth-orbit');
    expect(satellite.isActive).toBe(true);
  });
});
