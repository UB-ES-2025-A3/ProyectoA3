// src/services/userService.js
import axios from "axios";
import { mockUser, mockUserStats } from "../mocks/profile";

const API_BASE_URL =
  (window.APP_CONFIG && window.APP_CONFIG.REACT_APP_API_URL) ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:8080/api";
// habilita mocks solo si la variable de entorno lo indica explícitamente
const USE_MOCKS = process.env.REACT_APP_USE_MOCKS === "true";

function getToken() {
  return localStorage.getItem("token") || localStorage.getItem("authToken") || null;
}

const userService = {
  /**
   * Obtiene el perfil del usuario por su ID
   * @param {number|string} userId - ID del usuario
   */
  async getUserProfile(userId) {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true, data: mockUser };
    }

    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/clients/${userId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Error al obtener el perfil del usuario",
      };
    }
  },

  /**
   * Estadísticas del usuario (si existe endpoint)
   */
  async getUserStats(userId) {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { success: true, data: mockUserStats };
    }

    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/clients/${userId}/stats`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Error al obtener estadísticas",
      };
    }
  },

  // Dejamos SOLO esta versión de updateUserProfile (la más completa)
  async updateUserProfile(userId, userData) {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true, data: { ...mockUser, ...userData } };
    }

    try {
      const token = getToken();
      const response = await axios.put(`${API_BASE_URL}/clients/${userId}`, userData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "application/json",
        },
      });
      // Normaliza: unwrap { data: {...} } si el backend lo envolviera
      const payload = response.data?.data ?? response.data;
      return { success: true, data: payload };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Error al actualizar el perfil",
      };
    }
  },

  async getParticipantsByIds(participantIds) {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        success: true,
        data: participantIds.slice(0, 3).map((id, index) => ({
          id,
          nombre: ["María", "Carlos", "Ana"][index] || "Usuario",
          apellidos: ["García", "López", "Martínez"][index] || "Apellido",
          username: `user${id}`,
          ciudad: ["Barcelona", "Madrid", "Valencia"][index] || "Ciudad",
          idiomas: [["es", "en"], ["es", "fr"], ["es", "en", "de"]][index] || ["es"],
        })),
      };
    }

    try {
      const token = getToken();
      const response = await axios.post(`${API_BASE_URL}/clients/participants`, participantIds, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "application/json",
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error al obtener participantes:", error);
      return {
        success: false,
        error:
          error.response && error.response.data && error.response.data.message
            ? error.response.data.message
            : "Error al obtener información de participantes",
      };
    }
  },

  /**
   * Obtiene el tema del usuario
   * @param {number|string} userId - ID del usuario
   */
  async getTema(userId) {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return { success: true, data: { tema: localStorage.getItem('profileBgColor') || 'default' } };
    }

    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/clients/${userId}/tema`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      // Normalizar posibles formas de respuesta: string o { tema } o { data: { tema } }
      const raw = response.data;
      const tema =
        (typeof raw === 'string' && raw) ||
        raw?.tema ||
        raw?.data?.tema ||
        null;

      return { success: true, data: { tema } };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Error al obtener el tema del usuario",
      };
    }
  },

  /**
   * Actualiza el tema del usuario
   * @param {number|string} userId - ID del usuario
   * @param {string} tema - El nuevo tema (color) a guardar
   */
  async updateTema(userId, tema) {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      localStorage.setItem('profileBgColor', tema);
      return { success: true, data: { tema } };
    }

    try {
      const token = getToken();
      const response = await axios.put(`${API_BASE_URL}/clients/${userId}/tema`, { tema }, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "application/json",
        },
      });

      // Normalizar respuesta a { tema }
      const raw = response.data;
      const temaResp =
        (typeof raw === 'string' && raw) ||
        raw?.tema ||
        raw?.data?.tema ||
        tema;

      return { success: true, data: { tema: temaResp } };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Error al actualizar el tema",
      };
    }
  },
};

export default userService;
