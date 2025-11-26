// src/pages/SplashPage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SplashPage.css";

function SplashPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignUp = () => {
    navigate("/register");
  };

  return (
    <section className="splash">
      <div className="splash__overlay" />
      <div className="splash__content">
        <p className="splash__tagline">Organitza, comparteix i viu experiències</p>
        <h1 className="splash__title">EventManager</h1>
        <p className="splash__subtitle">
          Gestiona els teus esdeveniments des d&apos;un sol lloc. Col·labora amb el teu equip i
          inspira a nous participants.
        </p>
        <div className="splash__buttons">
          <button className="splash__cta splash__cta--primary" onClick={handleLogin}>
            Iniciar Sesión
          </button>
          <button className="splash__cta splash__cta--secondary" onClick={handleSignUp}>
            Registrarse
          </button>
        </div>
      </div>
    </section>
  );
}

export default SplashPage;
