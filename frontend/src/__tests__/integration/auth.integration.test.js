/**
 * Tests de Integración - Flujos de Autenticación
 * 
 * Estos tests verifican que los componentes y servicios trabajen juntos
 * en flujos completos de usuario, mockeando solo las llamadas HTTP.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';
import RegisterPage from '../../pages/RegisterPage';

// Mock solo de axios (NO de los servicios)
jest.mock('axios');
import axios from 'axios';

describe('Tests de Integración - Autenticación', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Flujo de Login Completo', () => {
    test('debe completar el flujo de login: formulario → servicio → guardar token → redirección', async () => {
      // Mock de la respuesta del backend
      const mockBackendResponse = {
        data: {
          token: 'integration-test-token-123',
          userId: 1,
          username: 'testuser'
        }
      };

      axios.post.mockResolvedValue(mockBackendResponse);

      // Renderizar LoginPage con router
      const { container } = render(
        <MemoryRouter initialEntries={['/login']}>
          <LoginPage />
        </MemoryRouter>
      );

      // 1. Verificar que el formulario se renderiza
      expect(screen.getByLabelText(/nombre de usuario o correo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();

      // 2. Llenar el formulario
      const usernameInput = screen.getByLabelText(/nombre de usuario o correo/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await userEvent.type(usernameInput, 'testuser');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(submitButton);

      // 3. Verificar que se llama al backend con los datos correctos
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          expect.stringContaining('/auth/login'),
          {
            usernameOrEmail: 'testuser',
            password: 'password123'
          }
        );
      });

      // 4. Verificar que se guarda el token en localStorage
      // authService.login guarda 'token' y 'userId' (como string '1')
      // LoginPage.handleLoginSuccess también guarda 'authToken' y 'userId' (como número 1, se convierte a string '1')
      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe('integration-test-token-123');
      }, { timeout: 3000 });
      
      await waitFor(() => {
        expect(localStorage.getItem('authToken')).toBe('integration-test-token-123');
      }, { timeout: 3000 });
      
      // userId se guarda dos veces (authService y LoginPage), ambos como '1'
      await waitFor(() => {
        const userId = localStorage.getItem('userId');
        expect(userId).toBe('1');
      }, { timeout: 3000 });

      // 5. Verificar que se muestra mensaje de éxito
      // El mensaje es: "¡Bienvenido de nuevo, testuser!"
      const successMessage = await screen.findByText(/bienvenido de nuevo.*testuser/i, {}, { timeout: 3000 });
      expect(successMessage).toBeInTheDocument();
    });

    test('debe manejar errores del backend en el flujo de login', async () => {
      // Mock de error del backend
      const mockError = {
        response: {
          data: {
            message: 'Credenciales inválidas'
          },
          status: 401
        }
      };

      axios.post.mockRejectedValue(mockError);

      render(
        <MemoryRouter initialEntries={['/login']}>
          <LoginPage />
        </MemoryRouter>
      );

      const usernameInput = screen.getByLabelText(/nombre de usuario o correo/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await userEvent.type(usernameInput, 'wronguser');
      await userEvent.type(passwordInput, 'wrongpass');
      await userEvent.click(submitButton);

      // Verificar que se llama al backend (aunque falle)
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          expect.stringContaining('/auth/login'),
          {
            usernameOrEmail: 'wronguser',
            password: 'wrongpass'
          }
        );
      });

      // Verificar que se muestra el error del backend
      // authService.login retorna { success: false, error: 'Credenciales inválidas' }
      // LoginForm muestra el error en loginError (login-error-banner) y también llama onError
      // LoginPage.handleLoginError muestra el error en el message-banner
      // El error aparece en AMBOS lugares (LoginForm y LoginPage), así que hay múltiples elementos
      await waitFor(() => {
        const errorMessages = screen.getAllByText(/credenciales inválidas/i);
        expect(errorMessages.length).toBeGreaterThan(0);
        // Verificar que al menos uno está en el DOM
        expect(errorMessages[0]).toBeInTheDocument();
      }, { timeout: 3000 });

      // Verificar que NO se guarda token en localStorage
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('userId')).toBeNull();
    });
  });

  describe('Flujo de Registro Completo', () => {
    test('debe completar el flujo de registro: formulario → servicio → mensaje → redirección', async () => {
      // Mock de la respuesta del backend
      const mockBackendResponse = {
        data: {
          token: 'registration-token-456',
          userId: 2,
          username: 'newuser'
        }
      };

      axios.post.mockResolvedValue(mockBackendResponse);

      render(
        <MemoryRouter initialEntries={['/register']}>
          <RegisterPage />
        </MemoryRouter>
      );

      // 1. Llenar el formulario de registro
      await userEvent.type(screen.getByLabelText(/nombre \*/i), 'Nuevo');
      await userEvent.type(screen.getByLabelText(/apellidos \*/i), 'Usuario');
      await userEvent.type(screen.getByLabelText(/nombre de usuario \*/i), 'newuser');
      await userEvent.type(screen.getByLabelText(/correo electrónico \*/i), 'newuser@example.com');
      await userEvent.type(screen.getByLabelText(/fecha de nacimiento \*/i), '2000-01-01');
      await userEvent.type(screen.getByLabelText(/contraseña \*/i), 'Password123!');

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await userEvent.click(submitButton);

      // 2. Verificar que se llama al backend con los datos correctos
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          expect.stringContaining('/auth/signup'),
          expect.objectContaining({
            nombre: 'Nuevo',
            apellidos: 'Usuario',
            username: 'newuser',
            correo: 'newuser@example.com',
            fechaNacimiento: '2000-01-01',
            password: 'Password123!'
          })
        );
      });

      // 3. Verificar que se muestra mensaje de éxito
      // El mensaje es: "¡Cuenta creada exitosamente! Bienvenido newuser"
      const successMessage = await screen.findByText(/cuenta creada exitosamente/i, {}, { timeout: 3000 });
      expect(successMessage).toBeInTheDocument();
      const welcomeMessage = await screen.findByText(/bienvenido newuser/i, {}, { timeout: 3000 });
      expect(welcomeMessage).toBeInTheDocument();

      // 4. Verificar que se guarda el token (el servicio lo hace internamente)
      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe('registration-token-456');
        expect(localStorage.getItem('userId')).toBe('2');
      });
    });
  });
});

