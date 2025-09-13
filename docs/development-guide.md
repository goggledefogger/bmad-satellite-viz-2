# Development Guide

## Overview

This project is a browser-based 3D satellite visualization tool that runs on Mac Silicon but targets web browsers. We use modern web technologies and development practices to create an engaging, performant visualization.

## Package Management

### pnpm

We use **pnpm** as our package manager for its efficiency and strict dependency management:

```bash
# Install pnpm globally
npm install -g pnpm

# Install dependencies
pnpm install

# Add a new dependency
pnpm add <package-name>

# Add a dev dependency
pnpm add -D <package-name>

# Run scripts
pnpm run <script-name>
```

**Why pnpm:**
- Faster installs through content-addressable storage
- Strict dependency resolution prevents phantom dependencies
- Disk space efficient with hard links
- Better monorepo support

## 3D Graphics

### Three.js (Primary Choice)

For browser-based 3D graphics, we use **Three.js**:

```bash
pnpm add three
pnpm add -D @types/three
```

**Three.js Benefits:**
- Mature, well-documented WebGL library
- Excellent browser compatibility
- Large ecosystem of extensions
- Good performance for our use case
- Active community and support

**Key Three.js Concepts:**
- **Scene**: Container for 3D objects
- **Camera**: Defines the viewpoint
- **Renderer**: Draws the scene to canvas
- **Geometry**: Shape definitions
- **Material**: Surface properties
- **Mesh**: Geometry + Material combination

### Godot (Alternative/Advanced)

For more complex 3D scenarios or if we need advanced features, **Godot** can export to WebAssembly:

**When to consider Godot:**
- Complex physics simulations
- Advanced shader effects
- Game-like interactions
- Performance-critical calculations

**Godot Web Export:**
- Export to HTML5/WebAssembly
- Maintains high performance
- Larger bundle size trade-off

## Development Environment

### Mac Silicon (Apple M1/M2/M3)

**Optimizations for Apple Silicon:**
- Use native ARM64 Node.js builds
- Leverage Metal Performance Shaders when available
- Optimize for unified memory architecture
- Test on both Intel and Apple Silicon browsers

**Development Tools:**
```bash
# Use native ARM64 Node.js
nvm install --lts
nvm use --lts

# Install Rosetta 2 for Intel compatibility if needed
softwareupdate --install-rosetta
```

### Browser Targeting

