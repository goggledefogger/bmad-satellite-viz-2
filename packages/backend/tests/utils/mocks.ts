export const createHttpClientMock = () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
});

export const createRedisClientMock = () => ({
  get: jest.fn(),
  set: jest.fn(),
  keys: jest.fn(),
  mDel: jest.fn(),
});

export const createTLEParserStaticMock = () => ({
  parseTLE: jest.fn(),
  parseCelesTrakTLE: jest.fn(),
  parseSpaceTrackTLE: jest.fn(),
});

export const staticTLEModuleFrom = (mock: ReturnType<typeof createTLEParserStaticMock>) => ({
  TLEParser: {
    parseTLE: (...args: any[]) => (mock.parseTLE as any)(...args),
    parseCelesTrakTLE: (...args: any[]) => (mock.parseCelesTrakTLE as any)(...args),
    parseSpaceTrackTLE: (...args: any[]) => (mock.parseSpaceTrackTLE as any)(...args),
  },
});

