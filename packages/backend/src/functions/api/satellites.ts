import { Request, Response } from 'express';
import type { ApiResponse, SatelliteData, SatelliteFilter, SatelliteStats } from '@shared/types';
import { SatelliteService } from '../../services/satellite/satelliteService';

// Initialize satellite service
const satelliteService = new SatelliteService();

export const getSatellites = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filter, page, limit } = req.query;

    // Parse filter if provided
    const filterObj = filter ? JSON.parse(filter as string) as SatelliteFilter : undefined;

    // Get satellites from service
    const satellites = await satelliteService.getActiveSatellites(filterObj);

    // Apply pagination if requested
    if (page && limit) {
      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 10;
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;

      const paginatedSatellites = satellites.slice(startIndex, endIndex);

      const response = {
        data: paginatedSatellites,
        success: true,
        timestamp: new Date().toISOString(),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: satellites.length,
          totalPages: Math.ceil(satellites.length / limitNum),
          hasNext: pageNum < Math.ceil(satellites.length / limitNum),
          hasPrevious: pageNum > 1,
        },
      };

      res.json(response);
      return;
    }

    const response: ApiResponse<SatelliteData[]> = {
      data: satellites,
      success: true,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error('Failed to fetch satellites:', error);

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
    const satellite = await satelliteService.getSatelliteById(id);

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
    console.error('Failed to fetch satellite:', error);

    const response: ApiResponse<null> = {
      data: null,
      success: false,
      message: 'Failed to fetch satellite',
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
};

export const getSatelliteStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filter } = req.query;

    // Parse filter if provided
    const filterObj = filter ? JSON.parse(filter as string) as SatelliteFilter : undefined;

    const stats = await satelliteService.getSatelliteStats(filterObj);

    const response: ApiResponse<SatelliteStats> = {
      data: stats,
      success: true,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error('Failed to fetch satellite stats:', error);

    const response: ApiResponse<null> = {
      data: null,
      success: false,
      message: 'Failed to fetch satellite statistics',
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
};
