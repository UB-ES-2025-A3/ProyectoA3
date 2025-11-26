import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import EventModal from './EventModal';

// Mock del userService
const mockGetParticipantsByIds = jest.fn();
const mockGetUserProfile = jest.fn();

jest.mock('../../services/userService', () => ({
  default: {
    getParticipantsByIds: (...args) => mockGetParticipantsByIds(...args),
    getUserProfile: (...args) => mockGetUserProfile(...args)
  },
  __esModule: true
}));

describe('EventModal - Funcionalidad Básica', () => {
  const mockOnClose = jest.fn();
  const mockOnJoin = jest.fn();
  const mockOnLeave = jest.fn();

  const mockEvent = {
    id: '1',
    name: 'Concierto de Rock',
    location: 'Barcelona',
    startDate: '2025-12-31T20:00:00Z',
    description: 'Un evento increíble',
    restrictions: 'Edad mínima: 18 años',
    imageUrl: 'https://example.com/image.jpg',
    capacity: 10,
    participants: [1, 2, 3],
    languages: ['es', 'en'],
    tags: ['música', 'concierto'],
    creatorId: 1
  };

  const mockParticipants = [
    {
      id: 1,
      nombre: 'María',
      apellidos: 'García',
      username: 'maria',
      ciudad: 'Barcelona',
      idiomas: ['es', 'en']
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockGetParticipantsByIds.mockResolvedValue({
      success: true,
      data: mockParticipants
    });

    mockGetUserProfile.mockResolvedValue({
      success: true,
      data: mockParticipants[0]
    });
  });

  test('debe renderizar el modal cuando isOpen es true', () => {
    render(
      <EventModal
        event={mockEvent}
        isOpen={true}
        onClose={mockOnClose}
        isEnrolled={false}
        isFull={false}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
      />
    );

    expect(screen.getByText('Concierto de Rock')).toBeInTheDocument();
  });

  test('no debe renderizar el modal cuando isOpen es false', () => {
    const { container } = render(
      <EventModal
        event={mockEvent}
        isOpen={false}
        onClose={mockOnClose}
        isEnrolled={false}
        isFull={false}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  test('debe llamar a getParticipantsByIds cuando hay participantes', async () => {
    render(
      <EventModal
        event={mockEvent}
        isOpen={true}
        onClose={mockOnClose}
        isEnrolled={false}
        isFull={false}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
      />
    );

    await waitFor(() => {
      expect(mockGetParticipantsByIds).toHaveBeenCalledWith([1, 2, 3]);
    });
  });

  test('debe mostrar el título de participantes inscritos', async () => {
    render(
      <EventModal
        event={mockEvent}
        isOpen={true}
        onClose={mockOnClose}
        isEnrolled={false}
        isFull={false}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Participantes Inscritos/i)).toBeInTheDocument();
    });
  });

  test('debe cerrar el modal al hacer clic en el botón de cerrar', () => {
    render(
      <EventModal
        event={mockEvent}
        isOpen={true}
        onClose={mockOnClose}
        isEnrolled={false}
        isFull={false}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
      />
    );

    const closeButton = screen.getByRole('button', { name: /✕/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('no debe mostrar sección de participantes si no hay participantes', () => {
    const eventSinParticipantes = {
      ...mockEvent,
      participants: []
    };

    render(
      <EventModal
        event={eventSinParticipantes}
        isOpen={true}
        onClose={mockOnClose}
        isEnrolled={false}
        isFull={false}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
      />
    );

    expect(screen.queryByText(/Participantes Inscritos/i)).not.toBeInTheDocument();
  });

  test('debe manejar error al cargar participantes', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mockGetParticipantsByIds.mockResolvedValue({
      success: false,
      error: 'Error del servidor'
    });

    render(
      <EventModal
        event={mockEvent}
        isOpen={true}
        onClose={mockOnClose}
        isEnrolled={false}
        isFull={false}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/No se pudo cargar la información de los participantes/i)).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  test('debe mostrar botón de apuntarse cuando no está inscrito', () => {
    render(
      <EventModal
        event={mockEvent}
        isOpen={true}
        onClose={mockOnClose}
        isEnrolled={false}
        isFull={false}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
      />
    );

    expect(screen.getByText(/Apuntarse al Evento/i)).toBeInTheDocument();
  });

  test('debe mostrar botón de desapuntarse cuando está inscrito', () => {
    render(
      <EventModal
        event={mockEvent}
        isOpen={true}
        onClose={mockOnClose}
        isEnrolled={true}
        isFull={false}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
      />
    );

    expect(screen.getByText(/Desapuntarse del Evento/i)).toBeInTheDocument();
  });
});
