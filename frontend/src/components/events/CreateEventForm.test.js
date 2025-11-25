import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateEventForm from './CreateEventForm';
import * as eventService from '../../services/eventService';

jest.mock('../../services/eventService');

describe('CreateEventForm - Edad Mínima', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === 'userId') return '123';
      if (key === 'authToken') return 'mock-token';
      return null;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const fillBasicForm = () => {
    fireEvent.change(screen.getByLabelText(/título del evento/i), {
      target: { value: 'Evento de prueba' }
    });
    
    fireEvent.change(screen.getByLabelText(/fecha/i), {
      target: { value: '2025-12-31' }
    });
    
    fireEvent.change(screen.getByLabelText(/hora/i), {
      target: { value: '18:00' }
    });
    
    fireEvent.change(screen.getByLabelText(/idioma/i), {
      target: { value: 'es' }
    });
    
    fireEvent.change(screen.getByLabelText(/plazas disponibles/i), {
      target: { value: '10' }
    });
    
    fireEvent.change(screen.getByLabelText(/lugar/i), {
      target: { value: 'Barcelona' }
    });

    fireEvent.change(screen.getByLabelText(/etiquetas/i), {
      target: { value: 'turismo' }
    });
  };

  test('muestra el campo de edad mínima como opcional', () => {
    render(<CreateEventForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    const edadMinimaLabel = screen.getByLabelText(/edad mínima/i);
    expect(edadMinimaLabel).toBeInTheDocument();
    expect(screen.getByText(/edad mínima \(opcional\)/i)).toBeInTheDocument();
  });

  test('permite crear evento sin especificar edad mínima', async () => {
    eventService.createEvent.mockResolvedValue({ id: 1, titulo: 'Evento de prueba' });

    render(<CreateEventForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    fillBasicForm();
    
    const submitButton = screen.getByRole('button', { name: /crear evento/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(eventService.createEvent).toHaveBeenCalled();
    });

    const callArgs = eventService.createEvent.mock.calls[0][0];
    expect(callArgs.restricciones.edad_minima).toBeNull();
  });

  test('acepta edad mínima de 0 años', async () => {
    eventService.createEvent.mockResolvedValue({ id: 1, titulo: 'Evento de prueba' });

    render(<CreateEventForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    fillBasicForm();
    
    const edadMinimaInput = screen.getByLabelText(/edad mínima/i);
    fireEvent.change(edadMinimaInput, { target: { value: '0' } });
    
    const submitButton = screen.getByRole('button', { name: /crear evento/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(eventService.createEvent).toHaveBeenCalled();
    });

    const callArgs = eventService.createEvent.mock.calls[0][0];
    expect(callArgs.restricciones.edad_minima).toBe(0);
  });

  test('acepta edad mínima válida (18 años)', async () => {
    eventService.createEvent.mockResolvedValue({ id: 1, titulo: 'Evento de prueba' });

    render(<CreateEventForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    fillBasicForm();
    
    const edadMinimaInput = screen.getByLabelText(/edad mínima/i);
    fireEvent.change(edadMinimaInput, { target: { value: '18' } });
    
    const submitButton = screen.getByRole('button', { name: /crear evento/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(eventService.createEvent).toHaveBeenCalled();
    });

    const callArgs = eventService.createEvent.mock.calls[0][0];
    expect(callArgs.restricciones.edad_minima).toBe(18);
  });

  test('rechaza edad mínima negativa', async () => {
    render(<CreateEventForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    fillBasicForm();
    
    const edadMinimaInput = screen.getByLabelText(/edad mínima/i);
    fireEvent.change(edadMinimaInput, { target: { value: '-5' } });
    
    const submitButton = screen.getByRole('button', { name: /crear evento/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/la edad mínima debe ser 0 o mayor/i)).toBeInTheDocument();
    });

    expect(eventService.createEvent).not.toHaveBeenCalled();
  });

  test('rechaza edad mínima mayor a 120 años', async () => {
    render(<CreateEventForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    fillBasicForm();
    
    const edadMinimaInput = screen.getByLabelText(/edad mínima/i);
    fireEvent.change(edadMinimaInput, { target: { value: '150' } });
    
    const submitButton = screen.getByRole('button', { name: /crear evento/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/la edad mínima debe ser menor a 120/i)).toBeInTheDocument();
    });

    expect(eventService.createEvent).not.toHaveBeenCalled();
  });

  test('acepta edad mínima en el límite superior (120 años)', async () => {
    eventService.createEvent.mockResolvedValue({ id: 1, titulo: 'Evento de prueba' });

    render(<CreateEventForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    fillBasicForm();
    
    const edadMinimaInput = screen.getByLabelText(/edad mínima/i);
    fireEvent.change(edadMinimaInput, { target: { value: '120' } });
    
    const submitButton = screen.getByRole('button', { name: /crear evento/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(eventService.createEvent).toHaveBeenCalled();
    });

    const callArgs = eventService.createEvent.mock.calls[0][0];
    expect(callArgs.restricciones.edad_minima).toBe(120);
  });

  test('limpia el error de edad mínima cuando el usuario corrige el valor', async () => {
    render(<CreateEventForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    fillBasicForm();
    
    const edadMinimaInput = screen.getByLabelText(/edad mínima/i);
    
    fireEvent.change(edadMinimaInput, { target: { value: '-5' } });
    
    const submitButton = screen.getByRole('button', { name: /crear evento/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/la edad mínima debe ser 0 o mayor/i)).toBeInTheDocument();
    });

    fireEvent.change(edadMinimaInput, { target: { value: '18' } });

    await waitFor(() => {
      expect(screen.queryByText(/la edad mínima debe ser 0 o mayor/i)).not.toBeInTheDocument();
    });
  });

  test('el campo tiene atributos min y max correctos', () => {
    render(<CreateEventForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    const edadMinimaInput = screen.getByLabelText(/edad mínima/i);
    
    expect(edadMinimaInput).toHaveAttribute('type', 'number');
    expect(edadMinimaInput).toHaveAttribute('min', '0');
    expect(edadMinimaInput).toHaveAttribute('max', '120');
  });

  test('resetea el campo de edad mínima al cerrar el formulario exitosamente', async () => {
    eventService.createEvent.mockResolvedValue({ id: 1, titulo: 'Evento de prueba' });

    render(<CreateEventForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    fillBasicForm();
    
    const edadMinimaInput = screen.getByLabelText(/edad mínima/i);
    fireEvent.change(edadMinimaInput, { target: { value: '21' } });
    
    const submitButton = screen.getByRole('button', { name: /crear evento/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(eventService.createEvent).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
    });

    expect(edadMinimaInput.value).toBe('');
  });

  test('envía datos correctos al backend con edad mínima', async () => {
    eventService.createEvent.mockResolvedValue({ id: 1, titulo: 'Evento de prueba' });

    render(<CreateEventForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    fillBasicForm();
    
    fireEvent.change(screen.getByLabelText(/edad mínima/i), {
      target: { value: '25' }
    });

    fireEvent.change(screen.getByLabelText(/descripción/i), {
      target: { value: 'Evento para adultos' }
    });
    
    const submitButton = screen.getByRole('button', { name: /crear evento/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(eventService.createEvent).toHaveBeenCalledWith({
        titulo: 'Evento de prueba',
        descripcion: 'Evento para adultos',
        etiquetas: 'turismo',
        fecha: '2025-12-31',
        hora: '18:00',
        lugar: 'Barcelona',
        restricciones: {
          idiomasRequerido: ['es'],
          plazasDisponibles: 10,
          edad_minima: 25
        }
      });
    });
  });

  test('muestra error cuando falla la creación del evento', async () => {
    eventService.createEvent.mockRejectedValue(new Error('Error del servidor'));

    render(<CreateEventForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    fillBasicForm();
    
    const submitButton = screen.getByRole('button', { name: /crear evento/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/error del servidor/i)).toBeInTheDocument();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
