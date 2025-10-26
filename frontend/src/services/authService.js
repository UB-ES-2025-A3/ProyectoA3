import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const authService = {
  // Registro de usuario
  async signUp(userData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, userData);
      // Guardar el token y userId en localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      if (response.data.id) {
        localStorage.setItem('userId', response.data.id.toString());
      }
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
      // Guardar el token y userId en localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      if (response.data.id) {
        localStorage.setItem('userId', response.data.id.toString());
      }
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
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  }
};

export default authService;

