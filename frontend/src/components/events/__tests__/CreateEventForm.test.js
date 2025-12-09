import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CreateEventForm from '../CreateEventForm';
import * as eventService from '../../../services/eventService';

// 🔹 Mock react-i18next ajustado a las keys reales de createEvent
jest.mock('react-i18next', () => ({
  useTranslation: () => {
    const translations = {
      // Modal
      'createevent.modal.title': 'Crear nuevo evento',
      'createevent.modal.subtitle': 'Completa el formulario para crear un nuevo evento',

      // Mensajes
      'createevent.messages.submiterrorfallback': 'Error al crear el evento. Inténtalo de nuevo.',

      // Labels
      'createevent.form.labels.title': 'Título del evento',
      'createevent.form.labels.description': 'Descripción',
      'createevent.form.labels.tags': 'Etiquetas',
      'createevent.form.labels.date': 'Fecha',
      'createevent.form.labels.time': 'Hora',
      'createevent.form.labels.language': 'Idioma',
      'createevent.form.labels.capacity': 'Plazas disponibles',
      'createevent.form.labels.minage': 'Edad mínima (opcional)',
      'createevent.form.labels.place': 'Lugar',

      // Placeholders
      'createevent.form.placeholders.title': 'Ej: Paseo por el centro histórico',
      'createevent.form.placeholders.description': 'Describe tu evento (opcional)',
      'createevent.form.placeholders.capacity': 'Número de plazas',
      'createevent.form.placeholders.minage': 'Ej: 18',
      'createevent.form.placeholders.place': 'Ej: Café Central',

      // Tags
      'createevent.form.tags.placeholder': 'Selecciona una etiqueta',
      'createevent.form.tags.options.turismo': 'Turismo',
      'createevent.form.tags.options.comida': 'Comida',
      'createevent.form.tags.options.excursion': 'Excursión',
      'createevent.form.tags.options.cultural': 'Cultural',
      'createevent.form.tags.options.social': 'Social',
      'createevent.form.tags.options.deporte': 'Deporte',
      'createevent.form.tags.options.aventura': 'Aventura',
      'createevent.form.tags.options.familiar': 'Familiar',
      'createevent.form.tags.options.juegos': 'Juegos',
      'createevent.form.tags.options.cine': 'Cine',
      'createevent.form.tags.options.relax': 'Relax',
      'createevent.form.tags.options.tardeo': 'Tardeo',
      'createevent.form.tags.options.noche': 'Noche',
      'createevent.form.tags.options.otros': 'Otros',

      // Language select
      'createevent.form.language.placeholder': 'Selecciona un idioma',
      'createevent.form.language.options.es': 'Español',
      'createevent.form.language.options.en': 'Inglés',
      'createevent.form.language.options.fr': 'Francés',
      'createevent.form.language.options.de': 'Alemán',
      'createevent.form.language.options.it': 'Italiano',
      'createevent.form.language.options.pt': 'Portugués',
      'createevent.form.language.options.ru': 'Ruso',

      // Botones
      'createevent.buttons.cancel': 'Cancelar',
      'createevent.buttons.submit': 'Crear evento',
      'createevent.buttons.submitting': 'Creando...',

      // Validación
      'createevent.validation.titlerequired': 'El título del evento es requerido',
      'createevent.validation.daterequired': 'La fecha es requerida',
      'createevent.validation.dateinpast': 'La fecha no puede ser anterior a hoy',
      'createevent.validation.timerequired': 'La hora es requerida',
      'createevent.validation.languagerequired': 'Debes seleccionar un idioma',
      'createevent.validation.capacityrequired': 'Las plazas disponibles son requeridas',
      'createevent.validation.capacitymin': 'Debe haber al menos 1 plaza disponible',
      'createevent.validation.minagemin': 'La edad mínima debe ser 0 o mayor',
      'createevent.validation.minagemax': 'La edad mínima debe ser menor a 120',
      'createevent.validation.placerequired': 'El lugar es requerido'
    };

    return {
      t: (key) => {
        const lk = String(key).toLowerCase();
        return translations[lk] || key;
      },
      i18n: { language: 'es', changeLanguage: () => Promise.resolve() }
    };
  }
}));

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
        await userEvent.type(screen.getByLabelText(/latitud/i), '41.3851');
        await userEvent.type(screen.getByLabelText(/longitud/i), '2.1734');
      };

      test('muestra el campo de edad mínima como opcional', () => {
        render(
          <CreateEventForm
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        );
        
        const edadMinimaInput = screen.getByLabelText(/edad mínima/i);
        expect(edadMinimaInput).toBeInTheDocument();
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
      await userEvent.type(screen.getByLabelText(/latitud/i), '41.3851');
      await userEvent.type(screen.getByLabelText(/longitud/i), '2.1734');
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
          latitud: 41.3851,
          longitud: 2.1734,
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
      await userEvent.type(screen.getByLabelText(/latitud/i), '41.3851');
      await userEvent.type(screen.getByLabelText(/longitud/i), '2.1734');

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
      await userEvent.type(screen.getByLabelText(/latitud/i), '41.3851');
      await userEvent.type(screen.getByLabelText(/longitud/i), '2.1734');

      const submitButton = screen.getByRole('button', { name: /crear evento/i });
      await userEvent.click(submitButton);

      const errorMessage = await screen.findByText(/Error al crear el evento/i, {}, { timeout: 3000 });
      expect(errorMessage).toBeInTheDocument();
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    test('debe mostrar estado de carga durante la creación', async () => {
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
      await userEvent.type(screen.getByLabelText(/latitud/i), '41.3851');
      await userEvent.type(screen.getByLabelText(/longitud/i), '2.1734');

      const submitButton = screen.getByRole('button', { name: /crear evento/i });
      
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      await waitFor(() => {
        const creatingButton = screen.getByRole('button', { name: /creando.../i });
        expect(creatingButton).toBeDisabled();
      });

      resolvePromise({ id: 1 });
      
      await waitFor(() => {
        const enabledButton = screen.getByRole('button', { name: /crear evento/i });
        expect(enabledButton).not.toBeDisabled();
      }, { timeout: 3000 });
    });
  });

  describe('Validación de Latitud y Longitud', () => {
    test('debe mostrar los campos de latitud y longitud', () => {
      render(
        <CreateEventForm
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByLabelText(/latitud/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/longitud/i)).toBeInTheDocument();
    });

    test('debe rellenar automáticamente latitud cuando viene del mapa', async () => {
      // Cuando viene del mapa, latitud se rellena automáticamente y es readonly
      render(
        <CreateEventForm
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          initialCoordinates={{ latitude: 41.3851, longitude: 2.1734 }}
        />
      );

      // Verificar que el campo de latitud está rellenado y es readonly
      const latitudInput = screen.getByLabelText(/latitud/i);
      expect(latitudInput).toHaveValue(41.3851);
      expect(latitudInput).toHaveAttribute('readOnly');
    });

    test('debe validar latitud como requerida cuando initialCoordinates tiene ambos valores', async () => {
      // Cuando initialCoordinates tiene ambos valores != null, hasInitialCoordinates es true
      // y latitud es requerida. Si está vacía, debe mostrar error.
      // Simulamos el caso donde el campo está vacío aunque initialCoordinates tiene valores
      // Esto puede pasar si hay un bug en el rellenado automático
      const { container } = render(
        <CreateEventForm
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          initialCoordinates={{ latitude: 41.3851, longitude: 2.1734 }}
        />
      );

      // Rellenar otros campos requeridos
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      await userEvent.type(screen.getByLabelText(/título del evento \*/i), 'Evento de prueba');
      await userEvent.type(screen.getByLabelText(/fecha \*/i), tomorrowStr);
      await userEvent.type(screen.getByLabelText(/hora \*/i), '18:00');
      await userEvent.selectOptions(screen.getByLabelText(/idioma \*/i), 'es');
      await userEvent.type(screen.getByLabelText(/plazas disponibles \*/i), '10');
      await userEvent.type(screen.getByLabelText(/lugar \*/i), 'Barcelona');

      // Simular que el campo de latitud está vacío (aunque debería estar rellenado)
      // Usamos una técnica diferente: acceder directamente al input y cambiar su valor
      const latitudInput = container.querySelector('#latitud');
      if (latitudInput) {
        // Remover el atributo readonly temporalmente para poder cambiar el valor
        latitudInput.removeAttribute('readonly');
        fireEvent.change(latitudInput, { target: { value: '' } });
      }

      const submitButton = screen.getByRole('button', { name: /crear evento/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/la latitud es requerida/i)).toBeInTheDocument();
      });
    });

    test('NO debe mostrar error cuando la latitud está vacía (si NO viene del mapa)', async () => {
      // Cuando NO viene del mapa, latitud es opcional
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

      await userEvent.type(screen.getByLabelText(/título del evento \*/i), 'Evento de prueba');
      await userEvent.type(screen.getByLabelText(/fecha \*/i), tomorrowStr);
      await userEvent.type(screen.getByLabelText(/hora \*/i), '18:00');
      await userEvent.selectOptions(screen.getByLabelText(/idioma \*/i), 'es');
      await userEvent.type(screen.getByLabelText(/plazas disponibles \*/i), '10');
      await userEvent.type(screen.getByLabelText(/lugar \*/i), 'Barcelona');
      // No rellenamos latitud ni longitud (son opcionales)

      const submitButton = screen.getByRole('button', { name: /crear evento/i });
      await userEvent.click(submitButton);

      // No debería mostrar error de latitud requerida
      await waitFor(() => {
        expect(eventService.createEvent).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    test('debe rellenar automáticamente longitud cuando viene del mapa', async () => {
      // Cuando viene del mapa, longitud se rellena automáticamente y es readonly
      render(
        <CreateEventForm
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          initialCoordinates={{ latitude: 41.3851, longitude: 2.1734 }}
        />
      );

      // Verificar que el campo de longitud está rellenado y es readonly
      const longitudInput = screen.getByLabelText(/longitud/i);
      expect(longitudInput).toHaveValue(2.1734);
      expect(longitudInput).toHaveAttribute('readOnly');
    });

    test('debe validar longitud como requerida cuando initialCoordinates tiene ambos valores', async () => {
      // Cuando initialCoordinates tiene ambos valores != null, hasInitialCoordinates es true
      // y longitud es requerida. Si está vacía, debe mostrar error.
      // Simulamos el caso donde el campo está vacío aunque initialCoordinates tiene valores
      // Esto puede pasar si hay un bug en el rellenado automático
      const { container } = render(
        <CreateEventForm
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          initialCoordinates={{ latitude: 41.3851, longitude: 2.1734 }}
        />
      );

      // Rellenar otros campos requeridos
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      await userEvent.type(screen.getByLabelText(/título del evento \*/i), 'Evento de prueba');
      await userEvent.type(screen.getByLabelText(/fecha \*/i), tomorrowStr);
      await userEvent.type(screen.getByLabelText(/hora \*/i), '18:00');
      await userEvent.selectOptions(screen.getByLabelText(/idioma \*/i), 'es');
      await userEvent.type(screen.getByLabelText(/plazas disponibles \*/i), '10');
      await userEvent.type(screen.getByLabelText(/lugar \*/i), 'Barcelona');

      // Simular que el campo de longitud está vacío (aunque debería estar rellenado)
      // Usamos una técnica diferente: acceder directamente al input y cambiar su valor
      const longitudInput = container.querySelector('#longitud');
      if (longitudInput) {
        // Remover el atributo readonly temporalmente para poder cambiar el valor
        longitudInput.removeAttribute('readonly');
        fireEvent.change(longitudInput, { target: { value: '' } });
      }

      const submitButton = screen.getByRole('button', { name: /crear evento/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/la longitud es requerida/i)).toBeInTheDocument();
      });
    });

    test('NO debe mostrar error cuando la longitud está vacía (si NO viene del mapa)', async () => {
      // Cuando NO viene del mapa, longitud es opcional
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

      await userEvent.type(screen.getByLabelText(/título del evento \*/i), 'Evento de prueba');
      await userEvent.type(screen.getByLabelText(/fecha \*/i), tomorrowStr);
      await userEvent.type(screen.getByLabelText(/hora \*/i), '18:00');
      await userEvent.selectOptions(screen.getByLabelText(/idioma \*/i), 'es');
      await userEvent.type(screen.getByLabelText(/plazas disponibles \*/i), '10');
      await userEvent.type(screen.getByLabelText(/lugar \*/i), 'Barcelona');
      // No rellenamos latitud ni longitud (son opcionales)

      const submitButton = screen.getByRole('button', { name: /crear evento/i });
      await userEvent.click(submitButton);

      // No debería mostrar error de longitud requerida
      await waitFor(() => {
        expect(eventService.createEvent).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    test('debe mostrar error cuando la latitud está fuera de rango [-90, 90]', async () => {
      render(
        <CreateEventForm
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const latitudInput = screen.getByLabelText(/latitud/i);
      await userEvent.type(latitudInput, '95');

      const submitButton = screen.getByRole('button', { name: /crear evento/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/latitud inválida/i)).toBeInTheDocument();
      });
    });

    test('debe mostrar error cuando la latitud es menor que -90', async () => {
      render(
        <CreateEventForm
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const latitudInput = screen.getByLabelText(/latitud/i);
      await userEvent.type(latitudInput, '-95');

      const submitButton = screen.getByRole('button', { name: /crear evento/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/latitud inválida/i)).toBeInTheDocument();
      });
    });

    test('debe mostrar error cuando la longitud está fuera de rango [-180, 180]', async () => {
      render(
        <CreateEventForm
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const longitudInput = screen.getByLabelText(/longitud/i);
      await userEvent.type(longitudInput, '200');

      const submitButton = screen.getByRole('button', { name: /crear evento/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/longitud inválida/i)).toBeInTheDocument();
      });
    });

    test('debe mostrar error cuando la longitud es menor que -180', async () => {
      render(
        <CreateEventForm
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const longitudInput = screen.getByLabelText(/longitud/i);
      await userEvent.type(longitudInput, '-200');

      const submitButton = screen.getByRole('button', { name: /crear evento/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/longitud inválida/i)).toBeInTheDocument();
      });
    });

    test('debe aceptar latitud y longitud válidas en el límite', async () => {
      eventService.createEvent.mockResolvedValue({ id: 1, titulo: 'Evento de prueba' });

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

      await userEvent.type(screen.getByLabelText(/título del evento \*/i), 'Evento de prueba');
      await userEvent.type(screen.getByLabelText(/fecha \*/i), tomorrowStr);
      await userEvent.type(screen.getByLabelText(/hora \*/i), '18:00');
      await userEvent.selectOptions(screen.getByLabelText(/idioma \*/i), 'es');
      await userEvent.type(screen.getByLabelText(/plazas disponibles \*/i), '10');
      await userEvent.type(screen.getByLabelText(/lugar \*/i), 'Barcelona');
      await userEvent.type(screen.getByLabelText(/latitud/i), '90');
      await userEvent.type(screen.getByLabelText(/longitud/i), '180');

      const submitButton = screen.getByRole('button', { name: /crear evento/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(eventService.createEvent).toHaveBeenCalled();
      });

      const callArgs = eventService.createEvent.mock.calls[0][0];
      expect(callArgs.latitud).toBe(90);
      expect(callArgs.longitud).toBe(180);
    });

    test('debe aceptar latitud y longitud negativas válidas', async () => {
      eventService.createEvent.mockResolvedValue({ id: 1, titulo: 'Evento de prueba' });

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

      await userEvent.type(screen.getByLabelText(/título del evento \*/i), 'Evento de prueba');
      await userEvent.type(screen.getByLabelText(/fecha \*/i), tomorrowStr);
      await userEvent.type(screen.getByLabelText(/hora \*/i), '18:00');
      await userEvent.selectOptions(screen.getByLabelText(/idioma \*/i), 'es');
      await userEvent.type(screen.getByLabelText(/plazas disponibles \*/i), '10');
      await userEvent.type(screen.getByLabelText(/lugar \*/i), 'Buenos Aires');
      await userEvent.type(screen.getByLabelText(/latitud/i), '-34.6037');
      await userEvent.type(screen.getByLabelText(/longitud/i), '-58.3816');

      const submitButton = screen.getByRole('button', { name: /crear evento/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(eventService.createEvent).toHaveBeenCalled();
      });

      const callArgs = eventService.createEvent.mock.calls[0][0];
      expect(callArgs.latitud).toBe(-34.6037);
      expect(callArgs.longitud).toBe(-58.3816);
    });

    test('debe aceptar latitud y longitud con valor 0', async () => {
      eventService.createEvent.mockResolvedValue({ id: 1, titulo: 'Evento de prueba' });

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

      await userEvent.type(screen.getByLabelText(/título del evento \*/i), 'Evento de prueba');
      await userEvent.type(screen.getByLabelText(/fecha \*/i), tomorrowStr);
      await userEvent.type(screen.getByLabelText(/hora \*/i), '18:00');
      await userEvent.selectOptions(screen.getByLabelText(/idioma \*/i), 'es');
      await userEvent.type(screen.getByLabelText(/plazas disponibles \*/i), '10');
      await userEvent.type(screen.getByLabelText(/lugar \*/i), 'Ecuador');
      await userEvent.type(screen.getByLabelText(/latitud/i), '0');
      await userEvent.type(screen.getByLabelText(/longitud/i), '0');

      const submitButton = screen.getByRole('button', { name: /crear evento/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(eventService.createEvent).toHaveBeenCalled();
      });

      const callArgs = eventService.createEvent.mock.calls[0][0];
      expect(callArgs.latitud).toBe(0);
      expect(callArgs.longitud).toBe(0);
    });
  });
});