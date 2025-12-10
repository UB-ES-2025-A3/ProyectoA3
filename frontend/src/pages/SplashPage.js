// src/pages/SplashPage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SplashPage.css";
import avatar1 from "../assets/avatars/avatar-1.png";
import avatar2 from "../assets/avatars/avatar-2.png";
import avatar3 from "../assets/avatars/avatar-3.png";
import avatar4 from "../assets/avatars/avatar-4.png";
import avatar5 from "../assets/avatars/avatar-5.png";
import avatarDefault from "../assets/avatars/avatar-default.jpg";
import { useTranslation } from "react-i18next";

function SplashPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogin = () => navigate("/login");
  const handleSignUp = () => navigate("/register");

  const teamMembers = [
    {
      name: "Anna",
      role: t("SplashPage.team.Anna.role"),
      description: t("SplashPage.team.Anna.description"),
      image: avatar1,
    },
    {
      name: "Adrià",
      role: t("SplashPage.team.Adrià.role"),
      description: t("SplashPage.team.Adrià.description"),
      image: avatar2,
    },
    {
      name: "Sergi",
      role: t("SplashPage.team.Sergi.role"),
      description: t("SplashPage.team.Sergi.description"),
      image: avatar3,
    },
    {
      name: "Arnau",
      role: t("SplashPage.team.Arnau.role"),
      description: t("SplashPage.team.Arnau.description"),
      image: avatar4,
    },
    {
      name: "Chaofan",
      role: t("SplashPage.team.Chaofan.role"),
      description: t("SplashPage.team.Chaofan.description"),
      image: avatar5,
    },
    {
      name: "Andrés",
      role: t("SplashPage.team.Andrés.role"),
      description: t("SplashPage.team.Andrés.description"),
      image: avatarDefault,
    },
  ];

  return (
    <>
      <section className="splash">
        <div className="splash__overlay" />
        <div className="splash__content">
          <p className="splash__tagline">{t("SplashPage.tagline")}</p>
          <h1 className="splash__title">{t("SplashPage.title")}</h1>
          <p className="splash__subtitle">{t("SplashPage.subtitle")}</p>

          <div className="splash__buttons">
            <button className="splash__cta splash__cta--primary" onClick={handleLogin}>
              {t("SplashPage.loginButton")}
            </button>
            <button className="splash__cta splash__cta--secondary" onClick={handleSignUp}>
              {t("SplashPage.registerButton")}
            </button>
          </div>
        </div>

        <button
          className="about-scroll-btn"
          onClick={() =>
            document.getElementById("about-us-section").scrollIntoView({ behavior: "smooth" })
          }
        >
          {t("SplashPage.scrollButton")}
        </button>
      </section>

      <section className="about-us" id="about-us-section">
        <div className="about-us__container">
          <h2 className="about-us__title">{t("SplashPage.about.title")}</h2>
          <p className="about-us__subtitle">{t("SplashPage.about.subtitle")}</p>

          <div className="about-us__team">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-member">
                <div className="team-member__image-wrapper">
                  <img src={member.image} alt={member.name} className="team-member__image" />
                </div>
                <h3 className="team-member__name">{member.name}</h3>
                <p className="team-member__role">{member.role}</p>
                <p className="team-member__description">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default SplashPage;
