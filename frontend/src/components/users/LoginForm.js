import React, { useState } from 'react';
import authService from '../../services/authService';
import './LoginForm.css';

const LoginForm = ({ onSuccess, onError }) => {
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
      newErrors.usernameOrEmail = 'El nombre de usuario o correo es requerido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoginError('');
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await authService.login(formData);
      
      if (result.success) {
        onSuccess && onSuccess(result.data);
      } else {
        setLoginError(result.error || 'Usuario/correo o contraseña incorrectos');
        onError && onError(result.error);
      }
    } catch (error) {
      setLoginError('Error inesperado al iniciar sesión. Por favor, intenta de nuevo.');
      onError && onError('Error inesperado al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <div className="login-form">
        <h2>Iniciar Sesión</h2>
        <p className="form-subtitle">Accede a tu cuenta de eventos</p>
        
        {loginError && (
          <div className="login-error-banner">
            <span className="error-icon">⚠</span>
            <span>{loginError}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="usernameOrEmail" className="form-label">
              Nombre de Usuario o Correo
            </label>
            <input
              type="text"
              id="usernameOrEmail"
              name="usernameOrEmail"
              className={`form-input ${errors.usernameOrEmail ? 'error' : ''}`}
              value={formData.usernameOrEmail}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Ingresa tu usuario o correo electrónico"
            />
            {errors.usernameOrEmail && (
              <span className="error-message">{errors.usernameOrEmail}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Ingresa tu contraseña"
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
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="form-footer">
          <p>¿No tienes una cuenta? <a href="/register">Regístrate aquí</a></p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
