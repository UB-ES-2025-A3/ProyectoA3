import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import "./NavBar.css";

export default function NavBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    // También eliminar authToken por si acaso
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <nav className="nav">
      <div className="nav__brand">EventManager</div>
      <div className="nav__links">
        <NavLink to="/events">Eventos</NavLink>
        <NavLink to="/profile">Perfil</NavLink>
        <NavLink to="/my-events">Mis eventos</NavLink>
      </div>
      <button className="nav__logout" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
}
