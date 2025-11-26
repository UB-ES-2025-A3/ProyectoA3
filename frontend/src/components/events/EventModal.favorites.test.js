import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EventModal from './EventModal';
import userService from '../../services/userService';

jest.mock('../../services/userService', () => ({
  getParticipantsByIds: jest.fn(),
  getUserProfile: jest.fn(),
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
    isEnrolled: false,
  };

  const mockProps = {
    event: mockEvent,
    isOpen: true,
    onClose: jest.fn(),
    isEnrolled: false,
    isFull: false,
    onJoin: jest.fn(),
    onLeave: jest.fn(),
  };

  beforeEach(() => {
    localStorage.clear();
    
    jest.clearAllMocks();
    
    userService.getParticipantsByIds.mockResolvedValue({
      success: true,
      data: [],
    });
  });

  describe('Renderizado del botón de favoritos', () => {
    test('renderiza el botón de favoritos correctamente', () => {
      render(<EventModal {...mockProps} />);

      const favoriteButton = screen.getByRole('button', {
        name: /añadir a favoritos/i,
      });

      expect(favoriteButton).toBeInTheDocument();
      expect(favoriteButton).toHaveClass('modal-favorite-btn');
    });

    test('muestra el icono de favorito vacío cuando no está en favoritos', () => {
      render(<EventModal {...mockProps} />);

      const favoriteButton = screen.getByRole('button', {
        name: /añadir a favoritos/i,
      });

      expect(favoriteButton).toHaveAttribute(
        'aria-label',
        'Añadir a favoritos'
      );
    });

    test('muestra el icono de favorito lleno cuando está en favoritos', () => {
      localStorage.setItem('favoriteEvents', JSON.stringify(['123']));

      render(<EventModal {...mockProps} />);

      const favoriteButton = screen.getByRole('button', {
        name: /eliminar de favoritos/i,
      });

      expect(favoriteButton).toHaveAttribute(
        'aria-label',
        'Eliminar de favoritos'
      );
    });
  });

  describe('Añadir a favoritos', () => {
    test('añade un evento a favoritos al hacer clic', () => {
      render(<EventModal {...mockProps} />);

      const favoriteButton = screen.getByRole('button', {
        name: /añadir a favoritos/i,
      });

      fireEvent.click(favoriteButton);

      const favorites = JSON.parse(localStorage.getItem('favoriteEvents'));
      expect(favorites).toContain('123');
      expect(favorites).toHaveLength(1);
    });

    test('cambia el aria-label después de añadir a favoritos', () => {
      render(<EventModal {...mockProps} />);

      const favoriteButton = screen.getByRole('button', {
        name: /añadir a favoritos/i,
      });

      fireEvent.click(favoriteButton);

      expect(favoriteButton).toHaveAttribute(
        'aria-label',
        'Eliminar de favoritos'
      );
    });

    test('añade múltiples eventos a favoritos', () => {
      const { rerender } = render(<EventModal {...mockProps} />);

      const favoriteButton1 = screen.getByRole('button', {
        name: /añadir a favoritos/i,
      });
      fireEvent.click(favoriteButton1);

      const event2 = { ...mockEvent, id: '456', name: 'Evento 2' };
      rerender(<EventModal {...mockProps} event={event2} />);

      const favoriteButton2 = screen.getByRole('button', {
        name: /añadir a favoritos/i,
      });
      fireEvent.click(favoriteButton2);

      const favorites = JSON.parse(localStorage.getItem('favoriteEvents'));
      expect(favorites).toContain('123');
      expect(favorites).toContain('456');
      expect(favorites).toHaveLength(2);
    });

    test('no añade eventos duplicados a favoritos', () => {
      localStorage.setItem('favoriteEvents', JSON.stringify(['123']));

      render(<EventModal {...mockProps} />);

      const favoriteButton = screen.getByRole('button', {
        name: /eliminar de favoritos/i,
      });

      fireEvent.click(favoriteButton);

      const favorites = JSON.parse(localStorage.getItem('favoriteEvents'));
      expect(favorites).not.toContain('123');
    });
  });

  describe('Eliminar de favoritos', () => {
    test('elimina un evento de favoritos al hacer clic', () => {
      localStorage.setItem('favoriteEvents', JSON.stringify(['123']));

      render(<EventModal {...mockProps} />);

      const favoriteButton = screen.getByRole('button', {
        name: /eliminar de favoritos/i,
      });

      fireEvent.click(favoriteButton);

      const favorites = JSON.parse(localStorage.getItem('favoriteEvents'));
      expect(favorites).not.toContain('123');
      expect(favorites).toHaveLength(0);
    });

    test('cambia el aria-label después de eliminar de favoritos', () => {
      localStorage.setItem('favoriteEvents', JSON.stringify(['123']));

      render(<EventModal {...mockProps} />);

      const favoriteButton = screen.getByRole('button', {
        name: /eliminar de favoritos/i,
      });

      fireEvent.click(favoriteButton);

      expect(favoriteButton).toHaveAttribute(
        'aria-label',
        'Añadir a favoritos'
      );
    });

    test('solo elimina el evento específico, no otros favoritos', () => {
      localStorage.setItem('favoriteEvents', JSON.stringify(['123', '456', '789']));

      render(<EventModal {...mockProps} />);

      const favoriteButton = screen.getByRole('button', {
        name: /eliminar de favoritos/i,
      });

      fireEvent.click(favoriteButton);

      const favorites = JSON.parse(localStorage.getItem('favoriteEvents'));
      expect(favorites).not.toContain('123');
      expect(favorites).toContain('456');
      expect(favorites).toContain('789');
      expect(favorites).toHaveLength(2);
    });
  });

  describe('Toggle de favoritos', () => {
    test('alterna entre añadir y eliminar de favoritos', () => {
      render(<EventModal {...mockProps} />);

      const favoriteButton = screen.getByRole('button', {
        name: /añadir a favoritos/i,
      });

      fireEvent.click(favoriteButton);
      let favorites = JSON.parse(localStorage.getItem('favoriteEvents'));
      expect(favorites).toContain('123');

      fireEvent.click(favoriteButton);
      favorites = JSON.parse(localStorage.getItem('favoriteEvents'));
      expect(favorites).not.toContain('123');

      fireEvent.click(favoriteButton);
      favorites = JSON.parse(localStorage.getItem('favoriteEvents'));
      expect(favorites).toContain('123');
    });

    test('múltiples clics alternan correctamente el estado', () => {
      render(<EventModal {...mockProps} />);

      const favoriteButton = screen.getByRole('button', {
        name: /añadir a favoritos/i,
      });

      for (let i = 0; i < 5; i++) {
        fireEvent.click(favoriteButton);
      }

      const favorites = JSON.parse(localStorage.getItem('favoriteEvents'));
      expect(favorites).toContain('123');
    });
  });

  describe('Persistencia y estado inicial', () => {
    test('carga el estado inicial desde localStorage', () => {
      localStorage.setItem('favoriteEvents', JSON.stringify(['123', '456']));

      render(<EventModal {...mockProps} />);

      const favoriteButton = screen.getByRole('button', {
        name: /eliminar de favoritos/i,
      });

      expect(favoriteButton).toBeInTheDocument();
    });

    test('inicializa correctamente cuando localStorage está vacío', () => {
      render(<EventModal {...mockProps} />);

      const favoriteButton = screen.getByRole('button', {
        name: /añadir a favoritos/i,
      });

      expect(favoriteButton).toBeInTheDocument();
    });

    test('mantiene el estado al cerrar y reabrir el modal', () => {
      const { rerender } = render(<EventModal {...mockProps} />);

      const favoriteButton = screen.getByRole('button', {
        name: /añadir a favoritos/i,
      });
      fireEvent.click(favoriteButton);

      rerender(<EventModal {...mockProps} isOpen={false} />);

      rerender(<EventModal {...mockProps} isOpen={true} />);

      const favoriteButtonAfterReopen = screen.getByRole('button', {
        name: /eliminar de favoritos/i,
      });

      expect(favoriteButtonAfterReopen).toBeInTheDocument();
    });

    test('actualiza el estado al cambiar de evento', () => {
      const { rerender } = render(<EventModal {...mockProps} />);

      const favoriteButton1 = screen.getByRole('button', {
        name: /añadir a favoritos/i,
      });
      fireEvent.click(favoriteButton1);

      const event2 = { ...mockEvent, id: '456', name: 'Evento 2' };
      rerender(<EventModal {...mockProps} event={event2} />);

      const favoriteButton2 = screen.getByRole('button', {
        name: /añadir a favoritos/i,
      });

      expect(favoriteButton2).toBeInTheDocument();
    });
  });

  describe('Manejo de edge cases', () => {
    test('no hace nada si el evento no tiene id', () => {
      const eventWithoutId = { ...mockEvent, id: null };

      render(<EventModal {...mockProps} event={eventWithoutId} />);

      const favoriteButton = screen.getByRole('button', {
        name: /añadir a favoritos/i,
      });

      fireEvent.click(favoriteButton);

      const favorites = JSON.parse(
        localStorage.getItem('favoriteEvents') || '[]'
      );
      expect(favorites).toHaveLength(0);
    });

    test('maneja correctamente localStorage corrupto', () => {
      localStorage.setItem('favoriteEvents', 'invalid-json');

      // El componente debe renderizar sin crashear y resetear localStorage
      render(<EventModal {...mockProps} />);

      // Verificar que localStorage se reseteó a un array vacío
      const favorites = JSON.parse(localStorage.getItem('favoriteEvents'));
      expect(favorites).toEqual([]);
      
      // Verificar que el botón de favoritos se renderiza correctamente
      const favoriteButton = screen.getByRole('button', {
        name: /añadir a favoritos/i,
      });
      expect(favoriteButton).toBeInTheDocument();
      
      localStorage.clear();
    });

    test('convierte el id a string para comparación', () => {
      const eventWithNumericId = { ...mockEvent, id: 123 };
      localStorage.setItem('favoriteEvents', JSON.stringify(['123']));

      render(<EventModal {...mockProps} event={eventWithNumericId} />);

      const favoriteButton = screen.getByRole('button', {
        name: /eliminar de favoritos/i,
      });

      expect(favoriteButton).toBeInTheDocument();
    });

    test('maneja ids como strings y números de forma consistente', () => {
      const { rerender } = render(<EventModal {...mockProps} />);

      const favoriteButton1 = screen.getByRole('button', {
        name: /añadir a favoritos/i,
      });
      fireEvent.click(favoriteButton1);

      const eventWithNumericId = { ...mockEvent, id: 123 };
      rerender(<EventModal {...mockProps} event={eventWithNumericId} />);

      const favorites = JSON.parse(localStorage.getItem('favoriteEvents'));
      expect(favorites).toContain('123');
    });
  });

  describe('Accesibilidad', () => {
    test('el botón tiene el atributo aria-label correcto', () => {
      render(<EventModal {...mockProps} />);

      const favoriteButton = screen.getByRole('button', {
        name: /añadir a favoritos/i,
      });

      expect(favoriteButton).toHaveAttribute('aria-label');
    });

    test('el botón es accesible mediante teclado', () => {
      render(<EventModal {...mockProps} />);

      const favoriteButton = screen.getByRole('button', {
        name: /añadir a favoritos/i,
      });

      favoriteButton.focus();
      expect(document.activeElement).toBe(favoriteButton);
    });

    test('el título del botón proporciona información adicional', () => {
      render(<EventModal {...mockProps} />);

      const favoriteButton = screen.getByRole('button', {
        name: /añadir a favoritos/i,
      });

      expect(favoriteButton).toHaveAttribute('title', 'Añadir a favoritos');
    });
  });

  describe('Integración con el resto del modal', () => {
    test('la funcionalidad de favoritos no interfiere con otras funciones del modal', () => {
      const mockOnClose = jest.fn();

      render(<EventModal {...mockProps} onClose={mockOnClose} />);

      const favoriteButton = screen.getByRole('button', {
        name: /añadir a favoritos/i,
      });
      fireEvent.click(favoriteButton);

      const closeButton = screen.getByRole('button', { name: '✕' });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('el botón de favoritos no interfiere con los botones de inscripción', () => {
      const mockOnJoin = jest.fn();

      render(<EventModal {...mockProps} onJoin={mockOnJoin} />);

      const favoriteButton = screen.getByRole('button', {
        name: /añadir a favoritos/i,
      });
      fireEvent.click(favoriteButton);

      const joinButton = screen.getByRole('button', {
        name: /apuntarse al evento/i,
      });
      fireEvent.click(joinButton);

      expect(mockOnJoin).toHaveBeenCalledTimes(1);
    });
  });
});
