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
  useTranslation: () => {
    const translations = {
      // SplashPage en catalán + botones en castellano
      'SplashPage.subtitle':
        "Gestiona els teus esdeveniments des d'un sol lloc. Col·labora amb el teu equip i inspira a nous participants.",
      'SplashPage.tagline': 'Organitza, comparteix i viu experiències',
      'SplashPage.title': 'EventManager',
      'SplashPage.loginButton': 'Iniciar sesión',
      'SplashPage.registerButton': 'Registrarse',
      'SplashPage.scrollButton': 'Qui som ↓',
      'SplashPage.about.title': 'Qui Som',
      'SplashPage.about.subtitle':
        'Un equip de desenvolupadors apassionats per crear solucions innovadores',

      // Claves de equipo (no se testean, pero evitamos undefined)
      'SplashPage.team.Anna.role': 'Rol Anna',
      'SplashPage.team.Anna.description': 'Descripció Anna',
      'SplashPage.team.Adrià.role': 'Rol Adrià',
      'SplashPage.team.Adrià.description': 'Descripció Adrià',
      'SplashPage.team.Sergi.role': 'Rol Sergi',
      'SplashPage.team.Sergi.description': 'Descripció Sergi',
      'SplashPage.team.Arnau.role': 'Rol Arnau',
      'SplashPage.team.Arnau.description': 'Descripció Arnau',
      'SplashPage.team.Chaofan.role': 'Rol Chaofan',
      'SplashPage.team.Chaofan.description': 'Descripció Chaofan',
      'SplashPage.team.Andrés.role': 'Rol Andrés',
      'SplashPage.team.Andrés.description': 'Descripció Andrés',
    };

    return {
      t: (key) => translations[key] || key,
    };
  },
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

    expect(screen.getByRole('heading', { level: 1, name: 'EventManager' })).toBeInTheDocument();
    expect(
      screen.getByText('Organitza, comparteix i viu experiències')
    ).toBeInTheDocument();
    expect(
        screen.getAllByText(/Gestiona els teus esdeveniments/i).length).toBeGreaterThan(0);
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

    const splashSection = container.querySelector('.splash');
    expect(splashSection).toBeInTheDocument();

    const overlay = container.querySelector('.splash__overlay');
    expect(overlay).toBeInTheDocument();

    const content = container.querySelector('.splash__content');
    expect(content).toBeInTheDocument();

    const buttons = container.querySelector('.splash__buttons');
    expect(buttons).toBeInTheDocument();
  });

  test('los botones tienen las clases CSS correctas', () => {
    render(
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <SplashPage />
      </BrowserRouter>
    );

    const loginButton = screen.getByRole('button', { name: /iniciar sesión/i });
    const signUpButton = screen.getByRole('button', { name: /registrarse/i });

    expect(loginButton).toHaveClass('splash__cta');
    expect(loginButton).toHaveClass('splash__cta--primary');

    expect(signUpButton).toHaveClass('splash__cta');
    expect(signUpButton).toHaveClass('splash__cta--secondary');
  });

  test('el título tiene la clase correcta', () => {
    render(
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <SplashPage />
      </BrowserRouter>
    );

    const titles = screen.getAllByText('EventManager');
    const title = titles[0]; // el del splash
    expect(title).toHaveClass('splash__title');
    expect(title.tagName).toBe('H1');
  });

  test('el tagline tiene la clase correcta', () => {
    render(
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <SplashPage />
      </BrowserRouter>
    );

    const tagline = screen.getByText('Organitza, comparteix i viu experiències');
    expect(tagline).toHaveClass('splash__tagline');
    expect(tagline.tagName).toBe('P');
  });

  test('el subtítulo tiene la clase correcta', () => {
    render(
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <SplashPage />
      </BrowserRouter>
    );

    const subtitles = screen.getAllByText(/Gestiona els teus esdeveniments/i);
    const subtitle = subtitles[0]; // el del splash

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

    expect(screen.getByText(/Organitza/i)).toBeInTheDocument();
    expect(screen.getByText(/comparteix/i)).toBeInTheDocument();
    expect(screen.getByText(/viu experiències/i)).toBeInTheDocument();

    // Verificar texto en catalán en subtitle
    expect(screen.getAllByText(/Gestiona els teus esdeveniments/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Col·labora amb el teu equip/i).length).toBeGreaterThan(0);
  });


});
