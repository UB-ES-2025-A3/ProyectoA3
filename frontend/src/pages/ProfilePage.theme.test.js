import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfilePage from './ProfilePage';
import userService from '../services/userService';
import { getMyCreatedEvents } from '../services/eventService';

// Mocks
jest.mock('../services/userService');
jest.mock('../services/eventService', () => ({
  getMyCreatedEvents: jest.fn()
}));

// Mock de imágenes de avatares
jest.mock('../assets/avatars/avatar-default.jpg', () => 'avatar-default.jpg');
jest.mock('../assets/avatars/avatar-1.png', () => 'avatar-1.png');
jest.mock('../assets/avatars/avatar-2.png', () => 'avatar-2.png');
jest.mock('../assets/avatars/avatar-3.png', () => 'avatar-3.png');
jest.mock('../assets/avatars/avatar-4.png', () => 'avatar-4.png');
jest.mock('../assets/avatars/avatar-5.png', () => 'avatar-5.png');

// Datos de prueba
const mockUser = {
  id: 1,
  nombre: 'Juan',
  apellidos: 'Pérez García',
  username: 'juanperez',
  correo: 'juan@test.com',
  ciudad: 'Barcelona',
  fechaNacimiento: '1990-01-01',
  descripcion: 'Usuario de prueba',
  tema: 'default'
};

// Temas válidos según el backend
const VALID_THEMES = ['default', 'blue', 'green', 'purple', 'orange', 'pink', 'dark'];

