// src/pages/SplashPage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SplashPage.css";
import avatar1 from "../assets/avatars/avatar-1.jpg";
import avatar2 from "../assets/avatars/avatar-2.jpg";
import avatar3 from "../assets/avatars/avatar-3.jpg";
import avatar4 from "../assets/avatars/avatar-4.png";
import avatar5 from "../assets/avatars/avatar-5.png";
import avatarDefault from "../assets/avatars/avatar-default.jpg";

function SplashPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignUp = () => {
    navigate("/register");
  };

  const teamMembers = [
    {
      name: "Anna",
      role: "Desarrolladora Full Stack",
      description: "Especializada en arquitectura de aplicaciones web y experiencia de usuario.",
      image: avatar1,
    },
    {
      name: "Adrià",
      role: "Desarrollador Backend",
      description: "Experto en APIs REST y gestión de bases de datos relacionales.",
      image: avatar2,
    },
    {
      name: "Sergi",
      role: "Desarrollador Full Stack",
      description: "Enfocado en integración de sistemas y optimización de rendimiento.",
      image: avatar3,
    },
    {
      name: "Arnau",
      role: "Desarrollador Frontend",
      description: "Especialista en interfaces modernas y experiencia de usuario interactiva.",
      image: avatar4,
    },
    {
      name: "Chaofan",
      role: "Desarrollador Full Stack",
      description: "Experto en desarrollo de aplicaciones escalables y arquitectura de software.",
      image: avatar5,
    },
    {
      name: "Andrés",
      role: "Desarrollador Backend",
      description: "Especializado en servicios web y lógica de negocio robusta.",
      image: avatarDefault,
    },
  ];

  return (
    <>
      <section className="splash">
        <div className="splash__overlay" />
        <div className="splash__content">
          <p className="splash__tagline">Organiza, comparte y vive experiencias</p>
          <h1 className="splash__title">EventManager</h1>
          <p className="splash__subtitle">
            Gestiona tus eventos desde un solo lugar. Colabora con tu equipo e
            inspira a nuevos usuarios.
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

      <section className="about-us">
        <div className="about-us__container">
          <h2 className="about-us__title">Quiénes Somos</h2>
          <p className="about-us__subtitle">
            Un equipo de desarrolladores apasionados por crear soluciones innovadoras
          </p>
          <div className="about-us__team">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-member">
                <div className="team-member__image-wrapper">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="team-member__image"
                  />
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
