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

    describe('Validación de Edad Mínima', () => {
      const fillBasicForm = async () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        await userEvent.type(screen.getByLabelText(/título del evento \*/i), 'Evento de prueba');
        await userEvent.type(screen.getByLabelText(/fecha \*/i), tomorrowStr);
        await userEvent.type(screen.getByLabelText(/hora \*/i), '18:00');
        await userEvent.selectOptions(screen.getByLabelText(/idioma \*/i), 'es');
        await userEvent.type(screen.getByLabelText(/plazas disponibles \*/i), '10');
        await userEvent.type(screen.getByLabelText(/lugar \*/i), 'Barcelona');
        await userEvent.selectOptions(screen.getByLabelText(/etiquetas/i), 'turismo');
      };

      test('muestra el campo de edad mínima como opcional', () => {
        render(
          <CreateEventForm
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        );
        
        const edadMinimaLabel = screen.getByLabelText(/edad mínima/i);
        expect(edadMinimaLabel).toBeInTheDocument();
        expect(screen.getByText(/edad mínima \(opcional\)/i)).toBeInTheDocument();
      });

      test('permite crear evento sin especificar edad mínima', async () => {
        eventService.createEvent.mockResolvedValue({ id: 1, titulo: 'Evento de prueba' });

        render(
          <CreateEventForm
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        );
        
        await fillBasicForm();
        
        const submitButton = screen.getByRole('button', { name: /crear evento/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
          expect(eventService.createEvent).toHaveBeenCalled();
        });

        const callArgs = eventService.createEvent.mock.calls[0][0];
        expect(callArgs.restricciones.edad_minima).toBeNull();
      });

      test('acepta edad mínima de 0 años', async () => {
        eventService.createEvent.mockResolvedValue({ id: 1, titulo: 'Evento de prueba' });

        render(
          <CreateEventForm
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        );
        
        await fillBasicForm();
        
        const edadMinimaInput = screen.getByLabelText(/edad mínima/i);
        await userEvent.type(edadMinimaInput, '0');
        
        const submitButton = screen.getByRole('button', { name: /crear evento/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
          expect(eventService.createEvent).toHaveBeenCalled();
        });

        const callArgs = eventService.createEvent.mock.calls[0][0];
        expect(callArgs.restricciones.edad_minima).toBe(0);
      });

      test('acepta edad mínima válida (18 años)', async () => {
        eventService.createEvent.mockResolvedValue({ id: 1, titulo: 'Evento de prueba' });

        render(
          <CreateEventForm
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        );
        
        await fillBasicForm();
        
        const edadMinimaInput = screen.getByLabelText(/edad mínima/i);
        await userEvent.type(edadMinimaInput, '18');
        
        const submitButton = screen.getByRole('button', { name: /crear evento/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
          expect(eventService.createEvent).toHaveBeenCalled();
        });

        const callArgs = eventService.createEvent.mock.calls[0][0];
        expect(callArgs.restricciones.edad_minima).toBe(18);
      });

      test('rechaza edad mínima negativa', async () => {
        render(
          <CreateEventForm
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        );
        
        await fillBasicForm();
        
        const edadMinimaInput = screen.getByLabelText(/edad mínima/i);
        await userEvent.type(edadMinimaInput, '-5');
        
        const submitButton = screen.getByRole('button', { name: /crear evento/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText(/la edad mínima debe ser 0 o mayor/i)).toBeInTheDocument();
        });

        expect(eventService.createEvent).not.toHaveBeenCalled();
      });

      test('rechaza edad mínima mayor a 120 años', async () => {
        render(
          <CreateEventForm
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        );
        
        await fillBasicForm();
        
        const edadMinimaInput = screen.getByLabelText(/edad mínima/i);
        await userEvent.type(edadMinimaInput, '150');
        
        const submitButton = screen.getByRole('button', { name: /crear evento/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText(/la edad mínima debe ser menor a 120/i)).toBeInTheDocument();
        });

        expect(eventService.createEvent).not.toHaveBeenCalled();
      });

      test('acepta edad mínima en el límite superior (120 años)', async () => {
        eventService.createEvent.mockResolvedValue({ id: 1, titulo: 'Evento de prueba' });

        render(
          <CreateEventForm
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        );
        
        await fillBasicForm();
        
        const edadMinimaInput = screen.getByLabelText(/edad mínima/i);
        await userEvent.type(edadMinimaInput, '120');
        
        const submitButton = screen.getByRole('button', { name: /crear evento/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
          expect(eventService.createEvent).toHaveBeenCalled();
        });

        const callArgs = eventService.createEvent.mock.calls[0][0];
        expect(callArgs.restricciones.edad_minima).toBe(120);
      });

      test('limpia el error de edad mínima cuando el usuario corrige el valor', async () => {
        render(
          <CreateEventForm
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        );
        
        await fillBasicForm();
        
        const edadMinimaInput = screen.getByLabelText(/edad mínima/i);
        
        await userEvent.type(edadMinimaInput, '-5');
        
        const submitButton = screen.getByRole('button', { name: /crear evento/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText(/la edad mínima debe ser 0 o mayor/i)).toBeInTheDocument();
        });

        await userEvent.clear(edadMinimaInput);
        await userEvent.type(edadMinimaInput, '18');

        await waitFor(() => {
          expect(screen.queryByText(/la edad mínima debe ser 0 o mayor/i)).not.toBeInTheDocument();
        });
      });

      test('el campo tiene atributos min y max correctos', () => {
        render(
          <CreateEventForm
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        );
        
        const edadMinimaInput = screen.getByLabelText(/edad mínima/i);
        
        expect(edadMinimaInput).toHaveAttribute('type', 'number');
        expect(edadMinimaInput).toHaveAttribute('min', '0');
        expect(edadMinimaInput).toHaveAttribute('max', '120');
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
            idiomasRequerido: ['es'],
            plazasDisponibles: 50,
            edad_minima: null
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
      await userEvent.selectOptions(screen.getByLabelText(/etiquetas/i), 'turismo');
      await userEvent.type(screen.getByLabelText(/fecha \*/i), tomorrowStr);
      await userEvent.type(screen.getByLabelText(/hora \*/i), '10:00');
      await userEvent.selectOptions(screen.getByLabelText(/idioma \*/i), 'es');
      await userEvent.type(screen.getByLabelText(/plazas disponibles \*/i), '50');
      await userEvent.type(screen.getByLabelText(/lugar \*/i), 'Barcelona');

      const submitButton = screen.getByRole('button', { name: /crear evento/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      }, { timeout: 3000 });
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
      await userEvent.selectOptions(screen.getByLabelText(/etiquetas/i), 'turismo');
      await userEvent.type(screen.getByLabelText(/fecha \*/i), tomorrowStr);
      await userEvent.type(screen.getByLabelText(/hora \*/i), '10:00');
      await userEvent.selectOptions(screen.getByLabelText(/idioma \*/i), 'es');
      await userEvent.type(screen.getByLabelText(/plazas disponibles \*/i), '50');
      await userEvent.type(screen.getByLabelText(/lugar \*/i), 'Barcelona');

      const submitButton = screen.getByRole('button', { name: /crear evento/i });
      await userEvent.click(submitButton);

      // Esperar a que aparezca el mensaje de error usando findByText
      const errorMessage = await screen.findByText(/Error al crear el evento/i, {}, { timeout: 3000 });
      expect(errorMessage).toBeInTheDocument();

      // Verificar que onSuccess NO fue llamado
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    test('debe mostrar estado de carga durante la creación', async () => {
      // Crear una promesa que se resuelve después de un delay
      let resolvePromise;
      const delayedPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      
      eventService.createEvent.mockImplementation(() => delayedPromise);

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

      const submitButton = screen.getByRole('button', { name: /crear evento/i });
      
      // Hacer click y verificar que el botón se deshabilita
      await userEvent.click(submitButton);

      // Verificar que el botón está deshabilitado durante la carga
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      // Verificar que el texto del botón cambia a "Creando..."
      await waitFor(() => {
        const creatingButton = screen.getByRole('button', { name: /creando.../i });
        expect(creatingButton).toBeDisabled();
      });

      // Resolver la promesa para completar el test
      resolvePromise({ id: 1 });
      
      // Esperar a que termine la carga y el botón vuelva a estar habilitado
      await waitFor(() => {
        const enabledButton = screen.getByRole('button', { name: /crear evento/i });
        expect(enabledButton).not.toBeDisabled();
      }, { timeout: 3000 });
    });
  });
});

