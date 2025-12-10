import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/users/RegisterForm';
import { useTranslation } from 'react-i18next';

const RegisterPage = () => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();

  const handleRegisterSuccess = (data) => {
    setMessage(
      t("register.messages.success", { username: data.username })
    );
    setMessageType('success');

    setTimeout(() => {
      navigate('/login');
    }, 3000);
  };

  const handleRegisterError = (error) => {
    setMessage(
      error || t("register.messages.errorFallback")
    );
    setMessageType('error');
  };

  return (
    <div className="register-page">
      {message && (
        <div className={`message-banner ${messageType}`}>
          <div className="container">
            <p>{message}</p>
            {messageType === 'success' && (
              <p className="redirect-message">
                {t("register.messages.redirecting")}
              </p>
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
