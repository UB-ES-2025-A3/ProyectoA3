import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import EventCard from '../EventCard';

// 🔹 Mock react-i18next alineado con EventCard
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, opts) => {
      switch (key) {
        // Estado / plazas
        case 'EventCard.status.full':
          return 'Completo';
        case 'EventCard.status.spotsAvailable': {
          const count = opts?.count ?? 0;
          return `${count} plazas libres`;
        }

        // Capacidad
        case 'EventCard.capacity.label':
          return 'participantes';

        // Botones
        case 'EventCard.buttons.join':
          return 'Apuntarse';
        case 'EventCard.buttons.joining':
          return 'Apuntando...';
        case 'EventCard.buttons.leave':
          return 'Desapuntarse';

        // Mensaje de inscrito
        case 'EventCard.enrolled.already':
          return 'Ya estás apuntado a este evento';

        // Fecha
        case 'EventModal.dateFallback':
          return 'Fecha no disponible';
        case 'EventCard.date':
          // Solo devolvemos el texto que se nos pasa
          return opts?.date ?? '';

        // Localización
        case 'EventCard.location':
          return opts?.location ?? '';

        default:
          return key;
      }
    },
    i18n: { language: 'es', changeLanguage: () => Promise.resolve() }
  })
}));

describe('EventCard', () => {
  const mockEvent = {
    id: '1',
    name: 'Evento de Prueba',
    location: 'Barcelona',
    startDate: '2024-12-25T10:00:00Z',
    imageUrl: 'https://example.com/image.jpg',
    capacity: 50,
    participants: ['1', '2', '3']
  };

  const mockOnJoin = jest.fn();
  const mockOnLeave = jest.fn();
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderizado', () => {
    test('debe renderizar la información básica del evento', () => {
      render(
        <EventCard
          event={mockEvent}
          isEnrolled={false}
          isFull={false}
          onJoin={mockOnJoin}
          onLeave={mockOnLeave}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText('Evento de Prueba')).toBeInTheDocument();
      expect(screen.getByText(/barcelona/i)).toBeInTheDocument();
      expect(screen.getByText(/3\/50/i)).toBeInTheDocument();
      expect(screen.getByText(/participantes/i)).toBeInTheDocument();
    });

    test('debe mostrar la imagen del evento', () => {
      render(
        <EventCard
          event={mockEvent}
          isEnrolled={false}
          isFull={false}
          onJoin={mockOnJoin}
          onLeave={mockOnLeave}
          onClick={mockOnClick}
        />
      );

      const image = screen.getByAltText('Evento de Prueba');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    test('debe mostrar plazas disponibles cuando no está completo', () => {
      render(
        <EventCard
          event={mockEvent}
          isEnrolled={false}
          isFull={false}
          onJoin={mockOnJoin}
          onLeave={mockOnLeave}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText(/47 plazas libres/i)).toBeInTheDocument();
    });

    test('debe mostrar estado "Completo" cuando isFull es true', () => {
      render(
        <EventCard
          event={mockEvent}
          isEnrolled={false}
          isFull={true}
          onJoin={mockOnJoin}
          onLeave={mockOnLeave}
          onClick={mockOnClick}
        />
      );

      const completoElements = screen.getAllByText(/completo/i);
      expect(completoElements.length).toBe(2); // badge + botón

      const badge = completoElements.find(el =>
        el.classList.contains('status-badge')
      );
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Interacciones', () => {
    test('debe llamar onClick cuando se hace click en la tarjeta', async () => {
      render(
        <EventCard
          event={mockEvent}
          isEnrolled={false}
          isFull={false}
          onJoin={mockOnJoin}
          onLeave={mockOnLeave}
          onClick={mockOnClick}
        />
      );

      const card = screen.getByRole('article');
      await userEvent.click(card);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    test('debe mostrar botón "Apuntarse" cuando no está inscrito', () => {
      render(
        <EventCard
          event={mockEvent}
          isEnrolled={false}
          isFull={false}
          onJoin={mockOnJoin}
          onLeave={mockOnLeave}
          onClick={mockOnClick}
        />
      );

      expect(
        screen.getByRole('button', { name: /apuntarse/i })
      ).toBeInTheDocument();
    });

    test('debe llamar onJoin cuando se hace click en "Apuntarse"', async () => {
      render(
        <EventCard
          event={mockEvent}
          isEnrolled={false}
          isFull={false}
          onJoin={mockOnJoin}
          onLeave={mockOnLeave}
          onClick={mockOnClick}
        />
      );

      const joinButton = screen.getByRole('button', { name: /apuntarse/i });
      await userEvent.click(joinButton);

      expect(mockOnJoin).toHaveBeenCalledTimes(1);
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    test('debe mostrar mensaje y botón "Desapuntarse" cuando está inscrito', () => {
      render(
        <EventCard
          event={mockEvent}
          isEnrolled={true}
          isFull={false}
          onJoin={mockOnJoin}
          onLeave={mockOnLeave}
          onClick={mockOnClick}
        />
      );

      expect(
        screen.getByText(/ya estás apuntado a este evento/i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /desapuntarse/i })
      ).toBeInTheDocument();

      const apuntarseButton = screen.queryByRole('button', {
        name: /^apuntarse$/i
      });
      expect(apuntarseButton).not.toBeInTheDocument();
    });

    test('debe llamar onLeave cuando se hace click en "Desapuntarse"', async () => {
      render(
        <EventCard
          event={mockEvent}
          isEnrolled={true}
          isFull={false}
          onJoin={mockOnJoin}
          onLeave={mockOnLeave}
          onClick={mockOnClick}
        />
      );

      const leaveButton = screen.getByRole('button', { name: /desapuntarse/i });
      await userEvent.click(leaveButton);

      expect(mockOnLeave).toHaveBeenCalledTimes(1);
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    test('debe deshabilitar botón cuando isJoining es true', () => {
      render(
        <EventCard
          event={mockEvent}
          isEnrolled={false}
          isFull={false}
          isJoining={true}
          onJoin={mockOnJoin}
          onLeave={mockOnLeave}
          onClick={mockOnClick}
        />
      );

      const button = screen.getByRole('button', { name: /apuntando/i });
      expect(button).toBeDisabled();
    });

    test('debe deshabilitar botón cuando el evento está completo', () => {
      render(
        <EventCard
          event={mockEvent}
          isEnrolled={false}
          isFull={true}
          onJoin={mockOnJoin}
          onLeave={mockOnLeave}
          onClick={mockOnClick}
        />
      );

      const button = screen.getByRole('button', { name: /completo/i });
      expect(button).toBeDisabled();
    });
  });

  describe('Manejo de datos faltantes', () => {
    test('debe manejar evento sin fecha', () => {
      const eventWithoutDate = { ...mockEvent, startDate: null };

      render(
        <EventCard
          event={eventWithoutDate}
          isEnrolled={false}
          isFull={false}
          onJoin={mockOnJoin}
          onLeave={mockOnLeave}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText(/fecha no disponible/i)).toBeInTheDocument();
    });

    test('debe manejar evento sin participantes', () => {
      const eventWithoutParticipants = { ...mockEvent, participants: null };

      render(
        <EventCard
          event={eventWithoutParticipants}
          isEnrolled={false}
          isFull={false}
          onJoin={mockOnJoin}
          onLeave={mockOnLeave}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText(/0\/50/i)).toBeInTheDocument();
    });
  });
});
