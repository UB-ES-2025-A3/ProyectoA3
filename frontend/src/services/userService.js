import axios from 'axios';
import { mockUser, mockUserStats, mockUserEvents } from '../mocks/profile';

const API_BASE_URL = (window.APP_CONFIG && window.APP_CONFIG.REACT_APP_API_URL) || process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
// habilita mocks solo si la variable de entorno lo indica explícitamente
const USE_MOCKS = process.env.REACT_APP_USE_MOCKS === 'true';

function getToken() {
  return localStorage.getItem('token') || localStorage.getItem('authToken') || null;
}

const userService = {
  /**
   * Obtiene el perfil del usuario por su ID
   * @param {number|string} userId - ID del usuario
   */
  async getUserProfile(userId) {
    if (USE_MOCKS) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, data: mockUser };
    }

    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/clients/${userId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error al obtener el perfil del usuario' };
    }
  },

  /**
   * Actualiza el perfil del usuario
   */
  async updateUserProfile(userId, userData) {
    if (USE_MOCKS) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, data: { ...mockUser, ...userData } };
    }

    try {
      const token = getToken();
      const response = await axios.put(`${API_BASE_URL}/clients/${userId}`, userData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error al actualizar el perfil' };
    }
  },

  /**
   * Estadísticas del usuario (si existe endpoint)
   */
  async getUserStats(userId) {
    if (USE_MOCKS) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true, data: mockUserStats };
    }

    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/clients/${userId}/stats`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error al obtener estadísticas' };
    }
  },

  async updateUserProfile(userId, userData) {
    if (USE_MOCKS) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, data: { ...mockUser, ...userData } };
    }

    try {
      const token = getToken();
      const response = await axios.put(`${API_BASE_URL}/clients/${userId}`, userData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          'Content-Type': 'application/json'
        }
      });
      // Normaliza: unwrap { data: {...} } si el backend lo envolviera
      const payload = response.data?.data ?? response.data;
      return { success: true, data: payload };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error al actualizar el perfil' };
    }
  },
};

export default userService;
