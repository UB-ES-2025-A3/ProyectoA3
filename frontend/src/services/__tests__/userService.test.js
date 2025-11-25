// Mock de axios - Jest usará automáticamente src/__mocks__/axios.js
jest.mock('axios');
import axios from 'axios';

import userService from '../userService';

describe('userService', () => {
  const mockUserId = '1';
  const mockToken = 'test-token-123';

  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockClear();
    axios.put.mockClear();
    localStorage.clear();
  });

  describe('getUserProfile', () => {
    test('debe obtener el perfil del usuario exitosamente', async () => {
      localStorage.setItem('token', mockToken);

      const mockProfile = {
        id: 1,
        username: 'testuser',
        correo: 'test@example.com',
        nombre: 'Test',
        apellidos: 'User'
      };

      axios.get.mockResolvedValue({
        data: mockProfile
      });

      const result = await userService.getUserProfile(mockUserId);

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining(`/clients/${mockUserId}`),
        expect.objectContaining({
          headers: {
            Authorization: `Bearer ${mockToken}`
          }
        })
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProfile);
    });

    test('debe manejar errores al obtener el perfil', async () => {
      localStorage.setItem('token', mockToken);

      const mockError = {
        response: {
          data: {
            message: 'Usuario no encontrado'
          }
        }
      };

      axios.get.mockRejectedValue(mockError);

      const result = await userService.getUserProfile(mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Usuario no encontrado');
    });

    test('debe usar mensaje de error por defecto si no hay mensaje específico', async () => {
      localStorage.setItem('token', mockToken);

      axios.get.mockRejectedValue({
        response: {}
      });

      const result = await userService.getUserProfile(mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Error al obtener el perfil del usuario');
    });

    test('debe funcionar sin token de autenticación', async () => {
      localStorage.clear();

      const mockProfile = {
        id: 1,
        username: 'publicuser'
      };

      axios.get.mockResolvedValue({
        data: mockProfile
      });

      const result = await userService.getUserProfile(mockUserId);

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining(`/clients/${mockUserId}`),
        expect.objectContaining({
          headers: {
            Authorization: undefined
          }
        })
      );
      expect(result.success).toBe(true);
    });
  });

  describe('updateUserProfile', () => {
    test('debe actualizar el perfil del usuario exitosamente', async () => {
      localStorage.setItem('token', mockToken);

      const updateData = {
        nombre: 'Nuevo',
        apellidos: 'Nombre',
        ciudad: 'Madrid'
      };

      const mockUpdatedProfile = {
        id: 1,
        ...updateData
      };

      axios.put.mockResolvedValue({
        data: mockUpdatedProfile
      });

      const result = await userService.updateUserProfile(mockUserId, updateData);

      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining(`/clients/${mockUserId}`),
        updateData,
        expect.objectContaining({
          headers: {
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          }
        })
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdatedProfile);
    });

    test('debe manejar respuesta con data anidada', async () => {
      localStorage.setItem('token', mockToken);

      const updateData = { nombre: 'Test' };
      const mockResponse = {
        data: {
          data: { id: 1, nombre: 'Test' } // Backend envuelve en { data: {...} }
        }
      };

      axios.put.mockResolvedValue(mockResponse);

      const result = await userService.updateUserProfile(mockUserId, updateData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 1, nombre: 'Test' });
    });

    test('debe manejar errores al actualizar el perfil', async () => {
      localStorage.setItem('token', mockToken);

      const mockError = {
        response: {
          data: {
            message: 'Error de validación'
          }
        }
      };

      axios.put.mockRejectedValue(mockError);

      const result = await userService.updateUserProfile(mockUserId, { nombre: 'Test' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Error de validación');
    });

    test('debe usar mensaje de error por defecto si no hay mensaje específico', async () => {
      localStorage.setItem('token', mockToken);

      axios.put.mockRejectedValue({
        response: {}
      });

      const result = await userService.updateUserProfile(mockUserId, { nombre: 'Test' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Error al actualizar el perfil');
    });
  });

  describe('getUserStats', () => {
    test('debe obtener estadísticas del usuario exitosamente', async () => {
      localStorage.setItem('token', mockToken);

      const mockStats = {
        eventosCreados: 5,
        eventosParticipados: 10,
        eventosFavoritos: 3
      };

      axios.get.mockResolvedValue({
        data: mockStats
      });

      const result = await userService.getUserStats(mockUserId);

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining(`/clients/${mockUserId}/stats`),
        expect.objectContaining({
          headers: {
            Authorization: `Bearer ${mockToken}`
          }
        })
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStats);
    });

    test('debe manejar errores al obtener estadísticas', async () => {
      localStorage.setItem('token', mockToken);

      axios.get.mockRejectedValue({
        response: {
          data: {
            message: 'Estadísticas no disponibles'
          }
        }
      });

      const result = await userService.getUserStats(mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Estadísticas no disponibles');
    });
  });
});

