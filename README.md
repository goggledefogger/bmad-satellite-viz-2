# Satellite Visualization Platform

A beautiful, browser-based 3D satellite visualization platform that makes space accessible and engaging for everyone. Built with React, Three.js, and modern web technologies.

## 🌟 Features

- **Real-time 3D Visualization**: Interactive 3D Earth with live satellite positions
- **Beautiful Design**: Artistic space-themed UI with smooth animations
- **Educational Content**: Learn about satellites, orbits, and space technology
- **Cross-platform**: Works on desktop, tablet, and mobile devices
- **Accessibility**: WCAG AA compliant with full keyboard navigation
- **Performance**: Optimized for 60fps on mid-range devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/bmad-satellite-viz-2.git
   cd bmad-satellite-viz-2
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   - Frontend: `http://localhost:5173`
   - API (if running backend dev server): `http://localhost:3000`

## 📁 Project Structure

```
bmad-satellite-viz-2/
├── packages/
│   ├── frontend/          # React frontend application (Vite)
│   ├── backend/           # Backend API (Express for local dev, Vercel serverless functions for deploy)
│   ├── shared/            # Shared types and utilities
│   └── ui/                # Shared UI components
├── docs/                  # Documentation
├── .github/               # GitHub Actions workflows
└── e2e/                   # End-to-end tests
```

## 🛠️ Development

### Available Scripts

- `pnpm dev` - Start all package dev tasks (frontend, backend, libraries)
- `pnpm build` - Build all packages
- `pnpm test` - Run all tests
- `pnpm test:unit` - Run unit tests
- `pnpm test:integration` - Run integration tests
- `pnpm test:e2e` - Run end-to-end tests
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - Run TypeScript type checking

### Package Scripts

Each package has its own scripts. Use workspace filters by package name:

```bash
# Frontend
pnpm --filter @frontend/app dev
pnpm --filter @frontend/app build
pnpm --filter @frontend/app test

# Backend
pnpm --filter @backend/api start:dev
pnpm --filter @backend/api build
pnpm --filter @backend/api test

# Shared types
pnpm --filter @shared/types build
pnpm --filter @shared/types test

# UI components
pnpm --filter @ui/components build
pnpm --filter @ui/components test
```

## 🏗️ Architecture

### Technology Stack

- **Frontend**: React 18, TypeScript, Three.js, React Three Fiber
- **Backend**: Node.js, Express, TypeScript, Vercel Functions
- **Database**: PostgreSQL, Redis
- **Styling**: Tailwind CSS, Custom Design System
- **Testing**: Jest, React Testing Library, Playwright
- **CI/CD**: GitHub Actions, Vercel

### Key Features

- **Monorepo**: Managed with pnpm workspaces
- **Type Safety**: Full TypeScript coverage
- **3D Graphics**: WebGL-based rendering with Three.js
- **Real-time Data**: WebSocket connections for live updates
- **Performance**: Optimized for 60fps rendering
- **Accessibility**: WCAG AA compliance

## 🧪 Testing

### Test Types

- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: API testing with Supertest
- **E2E Tests**: Cross-browser testing with Playwright
- **Performance Tests**: Custom 3D rendering benchmarks
- **Accessibility Tests**: Automated WCAG compliance

### Running Tests

```bash
# All tests
pnpm test

# Specific test types
pnpm test:unit
pnpm test:integration
pnpm test:e2e
pnpm test:a11y

# Coverage report
pnpm test --coverage
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npx vercel
   ```

2. **Configure environment variables**
   Set up your environment variables in the Vercel dashboard

3. **Deploy**
   ```bash
   pnpm build
   vercel --prod
   ```

### Manual Deployment

1. **Build the project**
   ```bash
   pnpm build
   ```

2. **Deploy frontend**
   ```bash
   cd packages/frontend
   pnpm build
   # Deploy dist/ to your hosting provider
   ```

3. **Deploy backend**
   ```bash
   cd packages/backend
   pnpm build
   # Deploy dist/ to your serverless platform
   ```

## 📊 Performance

### Targets

- **Frame Rate**: 60fps on mid-range devices
- **Load Time**: < 3 seconds initial load
- **Memory Usage**: < 100MB during normal operation
- **Bundle Size**: Optimized with code splitting

### Monitoring

- **Real User Monitoring**: Vercel Analytics
- **Error Tracking**: Sentry integration
- **Performance Metrics**: Custom 3D rendering benchmarks

## 🔧 Configuration

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

### Customization

- **Colors**: Edit `packages/ui/src/tokens/colors.ts`
- **Fonts**: Update `packages/frontend/tailwind.config.js`
- **3D Effects**: Modify shaders in `packages/frontend/src/shaders/`

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   pnpm test
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Guidelines

- Follow the coding standards in `docs/architecture/coding-standards.md`
- Write tests for new features
- Ensure accessibility compliance
- Update documentation as needed

## 📚 Documentation

- [Architecture Guide](docs/architecture/)
- [API Documentation](docs/api/)
- [Component Library](docs/components/)
- [Testing Guide](docs/testing/)

## 🐛 Troubleshooting

### Common Issues

1. **Build fails with TypeScript errors**
   ```bash
   pnpm type-check
   ```

2. **3D rendering issues**
   - Check WebGL support in browser
   - Verify Three.js dependencies

3. **Performance issues**
   - Check device capabilities
   - Adjust quality settings

### Getting Help

- Check the [Issues](https://github.com/your-org/bmad-satellite-viz-2/issues) page
- Review the [Documentation](docs/)
- Join our [Discord](https://discord.gg/your-server)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Three.js](https://threejs.org/) for 3D graphics
- [React Three Fiber](https://github.com/pmndrs/react-three-fiber) for React integration
- [CelesTrak](https://celestrak.com/) for satellite data
- [Space-Track](https://www.space-track.org/) for orbital data

---

**Built with ❤️ by the BMad Development Team**
