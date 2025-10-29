import axios from 'axios';
import { mockUser, mockUserStats, mockUserEvents } from '../mocks/profile';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const USE_MOCKS = process.env.REACT_APP_USE_MOCKS === 'true' || true; // Temporalmente en true para usar mocks

const userService = {
  /**
   * Obtiene el perfil del usuario por su ID
   * @param {number} userId - ID del usuario
   * @returns {Promise} - Datos del usuario
   */
  async getUserProfile(userId) {
    if (USE_MOCKS) {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        data: mockUser
      };
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE_URL}/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener el perfil del usuario'
      };
    }
  },

  /**
   * Actualiza el perfil del usuario
   * @param {number} userId - ID del usuario
   * @param {Object} userData - Datos a actualizar
   * @returns {Promise} - Usuario actualizado
   */
  async updateUserProfile(userId, userData) {
    if (USE_MOCKS) {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        data: { ...mockUser, ...userData }
      };
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.put(`${API_BASE_URL}/users/${userId}`, userData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar el perfil'
      };
    }
  },

  /**
   * Obtiene las estadísticas del usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise} - Estadísticas del usuario
   */
  async getUserStats(userId) {
    if (USE_MOCKS) {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        success: true,
        data: mockUserStats
      };
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE_URL}/users/${userId}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener estadísticas'
      };
    }
  },

  /**
   * Obtiene los eventos creados por el usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise} - Lista de eventos creados
   */
  async getCreatedEvents(userId) {
    if (USE_MOCKS) {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 400));
      return {
        success: true,
        data: mockUserEvents
      };
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE_URL}/users/${userId}/events/created`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener eventos creados'
      };
    }
  }
};

export default userService;
