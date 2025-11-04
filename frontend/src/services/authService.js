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
      return {
        success: false,
        error: error.response?.data?.message || 'Error al iniciar sesión'
      };
    }
  }
};

export default authService;

