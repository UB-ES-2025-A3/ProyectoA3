import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import SplashPage from './SplashPage';

// 🔹 Mock de useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// 🔹 Mock de i18n para SplashPage
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      // 👇 OJO AL ORDEN: primero subtitle, luego tagline, luego title
      if (/subtitle/i.test(key)) {
        return "Gestiona els teus esdeveniments des d'un sol lloc. Col·labora amb el teu equip i inspira a nous participants.";
      }
      if (/tagline/i.test(key)) {
        return "Organitza, comparteix i viu experiències";
      }
      if (/title/i.test(key)) {
        return "EventManager";
      }
      if (/login/i.test(key)) {
        return "Iniciar sesión";
      }
      if (/register/i.test(key)) {
        return "Registrarse";
      }
      return key;
    },
    i18n: { language: 'ca', changeLanguage: () => Promise.resolve() },
  }),
}));

describe('SplashPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('renderiza correctamente todos los elementos', () => {
    render(
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <SplashPage />
      </BrowserRouter>
    );

    expect(screen.getByText('EventManager')).toBeInTheDocument();
    expect(
      screen.getByText('Organitza, comparteix i viu experiències')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Gestiona els teus esdeveniments des d'un sol lloc/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrarse/i })).toBeInTheDocument();
  });

  test('el botón de Iniciar Sesión navega a /login', () => {
    render(
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <SplashPage />
      </BrowserRouter>
    );

    const loginButton = screen.getByRole('button', { name: /iniciar sesión/i });
    fireEvent.click(loginButton);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('el botón de Registrarse navega a /register', () => {
    render(
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <SplashPage />
      </BrowserRouter>
    );

    const signUpButton = screen.getByRole('button', { name: /registrarse/i });
    fireEvent.click(signUpButton);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  test('tiene la estructura de clases CSS correcta', () => {
    const { container } = render(
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <SplashPage />
      </BrowserRouter>
    );

    // Verificar que existe la sección splash
    const splashSection = container.querySelector('.splash');
    expect(splashSection).toBeInTheDocument();

    // Verificar que existe el overlay
    const overlay = container.querySelector('.splash__overlay');
    expect(overlay).toBeInTheDocument();

    // Verificar que existe el contenedor de contenido
    const content = container.querySelector('.splash__content');
    expect(content).toBeInTheDocument();

    // Verificar que existe el contenedor de botones
    const buttons = container.querySelector('.splash__buttons');
    expect(buttons).toBeInTheDocument();
  });

  test('los botones tienen las clases CSS correctas', () => {
    const { container } = render(
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <SplashPage />
      </BrowserRouter>
    );

    const loginButton = screen.getByRole('button', { name: /iniciar sesión/i });
    const signUpButton = screen.getByRole('button', { name: /registrarse/i });

    // Verificar clases del botón de login (primario)
    expect(loginButton).toHaveClass('splash__cta');
    expect(loginButton).toHaveClass('splash__cta--primary');

    // Verificar clases del botón de registro (secundario)
    expect(signUpButton).toHaveClass('splash__cta');
    expect(signUpButton).toHaveClass('splash__cta--secondary');
  });

  test('el título tiene la clase correcta', () => {
    const { container } = render(
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <SplashPage />
      </BrowserRouter>
    );

    const title = screen.getByText('EventManager');
    expect(title).toHaveClass('splash__title');
    expect(title.tagName).toBe('H1');
  });

  test('el tagline tiene la clase correcta', () => {
    const { container } = render(
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <SplashPage />
      </BrowserRouter>
    );

    const tagline = screen.getByText('Organitza, comparteix i viu experiències');
    expect(tagline).toHaveClass('splash__tagline');
    expect(tagline.tagName).toBe('P');
  });

  test('el subtítulo tiene la clase correcta', () => {
    const { container } = render(
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <SplashPage />
      </BrowserRouter>
    );

    const subtitle = screen.getByText(/Gestiona els teus esdeveniments/i);
    expect(subtitle).toHaveClass('splash__subtitle');
    expect(subtitle.tagName).toBe('P');
  });

  test('los botones son accesibles mediante teclado', () => {
    render(
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <SplashPage />
      </BrowserRouter>
    );

    const loginButton = screen.getByRole('button', { name: /iniciar sesión/i });
    const signUpButton = screen.getByRole('button', { name: /registrarse/i });

    // Verificar que los botones pueden recibir foco
    loginButton.focus();
    expect(document.activeElement).toBe(loginButton);

    signUpButton.focus();
    expect(document.activeElement).toBe(signUpButton);
  });

  test('no navega si los botones no reciben click', () => {
    render(
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <SplashPage />
      </BrowserRouter>
    );

    // Verificar que navigate no se llama sin interacción
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('múltiples clics en el mismo botón llaman a navigate múltiples veces', () => {
    render(
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <SplashPage />
      </BrowserRouter>
    );

    const loginButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.click(loginButton);
    fireEvent.click(loginButton);
    fireEvent.click(loginButton);

    expect(mockNavigate).toHaveBeenCalledTimes(3);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('el contenido textual está en catalán', () => {
    render(
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <SplashPage />
      </BrowserRouter>
    );

    // Verificar texto en catalán en tagline
    expect(screen.getByText(/Organitza/i)).toBeInTheDocument();
    expect(screen.getByText(/comparteix/i)).toBeInTheDocument();
    expect(screen.getByText(/viu experiències/i)).toBeInTheDocument();

    // Verificar texto en catalán en subtitle
    expect(screen.getByText(/Gestiona els teus esdeveniments/i)).toBeInTheDocument();
    expect(screen.getByText(/Col·labora amb el teu equip/i)).toBeInTheDocument();
  });

  test('snapshot test - verifica que no haya cambios inesperados en la UI', () => {
    const { container } = render(
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <SplashPage />
      </BrowserRouter>
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
