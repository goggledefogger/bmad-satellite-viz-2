# Coding Standards

## TypeScript Configuration

### Strict Mode
All packages use strict TypeScript configuration:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### Type Definitions
- **Explicit Types**: Always define explicit types for function parameters and return values
- **Interface over Type**: Prefer interfaces for object shapes, types for unions/primitives
- **Generic Constraints**: Use generic constraints for type safety
- **No Any**: Avoid `any` type, use `unknown` or specific types

```typescript
// Good
interface SatelliteData {
  id: string;
  name: string;
  position: Vector3;
}

function calculateOrbit(satellite: SatelliteData): OrbitData {
  // implementation
}

// Bad
function calculateOrbit(satellite: any): any {
  // implementation
}
```

## React Standards

### Component Structure
```typescript
// Component file structure
import React from 'react';
import { SatelliteData } from '@shared/types';

interface SatelliteVisualizationProps {
  satellites: SatelliteData[];
  onSatelliteSelect: (satellite: SatelliteData) => void;
}

export const SatelliteVisualization: React.FC<SatelliteVisualizationProps> = ({
  satellites,
  onSatelliteSelect,
}) => {
  // Hooks at the top
  const [selectedSatellite, setSelectedSatellite] = useState<SatelliteData | null>(null);

  // Event handlers
  const handleSatelliteClick = useCallback((satellite: SatelliteData) => {
    setSelectedSatellite(satellite);
    onSatelliteSelect(satellite);
  }, [onSatelliteSelect]);

  // Render
  return (
    <div className="satellite-visualization">
      {/* JSX content */}
    </div>
  );
};
```

### Hooks Rules
- **Custom Hooks**: Prefix with `use` (e.g., `useSatelliteData`)
- **Hook Dependencies**: Always include all dependencies in dependency arrays
- **Hook Order**: Keep hooks at the top of components, before any early returns

```typescript
// Good
const useSatelliteData = (satelliteId: string) => {
  const [data, setData] = useState<SatelliteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchSatelliteData(satelliteId);
        setData(result);
      } catch (error) {
        console.error('Failed to fetch satellite data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [satelliteId]); // Include all dependencies

  return { data, loading };
};
```

### Performance Optimization
- **Memoization**: Use `React.memo` for expensive components
- **Callback Memoization**: Use `useCallback` for event handlers passed to children
- **Value Memoization**: Use `useMemo` for expensive calculations

```typescript
// Good
const SatelliteList = React.memo<SatelliteListProps>(({ satellites, onSelect }) => {
  const filteredSatellites = useMemo(() => {
    return satellites.filter(sat => sat.active);
  }, [satellites]);

  const handleSelect = useCallback((satellite: SatelliteData) => {
    onSelect(satellite);
  }, [onSelect]);

  return (
    <div>
      {filteredSatellites.map(satellite => (
        <SatelliteItem
          key={satellite.id}
          satellite={satellite}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
});
```

## Three.js Standards

### Scene Setup
```typescript
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

const Scene: React.FC = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 75 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Earth />
      <Satellites />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={10}
      />
    </Canvas>
  );
};
```

### Resource Management
- **Dispose Resources**: Always dispose of Three.js resources to prevent memory leaks
- **Use useFrame**: For animations, use `useFrame` hook
- **Optimize Geometries**: Reuse geometries and materials when possible

```typescript
const Satellite: React.FC<SatelliteProps> = ({ position, data }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  useEffect(() => {
    return () => {
      // Cleanup resources if needed
      if (meshRef.current) {
        meshRef.current.geometry.dispose();
        meshRef.current.material.dispose();
      }
    };
  }, []);

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial color={getSatelliteColor(data.type)} />
    </mesh>
  );
};
```

## API Standards

### REST API Design
```typescript
// API endpoint structure
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API client
class SatelliteApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getSatellites(params?: GetSatellitesParams): Promise<PaginatedResponse<SatelliteData>> {
    const response = await fetch(`${this.baseUrl}/satellites`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
```

### Error Handling
```typescript
// Error types
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Error handling wrapper
const withErrorHandling = async <T>(
  apiCall: () => Promise<T>
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    if (error instanceof ApiError) {
      // Handle API errors
      console.error(`API Error ${error.status}: ${error.message}`);
      throw error;
    } else {
      // Handle unexpected errors
      console.error('Unexpected error:', error);
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
};
```

## Testing Standards

### Unit Tests
```typescript
// Test file structure
import { render, screen, fireEvent } from '@testing-library/react';
import { SatelliteVisualization } from './SatelliteVisualization';

describe('SatelliteVisualization', () => {
  const mockSatellites: SatelliteData[] = [
    {
      id: '1',
      name: 'ISS',
      position: { x: 0, y: 0, z: 0 },
      type: 'space-station',
    },
  ];

  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders satellite list', () => {
    render(
      <SatelliteVisualization
        satellites={mockSatellites}
        onSatelliteSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('ISS')).toBeInTheDocument();
  });

  it('calls onSatelliteSelect when satellite is clicked', () => {
    render(
      <SatelliteVisualization
        satellites={mockSatellites}
        onSatelliteSelect={mockOnSelect}
      />
    );

    fireEvent.click(screen.getByText('ISS'));

    expect(mockOnSelect).toHaveBeenCalledWith(mockSatellites[0]);
  });
});
```

### Integration Tests
```typescript
// API integration test
describe('Satellite API Integration', () => {
  it('fetches satellite data successfully', async () => {
    const mockResponse = {
      data: mockSatellites,
      success: true,
      timestamp: new Date().toISOString(),
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const client = new SatelliteApiClient('https://api.test.com');
    const result = await client.getSatellites();

    expect(result.data).toEqual(mockSatellites);
    expect(result.success).toBe(true);
  });
});
```

## Code Quality Tools

### ESLint Configuration
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off"
  }
}
```

### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### Husky Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ]
  }
}
```

## Documentation Standards

### JSDoc Comments
```typescript
/**
 * Calculates the orbital position of a satellite at a given time
 * @param satellite - The satellite data including orbital elements
 * @param time - The time to calculate position for (in milliseconds since epoch)
 * @returns The 3D position of the satellite in Earth-centered coordinates
 * @throws {ValidationError} When satellite data is invalid
 * @example
 * ```typescript
 * const position = calculateOrbitalPosition(satellite, Date.now());
 * console.log(`Satellite at: ${position.x}, ${position.y}, ${position.z}`);
 * ```
 */
export function calculateOrbitalPosition(
  satellite: SatelliteData,
  time: number
): Vector3 {
  // implementation
}
```

### README Files
Each package should have a comprehensive README with:
- Installation instructions
- Usage examples
- API documentation
- Development setup
- Contributing guidelines
