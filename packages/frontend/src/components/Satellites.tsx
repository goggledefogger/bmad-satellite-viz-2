import React from 'react';
import { Satellite } from './Satellite';
import { SatelliteData } from '@shared/types';

// Mock satellite data for initial setup
const mockSatellites: SatelliteData[] = [
  {
    id: '25544',
    name: 'International Space Station',
    type: 'space-station',
    position: { x: 0, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    orbitalElements: {
      semiMajorAxis: 6798.14,
      eccentricity: 0.0001647,
      inclination: 51.6416,
      rightAscension: 0,
      argumentOfPeriapsis: 0,
      meanAnomaly: 0,
      epoch: new Date().toISOString(),
      meanMotion: 15.5,
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
  },
];

export const Satellites: React.FC = () => {
  return (
    <>
      {mockSatellites.map((satellite) => (
        <Satellite key={satellite.id} satellite={satellite} />
      ))}
    </>
  );
};
