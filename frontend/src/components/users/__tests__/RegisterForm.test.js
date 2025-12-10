import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import RegisterForm from '../RegisterForm';
import authService from '../../../services/authService';

// 🔹 Mock react-i18next alineado con RegisterForm
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        // Título / subtítulo
        'Register.title': 'Crear Cuenta',
        'Register.subtitle': 'Únete a nuestra plataforma de eventos',

        // Campos
        'Register.fields.nombre': 'Nombre',
        'Register.fields.apellidos': 'Apellidos',
        'Register.fields.username': 'Nombre de Usuario',
        'Register.fields.correo': 'Correo Electrónico',
        'Register.fields.fechaNacimiento': 'Fecha de Nacimiento',
        'Register.fields.ciudad': 'Ciudad',
        'Register.fields.idioma': 'Idioma(s) Hablado(s)',
        'Register.fields.placeholderNombre': 'Introduce tu nombre',
        'Register.fields.placeholderApellidos': 'Introduce tus apellidos',
        'Register.fields.placeholderUsername': 'Elige un nombre de usuario',
        'Register.fields.placeholderCorreo': 'Introduce tu correo electrónico',
        'Register.fields.placeholderCiudad': 'Introduce tu ciudad',
        'Register.fields.idiomaPlaceholder': 'Selecciona idiomas',

        // Idiomas
        'Register.languages.es': 'Español',
        'Register.languages.en': 'Inglés',
        'Register.languages.fr': 'Francés',
        'Register.languages.de': 'Alemán',
        'Register.languages.it': 'Italiano',
        'Register.languages.pt': 'Portugués',
        'Register.languages.ru': 'Ruso',

        // Password
        'Register.password.label': 'Contraseña',
        'Register.password.placeholder': 'Introduce tu contraseña',
        'Register.password.requirementsTitle': 'La contraseña debe incluir:',
        'Register.password.requirements.length': 'Al menos 6 caracteres',
        'Register.password.requirements.uppercase': 'Una letra mayúscula',
        'Register.password.requirements.lowercase': 'Una letra minúscula',
        'Register.password.requirements.number': 'Un número',
        'Register.password.requirements.specialChar': 'Un carácter especial',

        // Botones
        'Register.button.submit': 'Crear Cuenta',
        'Register.button.loading': 'Creando cuenta...',

        // Footer
        'Register.footer.question': '¿Ya tienes una cuenta?',
        'Register.footer.link': 'Inicia sesión aquí',

        // Errores
        'Register.errors.nombreRequired': 'El nombre es requerido',
        'Register.errors.apellidosRequired': 'Los apellidos son requeridos',
        'Register.errors.usernameRequired': 'El nombre de usuario es requerido',
        'Register.errors.correoRequired': 'El correo es requerido',
        'Register.errors.correoInvalid': 'El correo no es válido',
        'Register.errors.fechaNacimientoRequired': 'La fecha de nacimiento es requerida',
        'Register.errors.passwordRequired': 'La contraseña es requerida',
        'Register.errors.passwordRequirements': 'La contraseña no cumple con los requisitos mínimos',
        'Register.errors.unexpected': 'Error inesperado al registrarse. Por favor, inténtalo de nuevo.'
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

// Wrapper para incluir el router (RegisterForm usa Link)
const renderWithRouter = (ui) => {
  return render(
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      {ui}
    </BrowserRouter>
  );
};

