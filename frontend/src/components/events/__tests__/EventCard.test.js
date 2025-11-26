import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventCard from '../EventCard';

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

      // Hay dos elementos con "Completo": el badge y el botón
      // Verificar que existe el badge de estado usando getAllByText
      const completoElements = screen.getAllByText(/completo/i);
      expect(completoElements.length).toBe(2); // Badge y botón
      // Verificar que el badge tiene la clase correcta
      const badge = completoElements.find(el => el.classList.contains('status-badge'));
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

      expect(screen.getByRole('button', { name: /apuntarse/i })).toBeInTheDocument();
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
      expect(mockOnClick).not.toHaveBeenCalled(); // No debe propagar el click
    });

    test('debe mostrar mensaje y botón "Desapuntarse" cuando está inscrito', () => {
      const { container } = render(
        <EventCard
          event={mockEvent}
          isEnrolled={true}
          isFull={false}
          onJoin={mockOnJoin}
          onLeave={mockOnLeave}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText(/ya estás apuntado a este evento/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /desapuntarse/i })).toBeInTheDocument();
      
      // Verificar que NO hay botón "Apuntarse" - buscar por texto exacto
      const apuntarseButton = screen.queryByRole('button', { name: /^apuntarse$/i });
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
      expect(mockOnClick).not.toHaveBeenCalled(); // No debe propagar el click
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

