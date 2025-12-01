import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';

import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import MyEventsPage from './pages/MyEventsPage';
import EventPage from './pages/EventPage';
import ProfilePage from './pages/ProfilePage';
import SplashPage from './pages/SplashPage';
import NavBar from './components/layout/NavBar';
import userService from './services/userService';
import './styles/App.css';

// Tema por defecto
const DEFAULT_THEME = 'default';

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
      
      // Si no hay usuario logueado, usar tema estándar
      if (!userId) {
        setCurrentTheme(DEFAULT_THEME);
        applyTheme(DEFAULT_THEME);
        return;
      }

      try {
        // Primero intentar cargar desde localStorage (cache rápido)
        const cachedTheme = localStorage.getItem('profileTheme');
        if (cachedTheme) {
          setCurrentTheme(cachedTheme);
          applyTheme(cachedTheme);
        }

        // Luego cargar desde API para sincronizar
        const result = await userService.getTema(userId);
        if (result.success && result.data?.tema) {
          const themeName = result.data.tema;
          setCurrentTheme(themeName);
          localStorage.setItem('profileTheme', themeName);
          applyTheme(themeName);
        }
      } catch (error) {
        console.error('Error cargando tema:', error);
        // Usar tema por defecto si hay error
        setCurrentTheme(DEFAULT_THEME);
        applyTheme(DEFAULT_THEME);
      }
    };

    loadTheme();
  }, [location.pathname]);

  // Escuchar cambios de tema desde ProfilePage (mismo tab)
  useEffect(() => {
    const handleThemeChange = (e) => {
      const newTheme = e.detail?.theme;
      if (newTheme) {
        setCurrentTheme(newTheme);
        applyTheme(newTheme);
      }
    };

    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  // Escuchar cambios en localStorage (para sincronizar tema entre pestañas)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'profileTheme' && e.newValue) {
        setCurrentTheme(e.newValue);
        applyTheme(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="App" data-theme={currentTheme}>
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas CON NavBar */}
        <Route element={<WithNavLayout />}>
          <Route path="/home" element={<Navigate to="/events" replace />} />
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