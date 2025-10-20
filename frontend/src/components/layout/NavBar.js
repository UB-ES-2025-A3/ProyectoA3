import React from "react";
import { NavLink } from "react-router-dom";
import "./NavBar.css";

export default function NavBar() {
  return (
    <nav className="nav">
      <div className="nav__brand">Trips & Events</div>
      <div className="nav__links">
        <NavLink to="/" end>Inicio</NavLink>
        <NavLink to="/profile">Perfil</NavLink>
        <NavLink to="/my-events">Mis eventos</NavLink>
      </div>
    </nav>
  );
}
