// jest-dom añade matchers personalizados para hacer assertions sobre el DOM
// Ejemplo: expect(element).toHaveTextContent(/react/i)
// Más info: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock de window.APP_CONFIG para los tests
global.window.APP_CONFIG = global.window.APP_CONFIG || {};

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(() => {
    // Cuando se llama clear(), también limpiamos los mocks
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  }),
};
global.localStorage = localStorageMock;

// Suprimir warnings de act() - son comunes con user-event v13 y no son críticos
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: An update to') &&
      args[0].includes('was not wrapped in act(...)')
    ) {
      return; // Suprimir warnings de act()
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Limpiar mocks después de cada test
// NOTA: No usamos jest.clearAllMocks() aquí porque puede interferir con los mocks de localStorage
// Los tests individuales pueden limpiar sus propios mocks si es necesario
afterEach(() => {
  // Solo limpiar las llamadas de localStorage, no las funciones mock
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
});