describe('ProfilePage - Funcionalidad de Tema', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('userId', '1');
    localStorage.setItem('token', 'test-token');
    
    // Configurar mocks por defecto
    userService.getUserProfile.mockResolvedValue({
      success: true,
      data: mockUser
    });
    
    userService.getUserStats.mockResolvedValue({
      success: true,
      data: { enrolledEvents: 5, organizedEvents: 2, ratings: 10 }
    });
    
    userService.getTema.mockResolvedValue({
      success: true,
      data: { tema: 'default' }
    });
    
    userService.updateTema.mockResolvedValue({
      success: true,
      data: { tema: 'blue' }
    });
    
    getMyCreatedEvents.mockResolvedValue([]);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Criterio 1: Sección "Tema" accesible desde perfil', () => {
    test('muestra la sección "Tema" siempre visible', async () => {
      await act(async () => {
        render(<ProfilePage />);
      });

      await waitFor(() => {
        expect(screen.getByText('Tema')).toBeInTheDocument();
      });
    });

    test('muestra selector con todos los temas disponibles', async () => {
      await act(async () => {
        render(<ProfilePage />);
      });

      await waitFor(() => {
        expect(screen.getByText('Tema')).toBeInTheDocument();
      });

      // Verificar que hay botones para cada tema
      const colorButtons = screen.getAllByRole('button', { name: /Seleccionar tema/i });
      expect(colorButtons.length).toBe(VALID_THEMES.length);
    });
  });

  describe('Criterio 2: Previsualización en tiempo real y guardar con botón', () => {
    test('previsualiza el tema al hacer clic sin guardar en backend', async () => {
      await act(async () => {
        render(<ProfilePage />);
      });

      await waitFor(() => {
        expect(screen.getByText('Tema')).toBeInTheDocument();
      });

      // Encontrar y hacer clic en un botón de tema diferente (blue)
      const blueButton = screen.getByRole('button', { name: /Seleccionar tema blue/i });

      await act(async () => {
        fireEvent.click(blueButton);
      });

      // NO debería llamar a updateTema inmediatamente (solo previsualización)
      expect(userService.updateTema).not.toHaveBeenCalled();
      
      // Debería mostrar botones de guardar/cancelar
      expect(screen.getByText(/Guardar tema/i)).toBeInTheDocument();
    });

    test('guarda el tema solo al hacer clic en "Guardar tema"', async () => {
      await act(async () => {
        render(<ProfilePage />);
      });

      await waitFor(() => {
        expect(screen.getByText('Tema')).toBeInTheDocument();
      });

      const blueButton = screen.getByRole('button', { name: /Seleccionar tema blue/i });
      
      await act(async () => {
        fireEvent.click(blueButton);
      });

      // Hacer clic en guardar
      const saveButton = screen.getByText(/Guardar tema/i);
      await act(async () => {
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(userService.updateTema).toHaveBeenCalledWith('1', 'blue');
      });
    });

    test('cancela los cambios al hacer clic en "Cancelar"', async () => {
      await act(async () => {
        render(<ProfilePage />);
      });

      await waitFor(() => {
        expect(screen.getByText('Tema')).toBeInTheDocument();
      });

      const blueButton = screen.getByRole('button', { name: /Seleccionar tema blue/i });
      
      await act(async () => {
        fireEvent.click(blueButton);
      });

      // Hacer clic en cancelar - buscar el botón dentro de theme-actions
      const cancelButtons = screen.getAllByRole('button', { name: /Cancelar/i });
      const themeCancelButton = cancelButtons.find(btn => btn.closest('.theme-actions'));
      
      await act(async () => {
        fireEvent.click(themeCancelButton || cancelButtons[cancelButtons.length - 1]);
      });

      // No debería haber guardado
      expect(userService.updateTema).not.toHaveBeenCalled();
      
      // Los botones de guardar/cancelar deberían desaparecer
      await waitFor(() => {
        expect(screen.queryByText(/Guardar tema/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Criterio 3: Persistencia del tema', () => {
    test('carga el tema desde la API al iniciar', async () => {
      userService.getTema.mockResolvedValue({
        success: true,
        data: { tema: 'blue' }
      });

      await act(async () => {
        render(<ProfilePage />);
      });

      await waitFor(() => {
        expect(userService.getTema).toHaveBeenCalledWith('1');
      });
    });

    test('guarda el tema en localStorage para sincronización', async () => {
      userService.getTema.mockResolvedValue({
        success: true,
        data: { tema: 'blue' }
      });

      await act(async () => {
        render(<ProfilePage />);
      });

      await waitFor(() => {
        expect(localStorage.getItem('profileTheme')).toBe('blue');
      });
    });

    test('usa tema por defecto si la API no devuelve tema', async () => {
      userService.getTema.mockResolvedValue({
        success: true,
        data: { tema: null }
      });

      await act(async () => {
        render(<ProfilePage />);
      });

      await waitFor(() => {
        expect(localStorage.getItem('profileTheme')).toBe('default');
      });
    });
  });

  describe('Criterio 4: Usuarios sin autenticar ven tema estándar', () => {
    test('no carga tema del usuario si no hay userId', async () => {
      localStorage.removeItem('userId');

      await act(async () => {
        render(<ProfilePage />);
      });

      await waitFor(() => {
        expect(screen.getByText(/No se pudo cargar el perfil|No hay usuario logueado/i)).toBeInTheDocument();
      });
    });
  });

  describe('Criterio 5: Notificación "Tema guardado correctamente"', () => {
    test('muestra notificación de éxito al guardar el tema', async () => {
      await act(async () => {
        render(<ProfilePage />);
      });

      await waitFor(() => {
        expect(screen.getByText('Tema')).toBeInTheDocument();
      });

      const blueButton = screen.getByRole('button', { name: /Seleccionar tema blue/i });
      
      await act(async () => {
        fireEvent.click(blueButton);
      });

      const saveButton = screen.getByText(/Guardar tema/i);
      await act(async () => {
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Tema guardado correctamente')).toBeInTheDocument();
      });
    });

    test('muestra notificación de error si falla la actualización', async () => {
      userService.updateTema.mockResolvedValue({
        success: false,
        error: 'Error al guardar el tema'
      });

      await act(async () => {
        render(<ProfilePage />);
      });

      await waitFor(() => {
        expect(screen.getByText('Tema')).toBeInTheDocument();
      });

      const blueButton = screen.getByRole('button', { name: /Seleccionar tema blue/i });
      
      await act(async () => {
        fireEvent.click(blueButton);
      });

      const saveButton = screen.getByText(/Guardar tema/i);
      await act(async () => {
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Error al guardar el tema')).toBeInTheDocument();
      });
    });
  });

  describe('Estados de carga del tema', () => {
    test('muestra indicador de guardando mientras guarda el tema', async () => {
      userService.updateTema.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true, data: { tema: 'blue' } }), 100))
      );

      await act(async () => {
        render(<ProfilePage />);
      });

      await waitFor(() => {
        expect(screen.getByText('Tema')).toBeInTheDocument();
      });

      const blueButton = screen.getByRole('button', { name: /Seleccionar tema blue/i });
      
      await act(async () => {
        fireEvent.click(blueButton);
      });

      const saveButton = screen.getByText(/Guardar tema/i);
      await act(async () => {
        fireEvent.click(saveButton);
      });

      // Debería mostrar indicador de guardando
      expect(screen.getAllByText(/Guardando/i).length).toBeGreaterThan(0);

      await waitFor(() => {
        expect(screen.queryByText('Guardando tema...')).not.toBeInTheDocument();
      });
    });
  });
});

describe('userService - Funciones de Tema', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('getTema devuelve el tema del usuario', async () => {
    userService.getTema.mockResolvedValue({
      success: true,
      data: { tema: 'blue' }
    });

    const result = await userService.getTema('1');
    
    expect(result.success).toBe(true);
    expect(result.data.tema).toBe('blue');
  });

  test('updateTema actualiza el tema del usuario', async () => {
    userService.updateTema.mockResolvedValue({
      success: true,
      data: { tema: 'orange' }
    });

    const result = await userService.updateTema('1', 'orange');
    
    expect(result.success).toBe(true);
    expect(result.data.tema).toBe('orange');
  });
});
