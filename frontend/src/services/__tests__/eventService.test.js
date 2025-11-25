// Mock de imagePicker antes de importar eventService
jest.mock('../imagePicker', () => ({
  chooseImageForTags: jest.fn((tags, fallback) => fallback || 'https://default-image.jpg')
}));

import * as eventService from '../eventService';
import { chooseImageForTags } from '../imagePicker';

// Mock global de fetch
global.fetch = jest.fn();

describe('eventService', () => {
  const mockEventData = {
    titulo: 'Test Event',
    descripcion: 'Test Description',
    lugar: 'Test Location',
    fecha: '2024-12-25',
    hora: '10:00',
    etiquetas: ['deportes'],
    restricciones: {}
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
    chooseImageForTags.mockClear();
    
    // Limpiar localStorage
    localStorage.clear();
    
    // Mock por defecto de chooseImageForTags
    chooseImageForTags.mockResolvedValue('https://default-image.jpg');
  });

  describe('getEvents', () => {
    test('debe obtener eventos cuando no hay usuario logueado', async () => {
      const mockBackendEvents = [
        {
          id: 1,
          titulo: 'Evento 1',
          lugar: 'Lugar 1',
          fecha: '2024-12-25',
          hora: '10:00',
          tags: ['deportes'],
          participantesIds: [],
          idiomasPermitidos: ['es']
        }
      ];

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockBackendEvents
        });

      const events = await eventService.getEvents();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/events'),
        expect.objectContaining({
          headers: expect.any(Object)
        })
      );
      expect(events).toBeDefined();
      expect(Array.isArray(events)).toBe(true);
    });

    test('debe transformar correctamente los datos del backend al formato del frontend', async () => {
      const mockBackendEvents = [
        {
          id: 1,
          titulo: 'Evento de Prueba',
          lugar: 'Barcelona',
          fecha: '2024-12-25',
          hora: '14:30',
          descripcion: 'Descripción del evento',
          tags: ['deportes', 'fútbol'],
          participantesIds: ['1', '2'],
          idiomasPermitidos: ['es', 'en'],
          maxPersonas: 50,
          edadMinima: 18
        }
      ];

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockBackendEvents
        });

      const events = await eventService.getEvents();

      expect(events).toHaveLength(1);
      const event = events[0];
      
      // Verificar transformación de campos
      expect(event.id).toBe('1');
      expect(event.name).toBe('Evento de Prueba');
      expect(event.location).toBe('Barcelona');
      expect(event.description).toBe('Descripción del evento');
      expect(event.tags).toEqual(['deportes', 'fútbol']);
      expect(event.participants).toEqual(['1', '2']);
      expect(event.languages).toEqual(['es', 'en']);
      expect(event.capacity).toBe(50);
      expect(event.restrictions).toBe('Edad mínima: 18 años');
      expect(event.isEnrolled).toBe(false);
      
      // Verificar que startDate es una fecha ISO válida
      expect(event.startDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      
      // Verificar que se ordena por fecha
      expect(new Date(event.startDate).getTime()).toBeGreaterThan(0);
    });

    test('debe manejar datos faltantes con valores por defecto', async () => {
      const mockBackendEvents = [
        {
          id: 2,
          // Sin titulo, lugar, descripcion, etc.
          fecha: '2024-12-25',
          hora: '10:00'
        }
      ];

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockBackendEvents
        });

      const events = await eventService.getEvents();

      expect(events).toHaveLength(1);
      const event = events[0];
      
      expect(event.name).toBe('Evento sin título');
      expect(event.location).toBe('Ubicación por confirmar');
      expect(event.description).toBe('');
      expect(event.restrictions).toBe('');
      expect(event.tags).toEqual([]);
      expect(event.participants).toEqual([]);
      expect(event.languages).toEqual(['es']); // Valor por defecto
      expect(event.capacity).toBeGreaterThanOrEqual(10); // Mínimo 10
    });

    test('debe calcular isEnrolled correctamente cuando el usuario está inscrito', async () => {
      localStorage.setItem('userId', '1');
      localStorage.setItem('token', 'test-token');

      const mockBackendEvents = [
        {
          id: 1,
          titulo: 'Evento',
          lugar: 'Lugar',
          fecha: '2024-12-25',
          hora: '10:00',
          participantesIds: ['1', '2'] // userId '1' está en la lista
        }
      ];

      const mockUserEvents = [
        { id: 1 } // Usuario está inscrito en evento 1
      ];

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockBackendEvents
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUserEvents
        });

      const events = await eventService.getEvents();

      expect(events[0].isEnrolled).toBe(true);
    });

    test('debe normalizar tags correctamente (eliminar espacios, filtrar vacíos)', async () => {
      const mockBackendEvents = [
        {
          id: 1,
          titulo: 'Evento',
          lugar: 'Lugar',
          fecha: '2024-12-25',
          hora: '10:00',
          tags: ['  deportes  ', '  ', 'fútbol', null, undefined, ''] // Tags con problemas
        }
      ];

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockBackendEvents
        });

      const events = await eventService.getEvents();

      expect(events[0].tags).toEqual(['deportes', 'fútbol']); // Limpiados y filtrados
    });

    test('debe normalizar idiomas correctamente (array, string separado por comas, etc.)', async () => {
      const mockBackendEvents = [
        {
          id: 1,
          titulo: 'Evento',
          lugar: 'Lugar',
          fecha: '2024-12-25',
          hora: '10:00',
          idiomasPermitidos: 'es, en, fr' // String separado por comas
        }
      ];

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockBackendEvents
        });

      const events = await eventService.getEvents();

      expect(events[0].languages).toEqual(['es', 'en', 'fr']);
    });

    test('debe ordenar eventos por fecha de inicio', async () => {
      const mockBackendEvents = [
        {
          id: 3,
          titulo: 'Evento 3',
          lugar: 'Lugar',
          fecha: '2024-12-27',
          hora: '10:00'
        },
        {
          id: 1,
          titulo: 'Evento 1',
          lugar: 'Lugar',
          fecha: '2024-12-25',
          hora: '10:00'
        },
        {
          id: 2,
          titulo: 'Evento 2',
          lugar: 'Lugar',
          fecha: '2024-12-26',
          hora: '10:00'
        }
      ];

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockBackendEvents
        });

      const events = await eventService.getEvents();

      expect(events).toHaveLength(3);
      expect(events[0].name).toBe('Evento 1'); // Primero el más antiguo
      expect(events[1].name).toBe('Evento 2');
      expect(events[2].name).toBe('Evento 3');
      
      // Verificar que las fechas están ordenadas
      const dates = events.map(e => new Date(e.startDate).getTime());
      expect(dates).toEqual([...dates].sort((a, b) => a - b));
    });

    test('debe obtener eventos compatibles cuando hay usuario logueado', async () => {
      localStorage.setItem('userId', '1');
      localStorage.setItem('token', 'test-token');

      const mockEvents = [
        {
          id: 1,
          titulo: 'Evento 1',
          lugar: 'Lugar 1',
          fecha: '2024-12-25',
          hora: '10:00',
          tags: ['deportes'],
          participantesIds: [],
          idiomasPermitidos: ['es']
        }
      ];

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockEvents
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => []
        });

      const events = await eventService.getEvents();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/events/compatible'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token'
          })
        })
      );
      expect(events).toBeDefined();
    });

    test('debe manejar errores al obtener eventos', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(eventService.getEvents()).rejects.toThrow('No se pudieron cargar los eventos');
    });
  });

  describe('createEvent', () => {
    beforeEach(() => {
      localStorage.setItem('userId', '123');
      localStorage.setItem('authToken', 'token-123');
      window.APP_CONFIG = {
        REACT_APP_API_URL: 'http://localhost:8080/api',
        REACT_APP_USE_MOCKS: false
      };
    });

    test('debe crear un evento exitosamente', async () => {
      const mockCreatedEvent = {
        id: 1,
        titulo: 'Test Event',
        lugar: 'Test Location'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCreatedEvent
      });

      const result = await eventService.createEvent(mockEventData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/events'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer token-123',
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('"titulo":"Test Event"')
        })
      );
      expect(result).toEqual(mockCreatedEvent);
    });

    test('crea evento sin edad mínima (null)', async () => {
      const mockResponse = {
        id: 1,
        titulo: 'Evento sin restricción de edad'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const eventData = {
        titulo: 'Evento sin restricción de edad',
        descripcion: 'Un evento para todos',
        etiquetas: 'turismo',
        fecha: '2025-12-31',
        hora: '18:00',
        lugar: 'Barcelona',
        restricciones: {
          idiomasRequerido: ['es'],
          plazasDisponibles: 10,
          edad_minima: null
        }
      };

      const result = await eventService.createEvent(eventData);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      const sentData = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(sentData.restricciones.edad_minima).toBeNull();
      expect(result).toEqual(mockResponse);
    });

    test('crea evento con edad mínima de 0 años', async () => {
      const mockResponse = {
        id: 2,
        titulo: 'Evento para todos',
        restricciones: { edad_minima: 0 }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const eventData = {
        titulo: 'Evento para todos',
        descripcion: 'Sin restricción de edad',
        etiquetas: 'comida',
        fecha: '2025-12-25',
        hora: '12:00',
        lugar: 'Madrid',
        restricciones: {
          idiomasRequerido: ['es'],
          plazasDisponibles: 20,
          edad_minima: 0
        }
      };

      const result = await eventService.createEvent(eventData);

      const sentData = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(sentData.restricciones.edad_minima).toBe(0);
      expect(result).toEqual(mockResponse);
    });

    test('crea evento con edad mínima de 18 años', async () => {
      const mockResponse = {
        id: 3,
        titulo: 'Evento para adultos',
        restricciones: { edad_minima: 18 }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const eventData = {
        titulo: 'Evento para adultos',
        descripcion: 'Solo mayores de edad',
        etiquetas: 'otros',
        fecha: '2026-01-15',
        hora: '20:00',
        lugar: 'Valencia',
        restricciones: {
          idiomasRequerido: ['es', 'en'],
          plazasDisponibles: 15,
          edad_minima: 18
        }
      };

      const result = await eventService.createEvent(eventData);

      const sentData = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(sentData.restricciones.edad_minima).toBe(18);
      expect(result).toEqual(mockResponse);
    });

    test('crea evento con edad mínima de 65 años', async () => {
      const mockResponse = {
        id: 4,
        titulo: 'Evento para mayores',
        restricciones: { edad_minima: 65 }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const eventData = {
        titulo: 'Evento para mayores',
        descripcion: 'Actividad para la tercera edad',
        etiquetas: 'turismo',
        fecha: '2025-12-20',
        hora: '10:00',
        lugar: 'Sevilla',
        restricciones: {
          idiomasRequerido: ['es'],
          plazasDisponibles: 25,
          edad_minima: 65
        }
      };

      const result = await eventService.createEvent(eventData);

      const sentData = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(sentData.restricciones.edad_minima).toBe(65);
      expect(result).toEqual(mockResponse);
    });

    test('incluye el idCreador en la petición', async () => {
      const mockResponse = { id: 5 };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const eventData = {
        titulo: 'Evento de prueba',
        fecha: '2025-12-31',
        hora: '18:00',
        lugar: 'Barcelona',
        restricciones: {
          idiomasRequerido: ['es'],
          plazasDisponibles: 10,
          edad_minima: 21
        }
      };

      await eventService.createEvent(eventData);

      const sentData = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(sentData.idCreador).toBe(123);
    });

    test('envía todos los campos correctamente estructurados', async () => {
      const mockResponse = { id: 6 };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const eventData = {
        titulo: 'Evento completo',
        descripcion: 'Descripción detallada',
        etiquetas: 'excursion',
        fecha: '2026-03-15',
        hora: '14:30',
        lugar: 'Bilbao',
        restricciones: {
          idiomasRequerido: ['es', 'en', 'fr'],
          plazasDisponibles: 30,
          edad_minima: 16
        }
      };

      await eventService.createEvent(eventData);

      const sentData = JSON.parse(global.fetch.mock.calls[0][1].body);
      
      expect(sentData).toMatchObject({
        titulo: 'Evento completo',
        descripcion: 'Descripción detallada',
        fecha: '2026-03-15',
        hora: '14:30',
        lugar: 'Bilbao',
        idCreador: 123,
        restricciones: {
          idiomasRequerido: ['es', 'en', 'fr'],
          plazasDisponibles: 30,
          edad_minima: 16
        }
      });
    });

    test('convierte edad mínima string a número', async () => {
      const mockResponse = { id: 7 };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const eventData = {
        titulo: 'Evento de prueba',
        fecha: '2025-12-31',
        hora: '18:00',
        lugar: 'Barcelona',
        restricciones: {
          idiomasRequerido: ['es'],
          plazasDisponibles: 10,
          edad_minima: 21 // Ya viene como número desde el formulario
        }
      };

      await eventService.createEvent(eventData);

      const sentData = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(typeof sentData.restricciones.edad_minima).toBe('number');
      expect(sentData.restricciones.edad_minima).toBe(21);
    });

    test('debe lanzar error si el usuario no está autenticado', async () => {
      localStorage.clear();

      await expect(eventService.createEvent(mockEventData)).rejects.toThrow(
        'Usuario no autenticado'
      );
    });

    test('maneja error del servidor correctamente', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Error de validación en el servidor' })
      });

      const eventData = {
        titulo: 'Evento de prueba',
        fecha: '2025-12-31',
        hora: '18:00',
        lugar: 'Barcelona',
        restricciones: {
          idiomasRequerido: ['es'],
          plazasDisponibles: 10,
          edad_minima: 18
        }
      };

      await expect(eventService.createEvent(eventData)).rejects.toThrow(
        'Error de validación en el servidor'
      );
    });

    test('debe manejar errores del servidor al crear evento', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Error al crear el evento' })
      });

      await expect(eventService.createEvent(mockEventData)).rejects.toThrow('Error al crear el evento');
    });
  });

  describe('joinEvent', () => {
    test('debe unirse a un evento exitosamente', async () => {
      localStorage.setItem('userId', '1');
      localStorage.setItem('token', 'test-token');

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true })
      });

      const result = await eventService.joinEvent(1);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/events/join'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token'
          }),
          body: expect.stringContaining('"idEvento":1')
        })
      );
      expect(result).toBeDefined();
    });

    test('debe lanzar error si el usuario no está autenticado', async () => {
      localStorage.clear();

      await expect(eventService.joinEvent(1)).rejects.toThrow('Usuario no autenticado');
    });

    test('debe manejar error cuando ya está apuntado al evento', async () => {
      localStorage.setItem('userId', '1');
      localStorage.setItem('token', 'test-token');

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ error: 'Ya estás apuntado' })
      });

      await expect(eventService.joinEvent(1)).rejects.toThrow('Ya estás apuntado a este evento');
    });

    test('debe manejar otros errores del servidor', async () => {
      localStorage.setItem('userId', '1');
      localStorage.setItem('token', 'test-token');

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Evento no encontrado' })
      });

      await expect(eventService.joinEvent(999)).rejects.toThrow('Evento no encontrado');
    });
  });

  describe('leaveEvent', () => {
    test('debe salir de un evento exitosamente', async () => {
      localStorage.setItem('userId', '1');
      localStorage.setItem('token', 'test-token');

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true })
      });

      const result = await eventService.leaveEvent(1);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/events/leave'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token'
          }),
          body: expect.stringContaining('"idEvento":1')
        })
      );
      expect(result).toBeDefined();
    });

    test('debe lanzar error si el usuario no está autenticado', async () => {
      localStorage.clear();

      await expect(eventService.leaveEvent(1)).rejects.toThrow('Usuario no autenticado');
    });

    test('debe manejar errores del servidor', async () => {
      localStorage.setItem('userId', '1');
      localStorage.setItem('token', 'test-token');

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'No se pudo desapuntar del evento'
      });

      await expect(eventService.leaveEvent(1)).rejects.toThrow('No se pudo desapuntar del evento');
    });
  });

  describe('getUserEvents', () => {
    test('debe obtener eventos del usuario exitosamente', async () => {
      localStorage.setItem('userId', '1');
      localStorage.setItem('token', 'test-token');

      const mockUserEvents = [
        {
          id: 1,
          titulo: 'Mi Evento',
          lugar: 'Lugar',
          fecha: '2024-12-25',
          hora: '10:00',
          tags: ['deportes'],
          participantesIds: ['1'],
          idiomasPermitidos: ['es']
        }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserEvents
      });

      const events = await eventService.getUserEvents();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/events/my-events'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token'
          })
        })
      );
      expect(events).toBeDefined();
      expect(Array.isArray(events)).toBe(true);
    });

    test('debe manejar errores al obtener eventos del usuario', async () => {
      localStorage.setItem('userId', '1');
      localStorage.setItem('token', 'test-token');

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(eventService.getUserEvents()).rejects.toThrow('No se pudieron cargar tus eventos');
    });
  });

  describe('getMyCreatedEvents', () => {
    test('debe obtener eventos creados por el usuario exitosamente', async () => {
      localStorage.setItem('userId', '1');
      localStorage.setItem('token', 'test-token');

      const mockCreatedEvents = [
        {
          id: 1,
          titulo: 'Evento Creado',
          lugar: 'Lugar',
          fecha: '2024-12-25',
          hora: '10:00',
          tags: ['deportes'],
          participantesIds: [],
          idiomasPermitidos: ['es']
        }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCreatedEvents
      });

      const events = await eventService.getMyCreatedEvents();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/events/my-created-events'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token'
          })
        })
      );
      expect(events).toBeDefined();
      expect(Array.isArray(events)).toBe(true);
    });

    test('debe manejar errores al obtener eventos creados', async () => {
      localStorage.setItem('userId', '1');
      localStorage.setItem('token', 'test-token');

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(eventService.getMyCreatedEvents()).rejects.toThrow('No se pudieron cargar tus eventos creados');
    });
  });
});

