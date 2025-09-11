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

### Web Deployment

- **Static Hosting**: Vercel, Netlify, GitHub Pages
- **CDN**: CloudFlare for global distribution
- **Compression**: Gzip/Brotli for assets
- **Caching**: Proper cache headers for static assets

### Browser Compatibility

- **Polyfills**: For older browser support
- **Feature Detection**: Graceful degradation
- **Progressive Enhancement**: Core functionality first

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

**WebGL Context Lost:**
- Implement context restoration
- Handle device memory constraints

**Performance Issues:**
- Profile with browser dev tools
- Use Three.js stats.js for monitoring
- Optimize draw calls and geometry

**Mobile Compatibility:**
- Test on actual devices
- Use touch-friendly controls
- Optimize for limited memory

## Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [WebGL Fundamentals](https://webglfundamentals.org/)
- [Context7 MCP Documentation](https://context7.io/)
- [pnpm Documentation](https://pnpm.io/)
- [Mac Silicon Development Guide](https://developer.apple.com/documentation/apple-silicon)
