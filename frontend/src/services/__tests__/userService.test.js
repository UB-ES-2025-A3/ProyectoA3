// Mock de axios - Jest usará automáticamente src/__mocks__/axios.js
jest.mock('axios');
import axios from 'axios';

import userService from '../userService';

describe('userService', () => {
  const mockUserId = '1';
  const mockToken = 'test-token-123';
  const API_BASE_URL = 'http://localhost:8080/api';

  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockClear();
    axios.post.mockClear();
    axios.put.mockClear();
    localStorage.clear();

    // Mock window.APP_CONFIG
    window.APP_CONFIG = {
      REACT_APP_API_URL: API_BASE_URL,
      REACT_APP_USE_MOCKS: false
    };
  });

  describe('getParticipantsByIds', () => {
    test('debe obtener información de participantes exitosamente', async () => {
      localStorage.setItem('token', mockToken);

      const mockParticipants = [
        {
          id: 1,
          nombre: 'María',
          apellidos: 'García',
          username: 'maria',
          correo: 'maria@example.com',
          ciudad: 'Barcelona',
          idiomas: ['es', 'en']
        },
        {
          id: 2,
          nombre: 'Carlos',
          apellidos: 'López',
          username: 'carlos',
          correo: 'carlos@example.com',
          ciudad: 'Madrid',
          idiomas: ['es', 'fr']
        }
      ];

      axios.post.mockResolvedValue({
        data: mockParticipants
      });

      const result = await userService.getParticipantsByIds([1, 2]);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockParticipants);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].nombre).toBe('María');
      expect(result.data[1].nombre).toBe('Carlos');
    });

    test('debe llamar al endpoint correcto con los parámetros correctos', async () => {
      localStorage.setItem('token', mockToken);

      axios.post.mockResolvedValue({
        data: []
      });

      const participantIds = [1, 2, 3];
      await userService.getParticipantsByIds(participantIds);

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/clients/participants'),
        participantIds,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          })
        })
      );
    });

    test('debe manejar el caso de array vacío', async () => {
      localStorage.setItem('token', mockToken);

      axios.post.mockResolvedValue({
        data: []
      });

      const result = await userService.getParticipantsByIds([]);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.data).toHaveLength(0);
    });

    test('debe manejar errores del servidor', async () => {
      localStorage.setItem('token', mockToken);

      const errorMessage = 'Error al obtener participantes';
      axios.post.mockRejectedValue({
        response: {
          data: {
            message: errorMessage
          }
        }
      });

      const result = await userService.getParticipantsByIds([1, 2]);

      expect(result.success).toBe(false);
      expect(result.error).toBe(errorMessage);
    });

    test('debe manejar errores de red', async () => {
      localStorage.setItem('token', mockToken);

      axios.post.mockRejectedValue(new Error('Network Error'));

      const result = await userService.getParticipantsByIds([1, 2]);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Error al obtener información de participantes');
    });

    test('debe incluir Authorization header cuando hay token', async () => {
      localStorage.setItem('authToken', 'my-auth-token');

      axios.post.mockResolvedValue({ data: [] });

      await userService.getParticipantsByIds([1]);

      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer my-auth-token'
          })
        })
      );
    });

    test('debe manejar participantes con información parcial', async () => {
      localStorage.setItem('token', mockToken);

      const mockParticipants = [
        {
          id: 1,
          nombre: 'Usuario',
          apellidos: 'Sin Datos',
          username: 'user1'
          // ciudad e idiomas pueden ser undefined
        }
      ];

      axios.post.mockResolvedValue({
        data: mockParticipants
      });

      const result = await userService.getParticipantsByIds([1]);

      expect(result.success).toBe(true);
      expect(result.data[0]).toHaveProperty('nombre', 'Usuario');
      expect(result.data[0]).toHaveProperty('username', 'user1');
    });
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
