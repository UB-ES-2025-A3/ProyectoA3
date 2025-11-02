import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/users/LoginForm';

const LoginPage = () => {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const navigate = useNavigate();

  const handleLoginSuccess = (data) => {
    setMessage(`¡Bienvenido de nuevo, ${data.username}!`);
    setMessageType('success');
    
    // Guardar el token de autenticación y el userId
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    if (data.userId) {
      localStorage.setItem('userId', data.userId);
    }
    
    // Redirigir al dashboard después de 2 segundos
    setTimeout(() => {
      navigate('/events');
    }, 2000);
  };

  const handleLoginError = (error) => {
    setMessage(error);
    setMessageType('error');
  };

  return (
    <div className="login-page">
      {message && (
        <div className={`message-banner ${messageType}`}>
          <div className="container">
            <p>{message}</p>
            {messageType === 'success' && (
              <p className="redirect-message">Redirigiendo...</p>
            )}
          </div>
        </div>
      )}
      
      <LoginForm 
        onSuccess={handleLoginSuccess}
        onError={handleLoginError}
      />
    </div>
  );
};

export default LoginPage;
