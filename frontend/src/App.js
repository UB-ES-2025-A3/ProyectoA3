import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import NavBar from './components/layout/NavBar';
import './styles/App.css';

function ProfilePage() {
  return <div style={{ padding: 24 }}><h1>Perfil</h1></div>;
}

function MyEventsPage() {
  return <div style={{ padding: 24 }}><h1>Mis eventos</h1></div>;
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
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Rutas CON NavBar */}
          <Route element={<WithNavLayout />}>
            <Route path="/events" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;



