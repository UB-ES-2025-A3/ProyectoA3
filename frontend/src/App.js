import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';

import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import MyEventsPage from './pages/MyEventsPage';
import EventPage from './pages/EventPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import SplashPage from './pages/SplashPage';
import NavBar from './components/layout/NavBar';
import userService from './services/userService';
import './styles/App.css';

// Tema por defecto
const DEFAULT_THEME = 'default';

// (opcional) podrías alinear esto con VALID_THEMES de los tests si quieres validar
const VALID_THEMES = ['default', 'blue', 'green', 'purple', 'orange', 'pink', 'dark'];

// Función para aplicar el tema al documento
const applyTheme = (themeName) => {
  document.documentElement.setAttribute('data-theme', themeName);
};

// Layout que muestra el NavBar y un Outlet para las rutas hijas
function WithNavLayout() {
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  );
}

function App() {
  const [currentTheme, setCurrentTheme] = useState(DEFAULT_THEME);
  const location = useLocation();

  // Cargar tema al iniciar y cuando cambie la ruta (para detectar cambios de usuario)
  useEffect(() => {
    const loadTheme = async () => {
      const userId = localStorage.getItem('userId');

      // 🔹 1. Si no hay usuario logueado, usar tema estándar y NO llamar a la API
      if (!userId) {
        setCurrentTheme(DEFAULT_THEME);
        applyTheme(DEFAULT_THEME);
        return;
      }

      // 🔹 2. Si hay tema cacheado en localStorage, úsalo mientras la API responde
      const cachedTheme = localStorage.getItem('profileTheme');
      if (cachedTheme && VALID_THEMES.includes(cachedTheme)) {
        setCurrentTheme(cachedTheme);
        applyTheme(cachedTheme);
      }

      try {
        // 🔹 3. Cargar tema desde la API
        const result = await userService.getTema(userId);

        if (result?.success) {
          const themeName =
            (typeof result.data === 'string' && result.data) ||
            result.data?.tema;

          const finalTheme =
            themeName && VALID_THEMES.includes(themeName)
              ? themeName
              : DEFAULT_THEME;

          // Actualizar estado + atributo + cache
          setCurrentTheme(finalTheme);
          applyTheme(finalTheme);
          localStorage.setItem('profileTheme', finalTheme); // <- esto hace pasar el test de "guarda tema"
        } else {
          // Si la API responde con success: false → tema por defecto
          setCurrentTheme(DEFAULT_THEME);
          applyTheme(DEFAULT_THEME);
        }
      } catch (error) {
        console.error('Error cargando tema:', error);

        // 🔹 4. Si falla la API:
        //    - Si ya había tema cacheado, lo dejamos
        //    - Si no, usamos default (caso del test "usa tema por defecto si falla la carga")
        if (!cachedTheme || !VALID_THEMES.includes(cachedTheme)) {
          setCurrentTheme(DEFAULT_THEME);
          applyTheme(DEFAULT_THEME);
        }
      }
    };

    loadTheme();
  }, [location.pathname]);

  // Escuchar cambios de tema desde ProfilePage (mismo tab)
  useEffect(() => {
    const handleThemeChange = (e) => {
      const newTheme = e.detail?.theme;
      if (newTheme && VALID_THEMES.includes(newTheme)) {
        setCurrentTheme(newTheme);
        applyTheme(newTheme);
        localStorage.setItem('profileTheme', newTheme);
      }
    };

    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  return (
    <div className="App" data-theme={currentTheme}>
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas CON NavBar */}
        <Route element={<WithNavLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/events" element={<EventPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-events" element={<MyEventsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
