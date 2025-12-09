import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from '../LoginForm';
import authService from '../../../services/authService';

// 🔹 Mock react-i18next alineado con LoginForm
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        // Títulos
        'Login.title': 'Iniciar Sesión',
        'Login.subtitle': 'Accede a tu cuenta de eventos',

        // Campos
        'Login.fields.usernameOrEmail': 'Nombre de Usuario o Correo',
        'Login.fields.placeholderUsernameOrEmail': 'Introduce tu nombre de usuario o correo',
        'Login.fields.password': 'Contraseña',
        'Login.fields.placeholderPassword': 'Introduce tu contraseña',

        // Botones
        'Login.button.login': 'Iniciar Sesión',
        'Login.button.loading': 'Iniciando sesión...',

        // Registro
        'Login.register.question': '¿No tienes una cuenta?',
        'Login.register.link': 'Registrate aqui',

        // Errores
        'Login.errors.usernameOrEmailRequired': 'El nombre de usuario o correo es requerido',
        'Login.errors.passwordRequired': 'La contraseña es requerida',
        'Login.errors.unexpected': 'Error inesperado al iniciar sesión. Por favor, intenta de nuevo.'
      };

      return translations[key] || key;
    },
    i18n: { language: 'es', changeLanguage: () => Promise.resolve() }
  })
}));

// Mock del servicio de autenticación
jest.mock('../../../services/authService', () => ({
  __esModule: true,
  default: {
    signUp: jest.fn(),
    login: jest.fn(),
    logout: jest.fn()
  }
}));

// Wrapper para incluir el router (LoginForm usa <Link>)
const renderWithRouter = (ui) => {
  return render(
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      {ui}
    </BrowserRouter>
  );
};

describe('LoginForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Renderizado inicial', () => {
    test('debe renderizar el formulario con todos los campos', () => {
      renderWithRouter(<LoginForm />);

      expect(screen.getByLabelText(/nombre de usuario o correo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
    });

    test('debe mostrar el enlace de registro', () => {
      renderWithRouter(<LoginForm />);

      expect(screen.getByText(/no tienes una cuenta/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /registrate aqui/i })).toBeInTheDocument();
    });
  });

  describe('Validación de formulario', () => {
    test('debe mostrar error cuando el campo usuario está vacío', async () => {
      renderWithRouter(<LoginForm />);

      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/el nombre de usuario o correo es requerido/i)
        ).toBeInTheDocument();
      });
    });

    test('debe mostrar error cuando el campo contraseña está vacío', async () => {
      renderWithRouter(<LoginForm />);

      const usernameInput = screen.getByLabelText(/nombre de usuario o correo/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await userEvent.type(usernameInput, 'testuser');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/la contraseña es requerida/i)).toBeInTheDocument();
      });
    });

    test('debe limpiar errores cuando el usuario empieza a escribir', async () => {
      renderWithRouter(<LoginForm />);

      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      await userEvent.click(submitButton);

      // Esperar a que aparezca el error
      await waitFor(() => {
        expect(
          screen.getByText(/el nombre de usuario o correo es requerido/i)
        ).toBeInTheDocument();
      });

      // Escribir en el campo debería limpiar el error
      const usernameInput = screen.getByLabelText(/nombre de usuario o correo/i);
      await userEvent.type(usernameInput, 'test');

      await waitFor(() => {
        expect(
          screen.queryByText(/el nombre de usuario o correo es requerido/i)
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Envío del formulario', () => {
    test('debe llamar a authService.login con los datos correctos', async () => {
      authService.login.mockResolvedValue({
        success: true,
        data: { token: 'test-token', userId: 1, username: 'testuser' }
      });

      renderWithRouter(<LoginForm onSuccess={mockOnSuccess} />);

      const usernameInput = screen.getByLabelText(/nombre de usuario o correo/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await userEvent.type(usernameInput, 'testuser');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith({
          usernameOrEmail: 'testuser',
          password: 'password123'
        });
      });
    });

    test('debe llamar a onSuccess cuando el login es exitoso', async () => {
      const mockData = { token: 'test-token', userId: 1, username: 'testuser' };
      authService.login.mockResolvedValue({
        success: true,
        data: mockData
      });

      renderWithRouter(<LoginForm onSuccess={mockOnSuccess} />);

      const usernameInput = screen.getByLabelText(/nombre de usuario o correo/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await userEvent.type(usernameInput, 'testuser');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(mockData);
      });
    });

    test('debe mostrar error cuando el login falla', async () => {
      const errorMessage = 'Credenciales inválidas';
      authService.login.mockResolvedValue({
        success: false,
        error: errorMessage
      });

      renderWithRouter(<LoginForm onError={mockOnError} />);

      const usernameInput = screen.getByLabelText(/nombre de usuario o correo/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await userEvent.type(usernameInput, 'testuser');
      await userEvent.type(passwordInput, 'wrongpassword');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(mockOnError).toHaveBeenCalledWith(errorMessage);
      });
    });

    test('debe mostrar mensaje de error cuando hay una excepción', async () => {
      authService.login.mockRejectedValue(new Error('Network Error'));

      renderWithRouter(<LoginForm onError={mockOnError} />);

      const usernameInput = screen.getByLabelText(/nombre de usuario o correo/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await userEvent.type(usernameInput, 'testuser');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/error inesperado al iniciar sesión/i)
        ).toBeInTheDocument();
        expect(mockOnError).toHaveBeenCalled();
      });
    });

    test('debe deshabilitar el botón y mostrar "Iniciando sesión..." durante el proceso', async () => {
      // Simular un delay en la respuesta
      authService.login.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  success: true,
                  data: { token: 'test-token', userId: 1 }
                }),
              100
            )
          )
      );

      renderWithRouter(<LoginForm />);

      const usernameInput = screen.getByLabelText(/nombre de usuario o correo/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await userEvent.type(usernameInput, 'testuser');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(submitButton);

      // Verificar que el botón está deshabilitado
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      }, { timeout: 1000 });

      // Verificar texto de carga
      expect(screen.getByText(/iniciando sesión/i)).toBeInTheDocument();

      // Esperar a que termine
      await waitFor(
        () => {
          expect(submitButton).not.toBeDisabled();
        },
        { timeout: 1000 }
      );
    });
  });

  describe('Interacción con inputs', () => {
    test('debe actualizar el valor del input cuando el usuario escribe', async () => {
      renderWithRouter(<LoginForm />);

      const usernameInput = screen.getByLabelText(/nombre de usuario o correo/i);

      await userEvent.type(usernameInput, 'testuser');

      expect(usernameInput).toHaveValue('testuser');
    });

    test('debe deshabilitar inputs durante el proceso de login', async () => {
      authService.login.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  success: true,
                  data: { token: 'test-token', userId: 1 }
                }),
              100
            )
          )
      );

      renderWithRouter(<LoginForm />);

      const usernameInput = screen.getByLabelText(/nombre de usuario o correo/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await userEvent.type(usernameInput, 'testuser');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(submitButton);

      // Inputs deshabilitados durante la carga
      await waitFor(() => {
        expect(usernameInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
      }, { timeout: 1000 });
    });
  });
});
