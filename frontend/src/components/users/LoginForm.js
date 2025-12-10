import React, { useState } from 'react';
import authService from '../../services/authService';
import './LoginForm.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LoginForm = ({ onSuccess, onError }) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (loginError) {
      setLoginError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = t("Login.errors.usernameOrEmailRequired");
    }

    if (!formData.password) {
      newErrors.password = t("Login.errors.passwordRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoginError('');
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const result = await authService.login(formData);
      
      if (result.success) {
        onSuccess && onSuccess(result.data);
      } else {
        setLoginError(result.error);
        onError && onError(result.error);
      }
    } catch (error) {
      const errorMsg = t("Login.errors.unexpected");
      setLoginError(errorMsg);
      onError && onError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <div className="login-form">
        <h2>{t("Login.title")}</h2>
        <p className="form-subtitle">{t("Login.subtitle")}</p>
        
        {loginError && (
          <div className="login-error-banner">
            <span className="error-icon">⚠</span>
            <span>{loginError}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="usernameOrEmail" className="form-label">
              {t("Login.fields.usernameOrEmail")}
            </label>
            <input
              type="text"
              id="usernameOrEmail"
              name="usernameOrEmail"
              className={`form-input ${errors.usernameOrEmail ? 'error' : ''}`}
              value={formData.usernameOrEmail}
              onChange={handleChange}
              disabled={isLoading}
              placeholder={t("Login.fields.placeholderUsernameOrEmail")}
            />
            {errors.usernameOrEmail && (
              <span className="error-message">{errors.usernameOrEmail}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              {t("Login.fields.password")}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              placeholder={t("Login.fields.placeholderPassword")}
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <button 
            type="submit" 
            className="login-submit"
            disabled={isLoading}
          >
            {isLoading ? t("Login.button.loading") : t("Login.button.login")}
          </button>
        </form>

        <div className="form-footer">
          <p>
            {t("Login.register.question")}{" "}
            <Link to="/register">{t("Login.register.link")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
