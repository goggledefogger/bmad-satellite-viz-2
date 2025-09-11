import React from 'react';
import { Satellite } from './Satellite';

// Mock satellite data for initial setup
const mockSatellites = [
  {
    id: '25544',
    name: 'International Space Station',
    type: 'space-station' as const,
    position: { x: 0, y: 0, z: 0 },
    orbitalElements: {
      semiMajorAxis: 6798.14,
      eccentricity: 0.0001647,
      inclination: 51.6416,
      rightAscensionOfAscendingNode: 0,
      argumentOfPeriapsis: 0,
      meanAnomaly: 0,
      epoch: new Date().toISOString(),
    },
    status: 'active' as const,
    lastUpdated: new Date().toISOString(),
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