**Primary Targets:**
- Chrome/Chromium (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

**Mobile Considerations:**
- iOS Safari
- Android Chrome
- Responsive design for tablets

**Performance Targets:**
- 60fps on mid-range devices
- Smooth interaction on 3-year-old hardware
- Progressive enhancement for older browsers

## MCP Servers

### Context7 Integration

We use **Context7 MCP** for enhanced development capabilities:

```bash
# Context7 provides:
# - Real-time documentation access
# - Code examples and best practices
# - Library compatibility information
# - Performance optimization guidance
```

**Context7 Benefits:**
- Up-to-date library documentation
- Code snippet generation
- Compatibility checking
- Performance insights

**Integration Points:**
- Three.js documentation and examples
- WebGL best practices
- Browser compatibility data
- Performance optimization guides

## Environment Configuration

### Environment Files
- **Root**: `.env.example` (template)
- **Frontend**: `packages/frontend/.env.local`
- **Backend**: `packages/backend/.env.local`

**Important Note**: The AI assistant cannot access or create `.env` files directly for security reasons. When environment files are needed, the assistant will provide the exact content for you to copy/paste into the appropriate `.env` files.

### Environment Variables

#### Local Development
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WEBSOCKET_URL=ws://localhost:3000/ws

# External APIs
CELESTRAK_API_URL=https://celestrak.com/NORAD/elements
CELESTRAK_TIMEOUT=10000
CELESTRAK_RETRY_ATTEMPTS=3
CELESTRAK_RETRY_DELAY=1000

SPACE_TRACK_API_URL=https://www.space-track.org
SPACE_TRACK_USERNAME=your_actual_username
SPACE_TRACK_PASSWORD=your_actual_password
SPACE_TRACK_TIMEOUT=15000
SPACE_TRACK_RETRY_ATTEMPTS=3
SPACE_TRACK_RETRY_DELAY=2000
SPACE_TRACK_RATE_LIMIT_HOUR=1000
SPACE_TRACK_RATE_LIMIT_MINUTE=20

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/satellite_viz
REDIS_URL=redis://localhost:6379

# Redis TTL Settings (seconds)
REDIS_TTL_SATELLITE_DATA=300
REDIS_TTL_POSITIONS=60
REDIS_TTL_METADATA=3600

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VERCEL_ANALYTICS_ID=your-analytics-id

# Development
NODE_ENV=development
LOG_LEVEL=debug
PORT=3000
```

#### Production (Vercel)
```bash
# API Configuration
VITE_API_BASE_URL=https://your-app.vercel.app/api
VITE_WEBSOCKET_URL=wss://your-app.vercel.app/ws

# External APIs (same as development)
CELESTRAK_API_URL=https://celestrak.com/NORAD/elements
SPACE_TRACK_API_URL=https://www.space-track.org
SPACE_TRACK_USERNAME=your_production_username
SPACE_TRACK_PASSWORD=your_production_password

# Database (production URLs)
DATABASE_URL=postgresql://prod_user:prod_pass@prod_host:5432/satellite_viz
REDIS_URL=redis://prod_redis_host:6379

# Monitoring
SENTRY_DSN=https://your-production-sentry-dsn@sentry.io/project-id
VERCEL_ANALYTICS_ID=your-production-analytics-id

# Production
NODE_ENV=production
LOG_LEVEL=info
```

### Setting Up Environment Files

1. **Copy template files:**
   ```bash
   cp .env.example .env.local
   cp packages/backend/.env.example packages/backend/.env.local
   cp packages/frontend/.env.example packages/frontend/.env.local
   ```

2. **Update with your credentials:**
   - Replace `your_actual_username` and `your_actual_password` with your Space-Track credentials
   - Update database URLs if using external databases
   - Add monitoring service credentials if needed

3. **Verify configuration:**
   ```bash
   # Test the API configuration
   curl http://localhost:3000/api/test
   ```

## Logging System

### Comprehensive Logging
We use a structured logging system with multiple levels and specialized logging methods for different operations.

#### Log Levels
- **ERROR** (0): Critical errors that require immediate attention
- **WARN** (1): Warning conditions that should be noted
- **INFO** (2): General information about application flow
- **DEBUG** (3): Detailed information for debugging
- **TRACE** (4): Very detailed information for deep debugging

#### Environment-Based Logging
```bash
# Development - verbose logging
LOG_LEVEL=debug

# Production - minimal logging
LOG_LEVEL=info

# Testing - error-only logging
LOG_LEVEL=error
```

#### Specialized Logging Methods
```typescript
// API calls and responses
logger.apiCall('GET', 'https://api.example.com/data');
logger.apiResponse('GET', 'https://api.example.com/data', 200, 150);

// Cache operations
logger.cacheHit('satellites:active');
logger.cacheMiss('satellites:active');
logger.cacheSet('satellites:active', 300);

// Satellite data operations
logger.satelliteData(150, 'celestrak', { filter: 'active' });
logger.tleParsed(75);
logger.orbitalCalculation('25544');

// Performance monitoring
logger.performance('satellite-fetch', 1200);
```

#### Log Format
```
[2024-01-15T10:30:45.123Z] INFO: Fetching active satellites | Context: {"filter":{"status":"active"},"cacheKey":"satellites:active:{\"status\":\"active\"}"}
```

### Viewing Logs

#### Local Development
```bash
# Start server with debug logging
LOG_LEVEL=debug pnpm run start:dev

# View logs in real-time
tail -f logs/app.log
```

#### Production (Vercel)
- Logs are automatically sent to Vercel's logging system
- Use Vercel CLI to view logs: `vercel logs`
- Integrate with external logging services (Sentry, LogRocket, etc.)

## Process Management

### Preventing Duplicate Services
The server includes process management to prevent multiple instances:

```typescript
// Process ID logging
console.log(`🔧 Process ID: ${process.pid}`);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => process.exit(0));
});
```

### Port Management
- **Development**: Always uses port 3000
- **Production**: Vercel automatically assigns ports
- **Conflict Resolution**: Server will fail to start if port 3000 is occupied

### Health Checks
```bash
# Check if server is running
curl http://localhost:3000/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "service": "satellite-api",
  "version": "1.0.0"
}
```

## Project Structure

```
bmad-satellite-viz-2/
├── docs/                    # Documentation
├── src/                     # Source code
│   ├── components/         # React/Vue components
│   ├── scenes/            # Three.js scenes
│   ├── utils/             # Utility functions
│   └── data/              # Satellite data
├── public/                # Static assets
├── tests/                 # Test files
├── .bmad-core/           # BMad methodology files
└── package.json          # Dependencies and scripts
```

## Development Workflow

### Local Development

```bash
# Start development server
pnpm run dev

# Run tests
pnpm run test

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

### Code Quality

```bash
# Linting
pnpm run lint

# Type checking
pnpm run type-check

# Formatting
pnpm run format
```

## Performance Considerations

### 3D Graphics Optimization

- **LOD (Level of Detail)**: Reduce polygon count for distant objects
- **Frustum Culling**: Don't render objects outside camera view
- **Instanced Rendering**: For multiple similar objects (satellites)
- **Texture Atlasing**: Combine small textures
- **Compressed Textures**: Use DXT/ETC compression

### Browser Performance

- **Web Workers**: Offload heavy calculations
- **RequestAnimationFrame**: Smooth animations
- **Memory Management**: Dispose of unused geometries/materials
- **Progressive Loading**: Load data in chunks

## Deployment

### Vercel Deployment

#### Prerequisites
1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: `npm install -g vercel`
3. **Environment Variables**: Set up in Vercel dashboard

