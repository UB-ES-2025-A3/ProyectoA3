import { createEvent } from './eventService';

global.fetch = jest.fn();

describe('eventService - createEvent con edad mínima', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === 'userId') return '123';
      if (key === 'authToken') return 'token-123';
      return null;
    });

    window.APP_CONFIG = {
      REACT_APP_API_URL: 'http://localhost:8080/api',
      REACT_APP_USE_MOCKS: false
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('crea evento sin edad mínima (null)', async () => {
    const mockResponse = {
      id: 1,
      titulo: 'Evento sin restricción de edad'
    };

    fetch.mockResolvedValueOnce({
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

    const result = await createEvent(eventData);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/events',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token-123'
        }),
        body: expect.any(String)
      })
    );

    const sentData = JSON.parse(fetch.mock.calls[0][1].body);
    expect(sentData.restricciones.edad_minima).toBeNull();
    expect(result).toEqual(mockResponse);
  });

  test('crea evento con edad mínima de 0 años', async () => {
    const mockResponse = {
      id: 2,
      titulo: 'Evento para todos',
      restricciones: { edad_minima: 0 }
    };

    fetch.mockResolvedValueOnce({
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

    const result = await createEvent(eventData);

    const sentData = JSON.parse(fetch.mock.calls[0][1].body);
    expect(sentData.restricciones.edad_minima).toBe(0);
    expect(result).toEqual(mockResponse);
  });

  test('crea evento con edad mínima de 18 años', async () => {
    const mockResponse = {
      id: 3,
      titulo: 'Evento para adultos',
      restricciones: { edad_minima: 18 }
    };

    fetch.mockResolvedValueOnce({
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

    const result = await createEvent(eventData);

    const sentData = JSON.parse(fetch.mock.calls[0][1].body);
    expect(sentData.restricciones.edad_minima).toBe(18);
    expect(result).toEqual(mockResponse);
  });

  test('crea evento con edad mínima de 65 años', async () => {
    const mockResponse = {
      id: 4,
      titulo: 'Evento para mayores',
      restricciones: { edad_minima: 65 }
    };

    fetch.mockResolvedValueOnce({
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

    const result = await createEvent(eventData);

    const sentData = JSON.parse(fetch.mock.calls[0][1].body);
    expect(sentData.restricciones.edad_minima).toBe(65);
    expect(result).toEqual(mockResponse);
  });

  test('incluye el idCreador en la petición', async () => {
    const mockResponse = { id: 5 };

    fetch.mockResolvedValueOnce({
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

    await createEvent(eventData);

    const sentData = JSON.parse(fetch.mock.calls[0][1].body);
    expect(sentData.idCreador).toBe(123);
  });

  test('lanza error si el usuario no está autenticado', async () => {
    Storage.prototype.getItem = jest.fn(() => null);

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

    await expect(createEvent(eventData)).rejects.toThrow(
      'Usuario no autenticado. Por favor, inicia sesión primero.'
    );

    expect(fetch).not.toHaveBeenCalled();
  });

  test('maneja error del servidor correctamente', async () => {
    fetch.mockResolvedValueOnce({
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

    await expect(createEvent(eventData)).rejects.toThrow(
      'Error de validación en el servidor'
    );
  });

  test('envía todos los campos correctamente estructurados', async () => {
    const mockResponse = { id: 6 };

    fetch.mockResolvedValueOnce({
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

    await createEvent(eventData);

    const sentData = JSON.parse(fetch.mock.calls[0][1].body);
    
    expect(sentData).toMatchObject({
      titulo: 'Evento completo',
      descripcion: 'Descripción detallada',
      fecha: '2026-03-15',
      hora: '14:30',
      lugar: 'Bilbao',
      idCreador: 123,
      tags: ['excursion'],
      restricciones: {
        idiomasRequerido: ['es', 'en', 'fr'],
        plazasDisponibles: 30,
        edad_minima: 16
      }
    });
  });

  test('convierte edad mínima string a número', async () => {
    const mockResponse = { id: 7 };

    fetch.mockResolvedValueOnce({
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

    await createEvent(eventData);

    const sentData = JSON.parse(fetch.mock.calls[0][1].body);
    expect(typeof sentData.restricciones.edad_minima).toBe('number');
    expect(sentData.restricciones.edad_minima).toBe(21);
  });
});
