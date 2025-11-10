import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import MyEventsPage from './pages/MyEventsPage';
import EventPage from './pages/EventPage';
import ProfilePage from './pages/ProfilePage';
//import ProfilePage from './pages/ProfilePage';
import NavBar from './components/layout/NavBar';
import './styles/App.css';

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
  return (
    <div className="App">
      
      <Routes>
        {/* Redirigir a /home por defecto */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas CON NavBar */}
        <Route element={<WithNavLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/events" element={<EventPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-events" element={<MyEventsPage />} />
        </Route>
        </Routes>
    </div>
  );
}

export default App;




