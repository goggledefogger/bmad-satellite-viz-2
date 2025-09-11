import { Request, Response } from 'express';
import type { ApiResponse, SatelliteData } from '@shared/types';

// Mock satellite data for initial setup
const mockSatellites: SatelliteData[] = [
  {
    id: '25544',
    name: 'International Space Station',
    type: 'space-station',
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
    status: 'active',
    lastUpdated: new Date().toISOString(),
  },
];

export const getSatellites = async (req: Request, res: Response): Promise<void> => {
  try {
    const response: ApiResponse<SatelliteData[]> = {
      data: mockSatellites,
      success: true,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      data: null,
      success: false,
      message: 'Failed to fetch satellites',
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
};

export const getSatelliteById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const satellite = mockSatellites.find(s => s.id === id);

    if (!satellite) {
      const response: ApiResponse<null> = {
        data: null,
        success: false,
        message: 'Satellite not found',
        timestamp: new Date().toISOString(),
      };

      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<SatelliteData> = {
      data: satellite,
      success: true,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      data: null,
      success: false,
      message: 'Failed to fetch satellite',
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
};
