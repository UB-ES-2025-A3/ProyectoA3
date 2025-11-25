import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateEventForm from '../CreateEventForm';
import * as eventService from '../../../services/eventService';

// Mock del servicio de eventos
jest.mock('../../../services/eventService');

describe('CreateEventForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('userId', '1');
    localStorage.setItem('token', 'test-token');
  });

  describe('Renderizado', () => {
    test('debe renderizar el formulario cuando isOpen es true', () => {
      render(
        <CreateEventForm
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByLabelText(/título del evento \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/fecha \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/hora \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/lugar \*/i)).toBeInTheDocument();
    });

    test('no debe renderizar cuando isOpen es false', () => {
      const { container } = render(
        <CreateEventForm
          isOpen={false}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    test('debe mostrar todos los campos del formulario', () => {
      render(
        <CreateEventForm
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByLabelText(/título del evento \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/etiquetas/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/fecha \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/hora \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/idioma \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/plazas disponibles \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/lugar \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
    });
  });

  describe('Validación', () => {
    test('debe mostrar error cuando el título está vacío', async () => {
      render(
        <CreateEventForm
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const submitButton = screen.getByRole('button', { name: /crear evento/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/el título del evento es requerido/i)).toBeInTheDocument();
      });
    });

    test('debe mostrar error cuando la fecha está vacía', async () => {
      render(
        <CreateEventForm
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      await userEvent.type(screen.getByLabelText(/título del evento \*/i), 'Test Event');
      const submitButton = screen.getByRole('button', { name: /crear evento/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/la fecha es requerida/i)).toBeInTheDocument();
      });
    });

    test('debe mostrar error cuando la fecha es anterior a hoy', async () => {
      render(
        <CreateEventForm
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      await userEvent.type(screen.getByLabelText(/título del evento \*/i), 'Test Event');
      await userEvent.type(screen.getByLabelText(/fecha \*/i), yesterdayStr);
      
      const submitButton = screen.getByRole('button', { name: /crear evento/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/la fecha no puede ser anterior a hoy/i)).toBeInTheDocument();
      });
    });

    test('debe limpiar errores cuando el usuario empieza a escribir', async () => {
      render(
        <CreateEventForm
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const submitButton = screen.getByRole('button', { name: /crear evento/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/el título del evento es requerido/i)).toBeInTheDocument();
      });

      const tituloInput = screen.getByLabelText(/título del evento \*/i);
      await userEvent.type(tituloInput, 'Test');

      await waitFor(() => {
        expect(screen.queryByText(/el título del evento es requerido/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Envío del formulario', () => {
    test('debe llamar a createEvent con los datos correctos', async () => {
      eventService.createEvent.mockResolvedValue({ id: 1, titulo: 'Test Event' });

      render(
        <CreateEventForm
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      await userEvent.type(screen.getByLabelText(/título del evento \*/i), 'Test Event');
      await userEvent.selectOptions(screen.getByLabelText(/etiquetas/i), 'turismo');
      await userEvent.type(screen.getByLabelText(/fecha \*/i), tomorrowStr);
      await userEvent.type(screen.getByLabelText(/hora \*/i), '10:00');
      await userEvent.selectOptions(screen.getByLabelText(/idioma \*/i), 'es');
      await userEvent.type(screen.getByLabelText(/plazas disponibles \*/i), '50');
      await userEvent.type(screen.getByLabelText(/lugar \*/i), 'Barcelona');
      await userEvent.type(screen.getByLabelText(/descripción/i), 'Test description');

      const submitButton = screen.getByRole('button', { name: /crear evento/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(eventService.createEvent).toHaveBeenCalledWith({
          titulo: 'Test Event',
          descripcion: 'Test description',
          etiquetas: 'turismo',
          fecha: tomorrowStr,
          hora: '10:00',
          lugar: 'Barcelona',
          restricciones: {
            idiomaRequerido: 'es',
            plazasDisponibles: 50
          }
        });
      });
    });

    test('debe llamar a onSuccess cuando el evento se crea exitosamente', async () => {
      eventService.createEvent.mockResolvedValue({ id: 1, titulo: 'Test Event' });

      render(
        <CreateEventForm
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      await userEvent.type(screen.getByLabelText(/título del evento \*/i), 'Test Event');
      await userEvent.type(screen.getByLabelText(/fecha \*/i), tomorrowStr);
      await userEvent.type(screen.getByLabelText(/hora \*/i), '10:00');
      await userEvent.selectOptions(screen.getByLabelText(/idioma \*/i), 'es');
      await userEvent.type(screen.getByLabelText(/plazas disponibles \*/i), '50');
      await userEvent.type(screen.getByLabelText(/lugar \*/i), 'Barcelona');

      const submitButton = screen.getByRole('button', { name: /crear evento/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    test('debe mostrar error cuando falla la creación del evento', async () => {
      eventService.createEvent.mockRejectedValue(new Error('Error al crear el evento'));

      render(
        <CreateEventForm
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      await userEvent.type(screen.getByLabelText(/título del evento \*/i), 'Test Event');
      await userEvent.type(screen.getByLabelText(/fecha \*/i), tomorrowStr);
      await userEvent.type(screen.getByLabelText(/hora \*/i), '10:00');
      await userEvent.selectOptions(screen.getByLabelText(/idioma \*/i), 'es');
      await userEvent.type(screen.getByLabelText(/plazas disponibles \*/i), '50');
      await userEvent.type(screen.getByLabelText(/lugar \*/i), 'Barcelona');

      const submitButton = screen.getByRole('button', { name: /crear evento/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/error al crear el evento/i)).toBeInTheDocument();
      });
    });

    test('debe mostrar estado de carga durante la creación', async () => {
      eventService.createEvent.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ id: 1 }), 100))
      );

      render(
        <CreateEventForm
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      await userEvent.type(screen.getByLabelText(/título del evento \*/i), 'Test Event');
      await userEvent.type(screen.getByLabelText(/fecha \*/i), tomorrowStr);
      await userEvent.type(screen.getByLabelText(/hora \*/i), '10:00');
      await userEvent.selectOptions(screen.getByLabelText(/idioma \*/i), 'es');
      await userEvent.type(screen.getByLabelText(/plazas disponibles \*/i), '50');
      await userEvent.type(screen.getByLabelText(/lugar \*/i), 'Barcelona');

      const submitButton = screen.getByRole('button', { name: /crear evento/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      }, { timeout: 1000 });
    });
  });
});

