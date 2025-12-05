// src/services/__tests__/authService.test.js

import axios from 'axios';
import authService from '../authService';

// Mock de axios - Jest usará automáticamente src/__mocks__/axios.js si existe
jest.mock('axios');

describe('authService', () => {
  let setItemSpy;
  let removeItemSpy;

  beforeEach(() => {
    // Limpiar mocks de axios
    axios.post.mockReset();
    axios.get?.mockReset && axios.get.mockReset();
    axios.put?.mockReset && axios.put.mockReset();
    axios.delete?.mockReset && axios.delete.mockReset();
    axios.patch?.mockReset && axios.patch.mockReset();

    // Espiar localStorage
    setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');
  });

  afterEach(() => {
    setItemSpy.mockRestore();
    removeItemSpy.mockRestore();
  });

  describe('signUp', () => {
    const mockUserData = {
      nombre: 'Test',
      apellidos: 'User',
      username: 'testuser',
      correo: 'test@example.com',
      fechaNacimiento: '2000-01-01',
      ciudad: 'Barcelona',
      // En tu RegisterForm usas idioma como array, pero el servicio simplemente lo envía tal cual.
      // Aquí lo dejamos como string porque sólo verificamos que se pasa el objeto tal cual.
      idioma: 'es',
      password: 'Password123!'
    };

    test('debe registrar un usuario exitosamente y guardar token en localStorage', async () => {
      const mockResponse = {
        data: {
          token: 'test-token-123',
          userId: 1,
          username: 'testuser'
        }
      };
      axios.post.mockResolvedValue(mockResponse);

      const result = await authService.signUp(mockUserData);

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/signup'),
        mockUserData
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);
      expect(setItemSpy).toHaveBeenCalledWith('token', 'test-token-123');
      expect(setItemSpy).toHaveBeenCalledWith('userId', '1');
    });

    test('debe manejar errores de registro correctamente', async () => {
      const mockError = {
        response: {
          data: {
            message: 'El usuario ya existe'
          }
        }
      };
      axios.post.mockRejectedValue(mockError);

      const result = await authService.signUp(mockUserData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('El usuario ya existe');
      expect(setItemSpy).not.toHaveBeenCalled();
    });

    test('debe usar mensaje de error por defecto si no hay mensaje específico', async () => {
      const mockError = {
        response: {}
      };
      axios.post.mockRejectedValue(mockError);

      const result = await authService.signUp(mockUserData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Error al registrar usuario');
    });

    test('debe guardar userId solo si está presente en la respuesta', async () => {
      const mockResponse = {
        data: {
          token: 'test-token-123'
          // Sin userId
        }
      };
      axios.post.mockResolvedValue(mockResponse);

      await authService.signUp(mockUserData);

      expect(setItemSpy).toHaveBeenCalledWith('token', 'test-token-123');
      expect(setItemSpy).not.toHaveBeenCalledWith('userId', expect.anything());
    });
  });

  describe('login', () => {
    const mockCredentials = {
      usernameOrEmail: 'testuser',
      password: 'password123'
    };

    test('debe hacer login exitosamente y guardar token en localStorage', async () => {
      const mockResponse = {
        data: {
          token: 'login-token-456',
          userId: 2,
          username: 'testuser'
        }
      };
      axios.post.mockResolvedValue(mockResponse);

      const result = await authService.login(mockCredentials);

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        mockCredentials
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);
      expect(setItemSpy).toHaveBeenCalledWith('token', 'login-token-456');
      expect(setItemSpy).toHaveBeenCalledWith('userId', '2');
    });

    test('debe manejar error con mensaje del servidor (message)', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Credenciales inválidas'
          }
        }
      };
      axios.post.mockRejectedValue(mockError);

      const result = await authService.login(mockCredentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Credenciales inválidas');
    });

    test('debe manejar error con campo "error" del servidor', async () => {
      const mockError = {
        response: {
          data: {
            error: 'Usuario no encontrado'
          }
        }
      };
      axios.post.mockRejectedValue(mockError);

      const result = await authService.login(mockCredentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Usuario no encontrado');
    });

    test('debe manejar error 404 con mensaje específico', async () => {
      const mockError = {
        response: {
          status: 404
        }
      };
      axios.post.mockRejectedValue(mockError);

      const result = await authService.login(mockCredentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'Servicio no disponible. Verifica que el servidor esté funcionando.'
      );
    });

    test('debe manejar error 500 con mensaje específico', async () => {
      const mockError = {
        response: {
          status: 500
        }
      };
      axios.post.mockRejectedValue(mockError);

      const result = await authService.login(mockCredentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'Error del servidor. Inténtalo de nuevo más tarde.'
      );
    });

    test('debe manejar Network Error con mensaje específico', async () => {
      const mockError = {
        message: 'Network Error'
      };
      axios.post.mockRejectedValue(mockError);

      const result = await authService.login(mockCredentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'Error de conexión. Verifica tu conexión a internet o que el servidor esté activo.'
      );
    });

    test('debe usar mensaje de error por defecto si no hay información específica', async () => {
      const mockError = {
        response: {}
      };
      axios.post.mockRejectedValue(mockError);

      const result = await authService.login(mockCredentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Error al iniciar sesión');
    });
  });

  describe('logout', () => {
    test('debe eliminar token y userId del localStorage', () => {
      authService.logout();

      expect(removeItemSpy).toHaveBeenCalledWith('token');
      expect(removeItemSpy).toHaveBeenCalledWith('userId');
    });
  });

  // NOTA: Los tests de resolución de API_BASE_URL no son posibles sin refactorizar el código
  // porque API_BASE_URL se calcula al importar el módulo, no en tiempo de ejecución.
  // Esto requeriría cambiar authService.js para usar una función getApiBase() similar a eventService.js
});
