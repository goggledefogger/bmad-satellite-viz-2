# Architecture Index

## Overview

This document provides an index to all architecture documents for the Satellite Visualization Platform. The architecture follows a serverless, monorepo structure optimized for 3D web visualization and real-time satellite data integration.

## Architecture Documents

### Core Architecture
- [tech-stack.md](./tech-stack.md) - Technology stack and framework choices
- [unified-project-structure.md](./unified-project-structure.md) - Monorepo structure and file organization
- [coding-standards.md](./coding-standards.md) - Code quality and style guidelines
- [testing-strategy.md](./testing-strategy.md) - Testing approach and requirements

### Frontend Architecture
- [frontend-architecture.md](./frontend-architecture.md) - React/Three.js frontend architecture
- [components.md](./components.md) - Component specifications and design system
- [core-workflows.md](./core-workflows.md) - User interaction workflows

### Backend Architecture
- [backend-architecture.md](./backend-architecture.md) - Serverless backend architecture
- [data-models.md](./data-models.md) - Data models and schemas
- [database-schema.md](./database-schema.md) - Database design and relationships
- [rest-api-spec.md](./rest-api-spec.md) - API specifications and endpoints
- [external-apis.md](./external-apis.md) - External API integrations

### Performance & Security
- [performance-optimization.md](./performance-optimization.md) - Performance requirements and optimization
- [security-architecture.md](./security-architecture.md) - Security implementation and compliance

## Architecture Principles

1. **Serverless First**: All backend services use serverless functions for scalability
2. **3D Performance**: Optimized for 60fps 3D rendering on mid-range devices
3. **Real-time Data**: Live satellite position updates with WebSocket connections
4. **Accessibility**: WCAG AA compliance throughout the platform
5. **Educational Focus**: Architecture supports educational features and content
6. **Cross-platform**: Responsive design for desktop, tablet, and mobile
7. **Open Source**: Preference for free and open-source solutions

## Version

Architecture Version: v4
Last Updated: 2024-12-19
