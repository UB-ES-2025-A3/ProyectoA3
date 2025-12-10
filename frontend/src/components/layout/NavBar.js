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
        <NavLink to="/home">{t("nav.events")}</NavLink>
        {/* <NavLink to="/events">{t("nav.events")}</NavLink> */}
        <NavLink to="/profile">{t("nav.profile")}</NavLink>
        <NavLink to="/my-events">{t("nav.myEvents")}</NavLink>
      </div>

      <div className="nav__right">
        {/* Selector de idioma */}
        <div className="nav__lang">
          <span
            className={i18n.language === "es" ? "lang active" : "lang"}
            onClick={() => changeLang("es")}
          >
            es
          </span>
          {" | "}
          <span
            className={i18n.language === "en" ? "lang active" : "lang"}
            onClick={() => changeLang("en")}
          >
            en
          </span>
          {" | "}
          <span
            className={i18n.language === "cat" ? "lang active" : "lang"}
            onClick={() => changeLang("cat")}
          >
            ca
          </span>
        </div>

        <button className="nav__logout" onClick={handleLogout}>
          {t("nav.logout")}
        </button>
      </div>
    </nav>
  );
}
