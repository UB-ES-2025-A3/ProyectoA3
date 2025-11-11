import axios from 'axios';

function resolveApiBase() {
  if (window.APP_CONFIG?.REACT_APP_API_URL) return window.APP_CONFIG.REACT_APP_API_URL;
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL; 
  return 'http://localhost:8080/api';
}
const API_BASE_URL = resolveApiBase();
console.log('[authService] API_BASE_URL =', API_BASE_URL);

const authService = {
  // Registro de usuario
  async signUp(userData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, userData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al registrar usuario'
      };
    }
  },

  // Login de usuario
  async login(credentials) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 404) {
        errorMessage = 'Servicio no disponible. Verifica que el servidor esté funcionando.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error del servidor. Inténtalo de nuevo más tarde.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet o que el servidor esté activo.';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
};

export default authService;

