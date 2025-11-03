import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import MyEventsPage from './pages/MyEventsPage';
import NavBar from './components/layout/NavBar';
import './styles/App.css';

function ProfilePage() {
  return <div style={{ padding: 24 }}><h1>Perfil</h1></div>;
}

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
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

          {/* Rutas CON NavBar */}
          <Route element={<WithNavLayout />}>
            <Route path="/events" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/my-events" element={<MyEventsPage />} />
          </Route>
        </Routes>
    </div>
  );
}

export default App;
