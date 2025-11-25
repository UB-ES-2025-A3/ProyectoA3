import axios from 'axios';

function resolveApiBase() {
  // 1º: que manden las env vars de Vercel (preview / prod)
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  // 2º: si por lo que sea no vienen, usar el config.js como fallback
  if (window.APP_CONFIG?.REACT_APP_API_URL) return window.APP_CONFIG.REACT_APP_API_URL;
  // 3º: fallback local
  return 'http://localhost:8080/api';
}

const API_BASE_URL = resolveApiBase();
if (process.env.NODE_ENV !== 'test') {
  console.log('[authService] API_BASE_URL =', API_BASE_URL);
}

const authService = {
  // Registro de usuario
  async signUp(userData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, userData);
      // Guardar el token y userId en localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      if (response.data.userId) {
        localStorage.setItem('userId', response.data.userId.toString());
      }
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      // Intentar obtener el mensaje de error del backend
      let errorMessage = 'Error al registrar usuario';
      
      if (error.response?.data) {
        // El backend puede devolver el mensaje en 'message' o 'error'
        errorMessage = error.response.data.message || error.response.data.error || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Login de usuario
  async login(credentials) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
      // Guardar el token y userId en localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      if (response.data.userId) {
        localStorage.setItem('userId', response.data.userId.toString());
      }
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
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  }
};

export default authService;

