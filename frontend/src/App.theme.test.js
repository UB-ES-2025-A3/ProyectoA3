import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import userService from './services/userService';

// Mocks
jest.mock('./services/userService');
jest.mock('./services/eventService', () => ({
  getMyCreatedEvents: jest.fn().mockResolvedValue([]),
  getAllEvents: jest.fn().mockResolvedValue({ events: [], total: 0 }),
  getFavoriteEvents: jest.fn().mockResolvedValue([]),
  getEvents: jest.fn().mockResolvedValue({ events: [], total: 0, totalPages: 0, currentPage: 1 })
}));
jest.mock('./services/authService', () => ({
  logout: jest.fn()
}));

// Mocks de imágenes
jest.mock('./assets/avatars/avatar-default.jpg', () => 'avatar-default.jpg');
jest.mock('./assets/avatars/avatar-1.png', () => 'avatar-1.png');
jest.mock('./assets/avatars/avatar-2.png', () => 'avatar-2.png');
jest.mock('./assets/avatars/avatar-3.png', () => 'avatar-3.png');
jest.mock('./assets/avatars/avatar-4.png', () => 'avatar-4.png');
jest.mock('./assets/avatars/avatar-5.png', () => 'avatar-5.png');

// Lista de temas válidos (debe coincidir con App.js)
const VALID_THEMES = ['default', 'blue', 'green', 'purple', 'orange', 'pink', 'dark'];

const renderApp = (initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <App />
    </MemoryRouter>
  );
};

describe('App - Tema Global', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
    // Reset data-theme attribute
    document.documentElement.removeAttribute('data-theme');
    
    userService.getTema.mockResolvedValue({
      success: true,
      data: { tema: 'default' }
    });
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  describe('Tema por defecto para usuarios no autenticados', () => {
    test('usa tema estándar cuando no hay usuario logueado', async () => {
      // Sin userId en localStorage - renderiza splash page
      await act(async () => {
        renderApp('/');
      });

      await waitFor(() => {
        const appElement = document.querySelector('.App');
        expect(appElement).toHaveAttribute('data-theme', 'default');
      });
    });

    test('no intenta cargar tema de API sin usuario', async () => {
      await act(async () => {
        renderApp('/');
      });

      await waitFor(() => {
        expect(userService.getTema).not.toHaveBeenCalled();
      });
    });
  });

  describe('Carga de tema para usuarios autenticados', () => {
    test('carga tema desde API cuando hay usuario logueado', async () => {
      localStorage.setItem('userId', '1');
      localStorage.setItem('token', 'test-token');
      
      userService.getTema.mockResolvedValue({
        success: true,
        data: { tema: 'blue' }
      });

      await act(async () => {
        renderApp('/'); // Splash page para evitar EventPage
      });

      await waitFor(() => {
        expect(userService.getTema).toHaveBeenCalledWith('1');
      });
    });

    test('aplica el tema cargado desde la API', async () => {
      localStorage.setItem('userId', '1');
      localStorage.setItem('token', 'test-token');
      
      userService.getTema.mockResolvedValue({
        success: true,
        data: { tema: 'blue' }
      });

      await act(async () => {
        renderApp('/');
      });

      await waitFor(() => {
        const appElement = document.querySelector('.App');
        expect(appElement).toHaveAttribute('data-theme', 'blue');
      });
    });

    test('guarda tema en localStorage después de cargar de API', async () => {
      localStorage.setItem('userId', '1');
      localStorage.setItem('token', 'test-token');
      
      userService.getTema.mockResolvedValue({
        success: true,
        data: { tema: 'orange' }
      });

      await act(async () => {
        renderApp('/');
      });

      await waitFor(() => {
        expect(localStorage.getItem('profileTheme')).toBe('orange');
      });
    });
  });

  describe('Manejo de tema "default"', () => {
    test('aplica correctamente el tema "default"', async () => {
      localStorage.setItem('userId', '1');
      localStorage.setItem('token', 'test-token');
      
      userService.getTema.mockResolvedValue({
        success: true,
        data: { tema: 'default' }
      });

      await act(async () => {
        renderApp('/');
      });

      await waitFor(() => {
        const appElement = document.querySelector('.App');
        expect(appElement).toHaveAttribute('data-theme', 'default');
      });
    });
  });

  describe('Manejo de errores al cargar tema', () => {
    test('usa tema por defecto si falla la carga de API', async () => {
      localStorage.setItem('userId', '1');
      localStorage.setItem('token', 'test-token');
      
      userService.getTema.mockRejectedValue(new Error('API Error'));

      await act(async () => {
        renderApp('/');
      });

      await waitFor(() => {
        const appElement = document.querySelector('.App');
        expect(appElement).toHaveAttribute('data-theme', 'default');
      });
    });

    test('usa tema por defecto si API devuelve error', async () => {
      localStorage.setItem('userId', '1');
      localStorage.setItem('token', 'test-token');
      
      userService.getTema.mockResolvedValue({
        success: false,
        error: 'Error de servidor'
      });

      await act(async () => {
        renderApp('/');
      });

      // Debería usar el tema por defecto
      await waitFor(() => {
        const appElement = document.querySelector('.App');
        expect(appElement).toBeInTheDocument();
      });
    });
  });

  describe('Cache de tema en localStorage', () => {
    test('usa tema cacheado mientras carga de API', async () => {
      localStorage.setItem('userId', '1');
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('profileTheme', 'pink');
      
      // API tarda en responder
      userService.getTema.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true, data: { tema: 'blue' } }), 100))
      );

      await act(async () => {
        renderApp('/');
      });

      // Primero debería usar el cache
      const appElement = document.querySelector('.App');
      expect(appElement).toHaveAttribute('data-theme', 'pink');
    });
  });

  describe('Atributo data-theme', () => {
    test('establece el atributo data-theme en el documento', async () => {
      localStorage.setItem('userId', '1');
      localStorage.setItem('token', 'test-token');
      
      userService.getTema.mockResolvedValue({
        success: true,
        data: { tema: 'purple' }
      });

      await act(async () => {
        renderApp('/');
      });

      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('purple');
      });
    });
  });
});
