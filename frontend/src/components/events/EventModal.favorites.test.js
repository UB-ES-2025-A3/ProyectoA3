import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock de i18n para que t() devuelva los textos esperados por los tests
jest.mock('react-i18next', () => ({
  useTranslation: () => {
    const translations = {
      'EventModal.aria.addFavorite': 'Añadir a favoritos',
      'EventModal.aria.removeFavorite': 'Eliminar de favoritos',
      'EventModal.aria.loginToFavorite': 'Inicia sesión para guardar favoritos',
      'EventModal.favorite.mustLogin':
        'Debes iniciar sesión para guardar eventos en favoritos',
      'EventModal.join': 'Apuntarse al evento',
      // el resto de claves pueden quedarse como la propia key
    };

    return {
      t: (key) => translations[key] || key,
      i18n: { language: 'es', changeLanguage: () => Promise.resolve() }
    };
  }
}));

import EventModal from './EventModal';
import userService from '../../services/userService';
import * as eventService from '../../services/eventService';

// Mock del userService
jest.mock('../../services/userService', () => ({
  getParticipantsByIds: jest.fn(),
  getUserProfile: jest.fn()
}));

// Mock del eventService para las funciones de favoritos
jest.mock('../../services/eventService', () => ({
  ...jest.requireActual('../../services/eventService'),
  isEventFavorite: jest.fn(),
  addEventToFavorites: jest.fn(),
  removeEventFromFavorites: jest.fn()
}));

