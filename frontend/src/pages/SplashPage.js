// src/pages/SplashPage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SplashPage.css";
import { useTranslation } from "react-i18next";

function SplashPage() {
  const { t } = useTranslation();
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
        <p className="splash__tagline">{t("splash.tagline")}</p>
        <h1 className="splash__title">{t("splash.title")}</h1>
        <p className="splash__subtitle">{t("splash.subtitle")}</p>

        <div className="splash__buttons">
          <button
            className="splash__cta splash__cta--primary"
            onClick={handleLogin}
          >
            {t("splash.loginButton")}
          </button>

          <button
            className="splash__cta splash__cta--secondary"
            onClick={handleSignUp}
          >
            {t("splash.registerButton")}
          </button>
        </div>
      </div>
    </section>
  );
}

export default SplashPage;
