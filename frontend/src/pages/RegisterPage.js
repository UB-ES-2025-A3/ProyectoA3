import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/users/RegisterForm';

const RegisterPage = () => {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const navigate = useNavigate();

  const handleRegisterSuccess = (data) => {
    setMessage(`¡Cuenta creada exitosamente! Bienvenido ${data.username}`);
    setMessageType('success');
    
    // Redirigir al login después de 3 segundos
    setTimeout(() => {
      navigate('/login');
    }, 3000);
  };

  const handleRegisterError = (error) => {
    setMessage(error);
    setMessageType('error');
  };

  return (
    <div className="register-page">
      {message && (
        <div className={`message-banner ${messageType}`}>
          <div className="container">
            <p>{message}</p>
            {messageType === 'success' && (
              <p className="redirect-message">Serás redirigido al login en unos segundos...</p>
            )}
          </div>
        </div>
      )}
      
      <RegisterForm 
        onSuccess={handleRegisterSuccess}
        onError={handleRegisterError}
      />
    </div>
  );
};

export default RegisterPage;



