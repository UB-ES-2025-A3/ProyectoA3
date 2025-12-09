import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/users/LoginForm';
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();

  const handleLoginSuccess = (data) => {
    setMessage(
      t("login.messages.welcome", { username: data.username })
    );
    setMessageType('success');

    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    if (data.userId) {
      localStorage.setItem('userId', data.userId);
    }

    setTimeout(() => {
      navigate('/home');
    }, 2000);
  };

  const handleLoginError = (error) => {
    setMessage(
      error || t("login.messages.errorFallback")
    );
    setMessageType('error');
  };

  return (
    <div className="login-page">
      {message && (
        <div className={`message-banner ${messageType}`}>
          <div className="container">
            <p>{message}</p>
            {messageType === 'success' && (
              <p className="redirect-message">
                {t("login.messages.redirecting")}
              </p>
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
