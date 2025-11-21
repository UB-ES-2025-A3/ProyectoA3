import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SplashPage.css';

function SplashPage() {
  const navigate = useNavigate();


  const handleEnter = () => {
    navigate('/login');
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
        <button className="splash__cta" onClick={handleEnter}>
          Entrar ara
        </button>
      </div>
    </section>
  );
}

export default SplashPage;