describe('RegisterForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Renderizado inicial', () => {
    test('debe renderizar el formulario con todos los campos requeridos', () => {
      renderWithRouter(<RegisterForm />);

      expect(screen.getByLabelText(/nombre \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/apellidos \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/nombre de usuario \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/correo electrónico \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/fecha de nacimiento \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/contraseña \*/i)).toBeInTheDocument();
    });

    test('debe mostrar campos opcionales (ciudad e idioma)', () => {
      renderWithRouter(<RegisterForm />);

      expect(screen.getByLabelText(/ciudad/i)).toBeInTheDocument();
      // El campo idioma es un dropdown personalizado sin input asociado, buscar por texto del label
      expect(screen.getByText(/idioma\(s\) hablado\(s\)/i)).toBeInTheDocument();
    });

    test('debe mostrar el enlace de login', () => {
      renderWithRouter(<RegisterForm />);

      expect(screen.getByText(/¿ya tienes una cuenta\?/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /inicia sesión aquí/i })).toBeInTheDocument();
    });

    test('debe mostrar los requisitos de contraseña', () => {
      renderWithRouter(<RegisterForm />);

      expect(screen.getByText(/la contraseña debe incluir:/i)).toBeInTheDocument();
      expect(screen.getByText(/al menos 6 caracteres/i)).toBeInTheDocument();
      expect(screen.getByText(/una letra mayúscula/i)).toBeInTheDocument();
      expect(screen.getByText(/una letra minúscula/i)).toBeInTheDocument();
      expect(screen.getByText(/un número/i)).toBeInTheDocument();
      expect(screen.getByText(/un carácter especial/i)).toBeInTheDocument();
    });
  });

  describe('Validación de formulario', () => {
    test('debe mostrar error cuando el campo nombre está vacío', async () => {
      renderWithRouter(<RegisterForm />);

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/el nombre es requerido/i)).toBeInTheDocument();
      });
    });

    test('debe mostrar error cuando el campo correo no es válido', async () => {
      renderWithRouter(<RegisterForm />);

      const correoInput = screen.getByLabelText(/correo electrónico \*/i);
      await userEvent.type(correoInput, 'correo-invalido');

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/el correo no es válido/i)).toBeInTheDocument();
      });
    });

    test('debe validar requisitos de contraseña', async () => {
      renderWithRouter(<RegisterForm />);

      const passwordInput = screen.getByLabelText(/contraseña \*/i);
      await userEvent.type(passwordInput, 'weak');

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/la contraseña no cumple con los requisitos mínimos/i)
        ).toBeInTheDocument();
      });
    });

    test('debe limpiar errores cuando el usuario empieza a escribir', async () => {
      renderWithRouter(<RegisterForm />);

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/el nombre es requerido/i)).toBeInTheDocument();
      });

      const nombreInput = screen.getByLabelText(/nombre \*/i);
      await userEvent.type(nombreInput, 'Test');

      await waitFor(() => {
        expect(screen.queryByText(/el nombre es requerido/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Envío del formulario', () => {
    test('debe llamar a authService.signUp con los datos correctos', async () => {
      authService.signUp.mockResolvedValue({
        success: true,
        data: { token: 'test-token', userId: 1, username: 'testuser' }
      });

      renderWithRouter(<RegisterForm onSuccess={mockOnSuccess} />);

      // Llenar todos los campos requeridos
      await userEvent.type(screen.getByLabelText(/nombre \*/i), 'Test');
      await userEvent.type(screen.getByLabelText(/apellidos \*/i), 'User');
      await userEvent.type(screen.getByLabelText(/nombre de usuario \*/i), 'testuser');
      await userEvent.type(screen.getByLabelText(/correo electrónico \*/i), 'test@example.com');
      await userEvent.type(screen.getByLabelText(/fecha de nacimiento \*/i), '2000-01-01');
      await userEvent.type(screen.getByLabelText(/contraseña \*/i), 'Password123!');

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(authService.signUp).toHaveBeenCalledWith({
          nombre: 'Test',
          apellidos: 'User',
          username: 'testuser',
          correo: 'test@example.com',
          fechaNacimiento: '2000-01-01',
          ciudad: '',
          idioma: [], // El backend espera List<String>, no string
          password: 'Password123!'
        });
      });
    });

    test('debe llamar a onSuccess cuando el registro es exitoso', async () => {
      const mockData = { token: 'test-token', userId: 1, username: 'testuser' };
      authService.signUp.mockResolvedValue({
        success: true,
        data: mockData
      });

      renderWithRouter(<RegisterForm onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/nombre \*/i), 'Test');
      await userEvent.type(screen.getByLabelText(/apellidos \*/i), 'User');
      await userEvent.type(screen.getByLabelText(/nombre de usuario \*/i), 'testuser');
      await userEvent.type(screen.getByLabelText(/correo electrónico \*/i), 'test@example.com');
      await userEvent.type(screen.getByLabelText(/fecha de nacimiento \*/i), '2000-01-01');
      await userEvent.type(screen.getByLabelText(/contraseña \*/i), 'Password123!');

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(mockData);
      });
    });

    test('debe llamar a onError cuando el registro falla', async () => {
      const errorMessage = 'El usuario ya existe';
      authService.signUp.mockResolvedValue({
        success: false,
        error: errorMessage
      });

      renderWithRouter(<RegisterForm onError={mockOnError} />);

      await userEvent.type(screen.getByLabelText(/nombre \*/i), 'Test');
      await userEvent.type(screen.getByLabelText(/apellidos \*/i), 'User');
      await userEvent.type(screen.getByLabelText(/nombre de usuario \*/i), 'testuser');
      await userEvent.type(screen.getByLabelText(/correo electrónico \*/i), 'test@example.com');
      await userEvent.type(screen.getByLabelText(/fecha de nacimiento \*/i), '2000-01-01');
      await userEvent.type(screen.getByLabelText(/contraseña \*/i), 'Password123!');

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(errorMessage);
      });
    });

    test('debe mostrar estado de carga durante el registro', async () => {
      authService.signUp.mockImplementation(
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

      renderWithRouter(<RegisterForm />);

      await userEvent.type(screen.getByLabelText(/nombre \*/i), 'Test');
      await userEvent.type(screen.getByLabelText(/apellidos \*/i), 'User');
      await userEvent.type(screen.getByLabelText(/nombre de usuario \*/i), 'testuser');
      await userEvent.type(screen.getByLabelText(/correo electrónico \*/i), 'test@example.com');
      await userEvent.type(screen.getByLabelText(/fecha de nacimiento \*/i), '2000-01-01');
      await userEvent.type(screen.getByLabelText(/contraseña \*/i), 'Password123!');

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(screen.getByText(/creando cuenta.../i)).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });
});
