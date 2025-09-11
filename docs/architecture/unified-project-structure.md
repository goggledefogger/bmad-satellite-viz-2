# Unified Project Structure

## Monorepo Overview

The Satellite Visualization Platform uses a monorepo structure to manage frontend, backend, and shared utilities in a single repository. This approach provides simplified dependency management, shared TypeScript types, unified CI/CD, and easier code sharing.

## Root Directory Structure

```
bmad-satellite-viz-2/
├── .bmad-core/                 # BMad framework configuration
├── .github/                    # GitHub Actions workflows
├── .ai/                        # AI development logs and debugging
├── docs/                       # Documentation
│   ├── architecture/           # Architecture documents
│   ├── stories/               # User stories and development tasks
│   ├── prd/                   # Product requirements (sharded)
│   └── qa/                    # Quality assurance documents
├── packages/                   # Monorepo packages
│   ├── frontend/              # React frontend application
│   ├── backend/               # Serverless backend functions
│   ├── shared/                # Shared utilities and types
│   └── ui/                    # Shared UI components
├── tools/                      # Development tools and scripts
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── package.json               # Root package.json for workspace
├── pnpm-workspace.yaml        # PNPM workspace configuration
├── tsconfig.json              # Root TypeScript configuration
└── README.md                  # Project documentation
```

## Package Structure

### Frontend Package (`packages/frontend/`)

```
packages/frontend/
├── src/
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── visualization/    # 3D visualization components
│   │   ├── satellite/        # Satellite-specific components
│   │   └── layout/           # Layout components
│   ├── hooks/                # Custom React hooks
│   ├── stores/               # Zustand state stores
│   ├── utils/                # Utility functions
│   ├── types/                # TypeScript type definitions
│   ├── assets/               # Static assets
│   │   ├── textures/         # 3D textures and materials
│   │   ├── models/           # 3D models
│   │   └── images/           # Images and icons
│   ├── shaders/              # GLSL shader files
│   ├── styles/               # CSS and styling
│   ├── pages/                # Page components
│   └── App.tsx               # Main application component
├── public/                    # Public static files
├── tests/                     # Frontend tests
├── package.json              # Frontend dependencies
├── tsconfig.json             # Frontend TypeScript config
├── vite.config.ts            # Vite configuration
└── tailwind.config.js        # Tailwind CSS configuration
```

### Backend Package (`packages/backend/`)

```
packages/backend/
├── src/
│   ├── functions/            # Serverless functions
│   │   ├── api/             # REST API endpoints
│   │   ├── websocket/       # WebSocket handlers
│   │   └── scheduled/       # Scheduled functions
│   ├── services/            # Business logic services
│   │   ├── satellite/       # Satellite data services
│   │   ├── orbit/           # Orbital calculations
│   │   └── cache/           # Caching services
│   ├── models/              # Data models and schemas
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript type definitions
│   └── config/              # Configuration files
├── tests/                    # Backend tests
├── package.json             # Backend dependencies
├── tsconfig.json            # Backend TypeScript config
└── vercel.json              # Vercel deployment config
```

### Shared Package (`packages/shared/`)

```
packages/shared/
├── src/
│   ├── types/               # Shared TypeScript types
│   │   ├── satellite.ts     # Satellite data types
│   │   ├── orbit.ts         # Orbital data types
│   │   └── api.ts           # API response types
│   ├── utils/               # Shared utility functions
│   │   ├── math.ts          # Mathematical utilities
│   │   ├── validation.ts    # Data validation
│   │   └── constants.ts     # Application constants
│   ├── schemas/             # Data validation schemas
│   └── config/              # Shared configuration
├── tests/                   # Shared package tests
├── package.json            # Shared dependencies
└── tsconfig.json           # Shared TypeScript config
```

### UI Package (`packages/ui/`)

```
packages/ui/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button/          # Button component
│   │   ├── Input/           # Input component
│   │   ├── Modal/           # Modal component
│   │   └── index.ts         # Component exports
│   ├── tokens/              # Design tokens
│   │   ├── colors.ts        # Color palette
│   │   ├── typography.ts    # Typography scale
│   │   └── spacing.ts       # Spacing scale
│   ├── styles/              # Global styles
│   └── types/               # Component prop types
├── tests/                   # UI component tests
├── package.json            # UI dependencies
└── tsconfig.json           # UI TypeScript config
```

## File Naming Conventions

### Components
- **React Components**: PascalCase (e.g., `SatelliteVisualization.tsx`)
- **Component Files**: Match component name exactly
- **Index Files**: `index.ts` for clean imports

### Utilities and Services
- **Functions**: camelCase (e.g., `calculateOrbit.ts`)
- **Classes**: PascalCase (e.g., `SatelliteService.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)

### Types and Interfaces
- **Types**: PascalCase with `Type` suffix (e.g., `SatelliteType.ts`)
- **Interfaces**: PascalCase with `Interface` suffix (e.g., `ApiResponseInterface.ts`)

### Tests
- **Test Files**: `.test.ts` or `.spec.ts` suffix
- **Test Directories**: `__tests__` or co-located with source

## Import/Export Patterns

### Barrel Exports
Use index files for clean imports:
```typescript
// packages/shared/src/index.ts
export * from './types';
export * from './utils';
export * from './schemas';
```

### Relative vs Absolute Imports
- **Within Package**: Use relative imports (`./components/Button`)
- **Cross Package**: Use absolute imports (`@shared/types`, `@ui/components`)

### Path Mapping
Configure TypeScript path mapping for clean imports:
```json
{
  "compilerOptions": {
    "paths": {
      "@shared/*": ["packages/shared/src/*"],
      "@ui/*": ["packages/ui/src/*"],
      "@frontend/*": ["packages/frontend/src/*"],
      "@backend/*": ["packages/backend/src/*"]
    }
  }
}
```

## Environment Configuration

### Environment Files
- **Root**: `.env.example` (template)
- **Frontend**: `packages/frontend/.env.local`
- **Backend**: `packages/backend/.env.local`

### Environment Variables
```bash
# API Configuration
VITE_API_BASE_URL=https://api.satellite-viz.com
VITE_WEBSOCKET_URL=wss://ws.satellite-viz.com

# External APIs
CELESTRAK_API_URL=https://celestrak.com/NORAD/elements
SPACE_TRACK_API_URL=https://www.space-track.org

# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Monitoring
SENTRY_DSN=https://...
VERCEL_ANALYTICS_ID=...
```

## Build and Deployment

### Build Commands
```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Build specific package
pnpm --filter frontend build

# Run tests
pnpm test

# Run linting
pnpm lint

# Run type checking
pnpm type-check
```

### Deployment Structure
- **Frontend**: Deployed to Vercel with automatic previews
- **Backend**: Serverless functions deployed to Vercel
- **Database**: PostgreSQL hosted on Vercel Postgres
- **CDN**: Static assets served via Vercel CDN

## Development Workflow

### Branch Strategy
- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/**: Feature development branches
- **hotfix/**: Critical bug fixes

### Commit Convention
```
type(scope): description

feat(frontend): add satellite filtering component
fix(backend): resolve API rate limiting issue
docs(architecture): update tech stack documentation
```

### Pull Request Process
1. Create feature branch from `develop`
2. Implement changes with tests
3. Run quality checks (lint, test, type-check)
4. Create pull request with description
5. Code review and approval
6. Merge to `develop`
7. Deploy to staging for testing
8. Merge to `main` for production