#### Deployment Steps
```bash
# 1. Build the project
pnpm run build

# 2. Deploy to Vercel
vercel --prod

# 3. Set environment variables in Vercel dashboard
# Go to Project Settings > Environment Variables
```

#### Vercel Configuration
The project includes `vercel.json` for optimal deployment:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "packages/backend/src/functions/api/*.ts",
      "use": "@vercel/node"
    },
    {
      "src": "packages/frontend/package.json",
      "use": "@vercel/static-build"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/packages/backend/src/functions/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/packages/frontend/dist/$1"
    }
  ]
}
```

#### Environment Variables in Vercel
Set these in your Vercel project dashboard:

**Required:**
- `SPACE_TRACK_USERNAME`
- `SPACE_TRACK_PASSWORD`
- `NODE_ENV=production`

**Optional:**
- `DATABASE_URL` (if using external database)
- `REDIS_URL` (if using external Redis)
- `SENTRY_DSN` (for error tracking)
- `VERCEL_ANALYTICS_ID` (for analytics)

#### Deployment Commands
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# Check deployment status
vercel ls
```

### Local Development vs Production

#### Development
- **Port**: 3000
- **Logging**: Debug level
- **Caching**: Disabled or local Redis
- **Database**: Local PostgreSQL (optional)

#### Production
- **Port**: Vercel-assigned
- **Logging**: Info level
- **Caching**: External Redis
- **Database**: Production PostgreSQL
- **CDN**: Automatic via Vercel

### Browser Compatibility

- **Polyfills**: For older browser support
- **Feature Detection**: Graceful degradation
- **Progressive Enhancement**: Core functionality first
- **WebGL Support**: Automatic fallback detection

## Tools and Libraries

### Core Dependencies

```json
{
  "three": "^0.160.0",
  "react": "^18.0.0",
  "typescript": "^5.0.0",
  "vite": "^5.0.0"
}
```

### Development Tools

```json
{
  "@types/three": "^0.160.0",
  "eslint": "^8.0.0",
  "prettier": "^3.0.0",
  "vitest": "^1.0.0"
}
```

## Best Practices

1. **Modular Architecture**: Separate concerns (data, rendering, interaction)
2. **Type Safety**: Use TypeScript for better development experience
3. **Performance Monitoring**: Track FPS and memory usage
4. **Accessibility**: Ensure keyboard navigation and screen reader support
5. **Mobile First**: Design for touch interactions
6. **Progressive Enhancement**: Core functionality works without JavaScript

## Troubleshooting

### Common Issues

#### Server Issues

**Port 3000 Already in Use:**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or use a different port
PORT=3001 pnpm run start:dev
```

**Environment Variables Not Loading:**
```bash
# Check if .env.local exists
ls -la .env*

# Verify environment variables are set
echo $SPACE_TRACK_USERNAME

# Restart the server after changing .env files
pnpm run start:dev
```

**API Connection Issues:**
```bash
# Test CelesTrak API (no auth required)
curl https://celestrak.com/NORAD/elements/active.txt

# Test Space-Track API (requires auth)
curl -u "username:password" https://www.space-track.org/api/basicspacedata/query/class/tle_latest/limit/1
```

#### Frontend Issues

**WebGL Context Lost:**
- Implement context restoration
- Handle device memory constraints
- Check browser WebGL support

**Performance Issues:**
- Profile with browser dev tools
- Use Three.js stats.js for monitoring
- Optimize draw calls and geometry
- Check memory usage in dev tools

**Mobile Compatibility:**
- Test on actual devices
- Use touch-friendly controls
- Optimize for limited memory
- Check viewport meta tags

#### Deployment Issues

**Vercel Build Failures:**
```bash
# Check build logs
vercel logs

# Test build locally
pnpm run build

# Check environment variables in Vercel dashboard
```

**Environment Variables Not Available in Production:**
- Verify variables are set in Vercel dashboard
- Check variable names match exactly
- Ensure variables are set for production environment

**API Endpoints Not Working:**
- Check Vercel function logs
- Verify routing in vercel.json
- Test endpoints individually

### Debug Commands

```bash
# Check server health
curl http://localhost:3000/health

# Test API endpoints
curl http://localhost:3000/api/test
curl http://localhost:3000/api/satellites

# View server logs
LOG_LEVEL=debug pnpm run start:dev

# Check process status
ps aux | grep node

# Monitor port usage
netstat -an | grep 3000
```

### Getting Help

1. **Check logs first**: Always start with server and browser console logs
2. **Test endpoints**: Use curl to test API endpoints directly
3. **Verify environment**: Ensure all required environment variables are set
4. **Check dependencies**: Run `pnpm install` to ensure all packages are installed
5. **Clear cache**: Delete `node_modules` and reinstall if needed

## Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [WebGL Fundamentals](https://webglfundamentals.org/)
- [Context7 MCP Documentation](https://context7.io/)
- [pnpm Documentation](https://pnpm.io/)
- [Mac Silicon Development Guide](https://developer.apple.com/documentation/apple-silicon)
