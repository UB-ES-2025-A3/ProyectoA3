// Mock manual de axios para los tests
// Jest usará este archivo automáticamente cuando encuentre jest.mock('axios')
// Esto resuelve el problema de ES modules de axios v1.4.0+

const mockAxios = {
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  patch: jest.fn(() => Promise.resolve({ data: {} })),
  create: jest.fn(function() { return mockAxios; }),
  defaults: {
    headers: {
      common: {}
    }
  },
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() }
  }
};

// Exportar tanto para CommonJS como ES modules
module.exports = mockAxios;
module.exports.default = mockAxios;

