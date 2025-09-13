/**
 * Test API endpoint for debugging satellite data integration
 */

import { Request, Response } from 'express';
import { SatelliteService } from '../../services/satellite/satelliteService';
import { getApiConfig } from '../../config/api';
import { logger } from '../../utils/logger';

export const testSatelliteAPI = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Test API endpoint called');
    
    // Test configuration
    const config = getApiConfig();
    const configTest = {
      celestrak: {
        baseUrl: config.celestrak.baseUrl,
        timeout: config.celestrak.timeout,
        hasCredentials: false, // CelesTrak doesn't need credentials
      },
      spaceTrack: {
        baseUrl: config.spaceTrack.baseUrl,
        timeout: config.spaceTrack.timeout,
        hasCredentials: !!(config.spaceTrack.username && config.spaceTrack.password),
        username: config.spaceTrack.username ? 'configured' : 'missing',
      },
      redis: {
        url: config.redis.url,
      },
    };

    logger.info('Configuration test', configTest);

    // Test satellite service
    const satelliteService = new SatelliteService({ cacheEnabled: false });
    
    // Try to fetch a small amount of data
    logger.info('Testing CelesTrak API');
    const startTime = Date.now();
    
    try {
      // Test with a simple fetch first
      const testResponse = await fetch(`${config.celestrak.baseUrl}/active.txt`);
      const testData = await testResponse.text();
      
      logger.info('CelesTrak test successful', {
        status: testResponse.status,
        dataLength: testData.length,
        firstLine: testData.split('\n')[0],
      });

      // Try to parse a small sample
      const lines = testData.split('\n').slice(0, 3); // Just first 3 lines (1 satellite)
      const sampleTLE = lines.join('\n');
      
      const response = {
        success: true,
        message: 'Satellite API test successful',
        timestamp: new Date().toISOString(),
        config: configTest,
        testResults: {
          celestrak: {
            status: testResponse.status,
            dataLength: testData.length,
            sampleTLE: sampleTLE,
            responseTime: Date.now() - startTime,
          },
          spaceTrack: {
            hasCredentials: configTest.spaceTrack.hasCredentials,
            note: configTest.spaceTrack.hasCredentials ? 'Credentials configured, ready for testing' : 'No credentials configured',
          },
        },
      };

      res.json(response);
    } catch (error) {
      logger.error('CelesTrak test failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      
      const response = {
        success: false,
        message: 'Satellite API test failed',
        timestamp: new Date().toISOString(),
        config: configTest,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          type: 'celestrak_test_failed',
        },
      };

      res.status(500).json(response);
    }
  } catch (error) {
    logger.error('Test API endpoint error', { error: error instanceof Error ? error.message : 'Unknown error' });
    
    const response = {
      success: false,
      message: 'Test endpoint failed',
      timestamp: new Date().toISOString(),
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: 'test_endpoint_error',
      },
    };

    res.status(500).json(response);
  }
};

export const testSpaceTrack = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Space-Track test endpoint called');
    
    const config = getApiConfig();
    
    if (!config.spaceTrack.username || !config.spaceTrack.password) {
      const response = {
        success: false,
        message: 'Space-Track credentials not configured',
        timestamp: new Date().toISOString(),
        error: {
          message: 'Please set SPACE_TRACK_USERNAME and SPACE_TRACK_PASSWORD environment variables',
          type: 'missing_credentials',
        },
      };
      
      res.status(400).json(response);
      return;
    }

    // Test Space-Track authentication
    const auth = Buffer.from(`${config.spaceTrack.username}:${config.spaceTrack.password}`).toString('base64');
    
    logger.info('Testing Space-Track authentication', {
      username: config.spaceTrack.username,
      hasPassword: !!config.spaceTrack.password,
    });

    const testResponse = await fetch(`${config.spaceTrack.baseUrl}/api/basicspacedata/query/class/tle_latest/limit/1`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    const testData = await testResponse.json();

    logger.info('Space-Track test result', {
      status: testResponse.status,
      dataType: Array.isArray(testData) ? 'array' : typeof testData,
      dataLength: Array.isArray(testData) ? testData.length : 'N/A',
    });

    const response = {
      success: testResponse.ok,
      message: testResponse.ok ? 'Space-Track authentication successful' : 'Space-Track authentication failed',
      timestamp: new Date().toISOString(),
      testResults: {
        status: testResponse.status,
        statusText: testResponse.statusText,
        dataType: Array.isArray(testData) ? 'array' : typeof testData,
        dataLength: Array.isArray(testData) ? testData.length : 'N/A',
        sampleData: Array.isArray(testData) && testData.length > 0 ? testData[0] : testData,
      },
    };

    res.json(response);
  } catch (error) {
    logger.error('Space-Track test failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    
    const response = {
      success: false,
      message: 'Space-Track test failed',
      timestamp: new Date().toISOString(),
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: 'space_track_test_failed',
      },
    };

    res.status(500).json(response);
  }
};


