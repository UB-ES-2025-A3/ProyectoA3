// src/components/layout/NavBar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import "./NavBar.css";
import { useTranslation } from "react-i18next";

export default function NavBar() {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();

  const handleLogout = () => {
    authService.logout();
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  const changeLang = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  return (
    <nav className="nav">
      <div className="nav__brand">{t("nav.brand")}</div>

      <div className="nav__links">
        <NavLink to="/home">Inicio</NavLink>
        <NavLink to="/events">Eventos</NavLink>
        <NavLink to="/profile">Perfil</NavLink>
        <NavLink to="/my-events">Mis eventos</NavLink>
      </div>
    </nav>
  );
}