describe('EventModal - Funcionalidad de Favoritos', () => {
  const mockEvent = {
    id: '123',
    name: 'Evento de Prueba',
    location: 'Barcelona',
    startDate: '2025-12-01T10:00:00Z',
    description: 'Descripción del evento',
    restrictions: 'Edad mínima: 18 años',
    imageUrl: 'https://example.com/image.jpg',
    capacity: 50,
    participants: [],
    languages: ['es', 'en'],
    tags: ['deporte'],
    isEnrolled: false
  };

  const mockProps = {
    event: mockEvent,
    isOpen: true,
    onClose: jest.fn(),
    isEnrolled: false,
    isFull: false,
    onJoin: jest.fn(),
    onLeave: jest.fn()
  };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();

    // Mock por defecto: usuario autenticado
    localStorage.setItem('userId', '1');

    userService.getParticipantsByIds.mockResolvedValue({
      success: true,
      data: []
    });

    // Mock por defecto: no es favorito
    eventService.isEventFavorite.mockResolvedValue(false);
    eventService.addEventToFavorites.mockResolvedValue({ success: true, data: {} });
    eventService.removeEventFromFavorites.mockResolvedValue({ success: true, data: {} });
  });

  describe('Renderizado del botón de favoritos', () => {
    test('renderiza el botón de favoritos correctamente', async () => {
      render(<EventModal {...mockProps} />);

      await waitFor(() => {
        const favoriteButton = screen.getByRole('button', {
          name: /añadir a favoritos/i
        });
        expect(favoriteButton).toBeInTheDocument();
        expect(favoriteButton).toHaveClass('modal-favorite-btn');
      });
    });

    test('muestra el icono de favorito vacío cuando no está en favoritos', async () => {
      eventService.isEventFavorite.mockResolvedValue(false);

      render(<EventModal {...mockProps} />);

      await waitFor(() => {
        const favoriteButton = screen.getByRole('button', {
          name: /añadir a favoritos/i
        });
        expect(favoriteButton).toHaveAttribute('aria-label', 'Añadir a favoritos');
      });
    });

    test('muestra el icono de favorito lleno cuando está en favoritos', async () => {
      eventService.isEventFavorite.mockResolvedValue(true);

      render(<EventModal {...mockProps} />);

      await waitFor(() => {
        const favoriteButton = screen.getByRole('button', {
          name: /eliminar de favoritos/i
        });
        expect(favoriteButton).toHaveAttribute('aria-label', 'Eliminar de favoritos');
      });
    });
  });

  describe('Añadir a favoritos', () => {
    test('añade un evento a favoritos al hacer clic', async () => {
      eventService.isEventFavorite.mockResolvedValue(false);
      eventService.addEventToFavorites.mockResolvedValue({ success: true, data: {} });

      render(<EventModal {...mockProps} />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /añadir a favoritos/i })
        ).toBeInTheDocument();
      });

      const favoriteButton = screen.getByRole('button', {
        name: /añadir a favoritos/i
      });

      fireEvent.click(favoriteButton);

      await waitFor(() => {
        expect(eventService.addEventToFavorites).toHaveBeenCalledWith('123');
      });
    });

    test('cambia el aria-label después de añadir a favoritos', async () => {
      eventService.isEventFavorite.mockResolvedValue(false);
      eventService.addEventToFavorites.mockResolvedValue({ success: true, data: {} });

      render(<EventModal {...mockProps} />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /añadir a favoritos/i })
        ).toBeInTheDocument();
      });

      const favoriteButton = screen.getByRole('button', {
        name: /añadir a favoritos/i
      });

      fireEvent.click(favoriteButton);

      await waitFor(() => {
        expect(favoriteButton).toHaveAttribute('aria-label', 'Eliminar de favoritos');
      });
    });

    test('maneja error al añadir a favoritos', async () => {
      eventService.isEventFavorite.mockResolvedValue(false);
      eventService.addEventToFavorites.mockResolvedValue({
        success: false,
        error: 'Error al añadir'
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<EventModal {...mockProps} />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /añadir a favoritos/i })
        ).toBeInTheDocument();
      });

      const favoriteButton = screen.getByRole('button', {
        name: /añadir a favoritos/i
      });

      fireEvent.click(favoriteButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error al añadir a favoritos:',
          'Error al añadir'
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Eliminar de favoritos', () => {
    test('elimina un evento de favoritos al hacer clic', async () => {
      eventService.isEventFavorite.mockResolvedValue(true);
      eventService.removeEventFromFavorites.mockResolvedValue({ success: true, data: {} });

      render(<EventModal {...mockProps} />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /eliminar de favoritos/i })
        ).toBeInTheDocument();
      });

      const favoriteButton = screen.getByRole('button', {
        name: /eliminar de favoritos/i
      });

      fireEvent.click(favoriteButton);

      await waitFor(() => {
        expect(eventService.removeEventFromFavorites).toHaveBeenCalledWith('123');
      });
    });

    test('cambia el aria-label después de eliminar de favoritos', async () => {
      eventService.isEventFavorite.mockResolvedValue(true);
      eventService.removeEventFromFavorites.mockResolvedValue({ success: true, data: {} });

      render(<EventModal {...mockProps} />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /eliminar de favoritos/i })
        ).toBeInTheDocument();
      });

      const favoriteButton = screen.getByRole('button', {
        name: /eliminar de favoritos/i
      });

      fireEvent.click(favoriteButton);

      await waitFor(() => {
        expect(favoriteButton).toHaveAttribute('aria-label', 'Añadir a favoritos');
      });
    });

    test('maneja error al eliminar de favoritos', async () => {
      eventService.isEventFavorite.mockResolvedValue(true);
      eventService.removeEventFromFavorites.mockResolvedValue({
        success: false,
        error: 'Error al eliminar'
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<EventModal {...mockProps} />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /eliminar de favoritos/i })
        ).toBeInTheDocument();
      });

      const favoriteButton = screen.getByRole('button', {
        name: /eliminar de favoritos/i
      });

      fireEvent.click(favoriteButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error al eliminar de favoritos:',
          'Error al eliminar'
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Usuario no autenticado', () => {
    beforeEach(() => {
      localStorage.removeItem('userId');
    });

    test('muestra mensaje cuando usuario no autenticado intenta añadir favorito', async () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(<EventModal {...mockProps} />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /añadir a favoritos/i })
        ).toBeInTheDocument();
      });

      const favoriteButton = screen.getByRole('button', {
        name: /añadir a favoritos/i
      });

      fireEvent.click(favoriteButton);

      expect(alertMock).toHaveBeenCalledWith(
        'Debes iniciar sesión para guardar eventos en favoritos'
      );

      alertMock.mockRestore();
    });

    test('no llama a la API cuando usuario no está autenticado', async () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(<EventModal {...mockProps} />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /añadir a favoritos/i })
        ).toBeInTheDocument();
      });

      const favoriteButton = screen.getByRole('button', {
        name: /añadir a favoritos/i
      });

      fireEvent.click(favoriteButton);

      expect(eventService.addEventToFavorites).not.toHaveBeenCalled();

      alertMock.mockRestore();
    });

    test('muestra título informativo para usuarios no autenticados', async () => {
      render(<EventModal {...mockProps} />);

      await waitFor(() => {
        const favoriteButton = screen.getByRole('button', {
          name: /añadir a favoritos/i
        });
        expect(favoriteButton).toHaveAttribute(
          'title',
          'Inicia sesión para guardar favoritos'
        );
      });
    });
  });

  describe('Estado de carga', () => {
    test('deshabilita el botón mientras se procesa la solicitud', async () => {
      eventService.isEventFavorite.mockResolvedValue(false);

      // Simular una respuesta lenta
      eventService.addEventToFavorites.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      render(<EventModal {...mockProps} />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /añadir a favoritos/i })
        ).toBeInTheDocument();
      });

      const favoriteButton = screen.getByRole('button', {
        name: /añadir a favoritos/i
      });

      fireEvent.click(favoriteButton);

      // El botón debe estar deshabilitado durante la carga
      await waitFor(() => {
        expect(favoriteButton).toBeDisabled();
      });
    });
  });

  describe('Manejo de edge cases', () => {
    test('no hace nada si el evento no tiene id', async () => {
      const eventWithoutId = { ...mockEvent, id: null };

      render(<EventModal {...mockProps} event={eventWithoutId} />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /añadir a favoritos/i })
        ).toBeInTheDocument();
      });

      const favoriteButton = screen.getByRole('button', {
        name: /añadir a favoritos/i
      });

      fireEvent.click(favoriteButton);

      expect(eventService.addEventToFavorites).not.toHaveBeenCalled();
    });

    test('convierte el id a string para comparación', async () => {
      const eventWithNumericId = { ...mockEvent, id: 123 };
      eventService.isEventFavorite.mockResolvedValue(true);

      render(<EventModal {...mockProps} event={eventWithNumericId} />);

      await waitFor(() => {
        const favoriteButton = screen.getByRole('button', {
          name: /eliminar de favoritos/i
        });
        expect(favoriteButton).toBeInTheDocument();
      });
    });
  });

  describe('Accesibilidad', () => {
    test('el botón tiene el atributo aria-label correcto', async () => {
      render(<EventModal {...mockProps} />);

      await waitFor(() => {
        const favoriteButton = screen.getByRole('button', {
          name: /añadir a favoritos/i
        });
        expect(favoriteButton).toHaveAttribute('aria-label');
      });
    });

    test('el botón es accesible mediante teclado', async () => {
      render(<EventModal {...mockProps} />);

      await waitFor(() => {
        const favoriteButton = screen.getByRole('button', {
          name: /añadir a favoritos/i
        });
        favoriteButton.focus();
        expect(document.activeElement).toBe(favoriteButton);
      });
    });

    test('el título del botón proporciona información adicional para usuarios autenticados', async () => {
      render(<EventModal {...mockProps} />);

      await waitFor(() => {
        const favoriteButton = screen.getByRole('button', {
          name: /añadir a favoritos/i
        });
        expect(favoriteButton).toHaveAttribute('title', 'Añadir a favoritos');
      });
    });
  });

  describe('Integración con el resto del modal', () => {
    test('la funcionalidad de favoritos no interfiere con otras funciones del modal', async () => {
      const mockOnClose = jest.fn();
      eventService.addEventToFavorites.mockResolvedValue({ success: true, data: {} });

      render(<EventModal {...mockProps} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /añadir a favoritos/i })
        ).toBeInTheDocument();
      });

      const favoriteButton = screen.getByRole('button', {
        name: /añadir a favoritos/i
      });
      fireEvent.click(favoriteButton);

      const closeButton = screen.getByRole('button', { name: '✕' });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('el botón de favoritos no interfiere con los botones de inscripción', async () => {
      const mockOnJoin = jest.fn();
      eventService.addEventToFavorites.mockResolvedValue({ success: true, data: {} });

      render(<EventModal {...mockProps} onJoin={mockOnJoin} />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /añadir a favoritos/i })
        ).toBeInTheDocument();
      });

      const favoriteButton = screen.getByRole('button', {
        name: /añadir a favoritos/i
      });
      fireEvent.click(favoriteButton);

      const joinButton = screen.getByRole('button', {
        name: /apuntarse al evento/i
      });
      fireEvent.click(joinButton);

      expect(mockOnJoin).toHaveBeenCalledTimes(1);
    });
  });

  describe('Notificación de actualización de favoritos', () => {
    test('dispara evento favoritesUpdated al añadir a favoritos', async () => {
      eventService.isEventFavorite.mockResolvedValue(false);
      eventService.addEventToFavorites.mockResolvedValue({ success: true, data: {} });

      const eventListener = jest.fn();
      window.addEventListener('favoritesUpdated', eventListener);

      render(<EventModal {...mockProps} />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /añadir a favoritos/i })
        ).toBeInTheDocument();
      });

      const favoriteButton = screen.getByRole('button', {
        name: /añadir a favoritos/i
      });

      fireEvent.click(favoriteButton);

      await waitFor(() => {
        expect(eventListener).toHaveBeenCalled();
      });

      window.removeEventListener('favoritesUpdated', eventListener);
    });

    test('dispara evento favoritesUpdated al eliminar de favoritos', async () => {
      eventService.isEventFavorite.mockResolvedValue(true);
      eventService.removeEventFromFavorites.mockResolvedValue({ success: true, data: {} });

      const eventListener = jest.fn();
      window.addEventListener('favoritesUpdated', eventListener);

      render(<EventModal {...mockProps} />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /eliminar de favoritos/i })
        ).toBeInTheDocument();
      });

      const favoriteButton = screen.getByRole('button', {
        name: /eliminar de favoritos/i
      });

      fireEvent.click(favoriteButton);

      await waitFor(() => {
        expect(eventListener).toHaveBeenCalled();
      });

      window.removeEventListener('favoritesUpdated', eventListener);
    });
  });
});
