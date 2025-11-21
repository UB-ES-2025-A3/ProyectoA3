import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateEventForm from '../components/events/CreateEventForm';

global.fetch = jest.fn();

describe('Integración: Crear Evento con Edad Mínima', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

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

    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const fillCompleteForm = (edadMinima = null) => {
    fireEvent.change(screen.getByLabelText(/título del evento/i), {
      target: { value: 'Concierto de Rock' }
    });
    
    fireEvent.change(screen.getByLabelText(/etiquetas/i), {
      target: { value: 'otros' }
    });
    
    fireEvent.change(screen.getByLabelText(/fecha/i), {
      target: { value: '2025-12-31' }
    });
    
    fireEvent.change(screen.getByLabelText(/hora/i), {
      target: { value: '21:00' }
    });
    
    fireEvent.change(screen.getByLabelText(/idioma/i), {
      target: { value: 'es' }
    });
    
    fireEvent.change(screen.getByLabelText(/plazas disponibles/i), {
      target: { value: '100' }
    });
    
    fireEvent.change(screen.getByLabelText(/lugar/i), {
      target: { value: 'Palau de la Música' }
    });

    fireEvent.change(screen.getByLabelText(/descripción/i), {
      target: { value: 'Un concierto increíble' }
    });

    if (edadMinima !== null) {
      fireEvent.change(screen.getByLabelText(/edad mínima/i), {
        target: { value: edadMinima.toString() }
      });
    }
  };

  test('Flujo completo: Usuario crea evento SIN edad mínima', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        titulo: 'Concierto de Rock',
        restricciones: {
          edad_minima: null
        }
      })
    });

    render(<CreateEventForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    fillCompleteForm(null);
    
    const submitButton = screen.getByRole('button', { name: /crear evento/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/creando\.\.\./i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/events',
        expect.objectContaining({
          method: 'POST'
        })
      );
    });

    const sentData = JSON.parse(fetch.mock.calls[0][1].body);
    expect(sentData.restricciones.edad_minima).toBeNull();

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });

    const edadMinimaInput = screen.getByLabelText(/edad mínima/i);
    expect(edadMinimaInput.value).toBe('');
  });

  test('Flujo completo: Usuario crea evento CON edad mínima de 18 años', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 2,
        titulo: 'Concierto de Rock',
        restricciones: {
          edad_minima: 18
        }
      })
    });

    render(<CreateEventForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    fillCompleteForm(18);
    
    const submitButton = screen.getByRole('button', { name: /crear evento/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    const sentData = JSON.parse(fetch.mock.calls[0][1].body);
    expect(sentData.restricciones.edad_minima).toBe(18);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  test('Flujo de error: Usuario intenta crear evento con edad mínima negativa', async () => {
    render(<CreateEventForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    fillCompleteForm(-5);
    
    const submitButton = screen.getByRole('button', { name: /crear evento/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/la edad mínima debe ser 0 o mayor/i)).toBeInTheDocument();
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  test('Flujo de error: Usuario intenta crear evento con edad mínima > 120', async () => {
    render(<CreateEventForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    fillCompleteForm(150);
    
    const submitButton = screen.getByRole('button', { name: /crear evento/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/la edad mínima debe ser menor a 120/i)).toBeInTheDocument();
    });

    expect(fetch).not.toHaveBeenCalled();
  });

  test('Flujo de corrección: Usuario corrige edad mínima inválida', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 3 })
    });

    render(<CreateEventForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    fillCompleteForm(-10);
    
    const submitButton = screen.getByRole('button', { name: /crear evento/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/la edad mínima debe ser 0 o mayor/i)).toBeInTheDocument();
    });

    const edadMinimaInput = screen.getByLabelText(/edad mínima/i);
    fireEvent.change(edadMinimaInput, { target: { value: '21' } });

    await waitFor(() => {
      expect(screen.queryByText(/la edad mínima debe ser 0 o mayor/i)).not.toBeInTheDocument();
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  test('Flujo de backend error: Servidor rechaza la creación', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        message: 'La edad mínima no cumple con las políticas del servidor'
      })
    });

    render(<CreateEventForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    fillCompleteForm(18);
    
    const submitButton = screen.getByRole('button', { name: /crear evento/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/la edad mínima no cumple con las políticas del servidor/i)).toBeInTheDocument();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  test('Casos límite: Edad mínima de 0, 1, 119, 120 años', async () => {
    const edadesValidas = [0, 1, 119, 120];

    for (const edad of edadesValidas) {
      jest.clearAllMocks();
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: edad })
      });

      const { unmount } = render(
        <CreateEventForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      );
      
      fillCompleteForm(edad);
      
      const submitButton = screen.getByRole('button', { name: /crear evento/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });

      const sentData = JSON.parse(fetch.mock.calls[0][1].body);
      expect(sentData.restricciones.edad_minima).toBe(edad);
      
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });

      unmount();
    }
  });
});
