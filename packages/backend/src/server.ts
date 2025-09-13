/**
 * Express server for testing satellite data API
 */

import express from 'express';
import cors from 'cors';
import { getSatellites, getSatelliteById, getSatelliteStats } from './functions/api/satellites';
import { testSatelliteAPI, testSpaceTrack } from './functions/api/test';
import { logger } from './utils/logger';

const app: express.Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });
  next();
});

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'satellite-api',
    version: '1.0.0',
  });
});

// Test endpoints
app.get('/api/test', testSatelliteAPI);
app.get('/api/test/space-track', testSpaceTrack);

// Satellite API endpoints
app.get('/api/satellites', getSatellites);
app.get('/api/satellites/:id', getSatelliteById);
app.get('/api/satellites/stats', getSatelliteStats);

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    timestamp: new Date().toISOString(),
  });
});

// Process management to prevent duplicate services
const server = app.listen(PORT, () => {
  logger.info('Satellite API server started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
    pid: process.pid,
  });

  console.log(`🚀 Satellite API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`🛰️  Satellites API: http://localhost:${PORT}/api/satellites`);
  console.log(`🔧 Process ID: ${process.pid}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

export default app;
