import React, { useState } from 'react';
import authService from '../../services/authService';
import './RegisterForm.css';

const RegisterForm = ({ onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    username: '',
    correo: '',
    fechaNacimiento: '',
    ciudad: '',
    idioma: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [pwdRequirements, setPwdRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    if (name === 'password') {
      setPwdRequirements({
        length: value.length >= 6,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        specialChar: /[^A-Za-z0-9]/.test(value)
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    }

    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      newErrors.correo = 'El correo no es válido';
    }

    if (!formData.fechaNacimiento) {
      newErrors.fechaNacimiento = 'La fecha de nacimiento es requerida';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else {
      const { length, uppercase, lowercase, number, specialChar } = pwdRequirements;
      if (!length || !uppercase || !lowercase || !number || !specialChar) {
        newErrors.password = 'La contraseña no cumple con los requisitos mínimos';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await authService.signUp(formData);
      
      if (result.success) {
        onSuccess && onSuccess(result.data);
      } else {
        onError && onError(result.error);
      }
    } catch (error) {
      onError && onError('Error inesperado al registrar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-form-container">
      <div className="register-form">
        <h2>Crear Cuenta</h2>
        <p className="form-subtitle">Únete a nuestra plataforma de eventos</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="nombre">
                Nombre *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                className={`form-input ${errors.nombre ? 'error' : ''}`}
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ingresa tu nombre"
              />
              {errors.nombre && <div className="error-message">{errors.nombre}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="apellidos">
                Apellidos *
              </label>
              <input
                type="text"
                id="apellidos"
                name="apellidos"
                className={`form-input ${errors.apellidos ? 'error' : ''}`}
                value={formData.apellidos}
                onChange={handleChange}
                placeholder="Ingresa tus apellidos"
              />
              {errors.apellidos && <div className="error-message">{errors.apellidos}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Nombre de Usuario *
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className={`form-input ${errors.username ? 'error' : ''}`}
              value={formData.username}
              onChange={handleChange}
              placeholder="Elige un nombre de usuario"
            />
            {errors.username && <div className="error-message">{errors.username}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="correo">
              Correo Electrónico *
            </label>
            <input
              type="email"
              id="correo"
              name="correo"
              className={`form-input ${errors.correo ? 'error' : ''}`}
              value={formData.correo}
              onChange={handleChange}
              placeholder="tu@email.com"
            />
            {errors.correo && <div className="error-message">{errors.correo}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="fechaNacimiento">
              Fecha de Nacimiento *
            </label>
            <input
              type="date"
              id="fechaNacimiento"
              name="fechaNacimiento"
              className={`form-input ${errors.fechaNacimiento ? 'error' : ''}`}
              value={formData.fechaNacimiento}
              onChange={handleChange}
            />
            {errors.fechaNacimiento && <div className="error-message">{errors.fechaNacimiento}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="ciudad">
                Ciudad
              </label>
              <input
                type="text"
                id="ciudad"
                name="ciudad"
                className="form-input"
                value={formData.ciudad}
                onChange={handleChange}
                placeholder="Tu ciudad"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="idioma">
                Idioma
              </label>
              <select
                id="idioma"
                name="idioma"
                className="form-input"
                value={formData.idioma}
                onChange={handleChange}
              >
                <option value="">Selecciona un idioma</option>
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Contraseña *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              value={formData.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
            />
            <div className="password-requirements">
              <p>La contraseña debe incluir:</p>
              <ul>
                <li className={pwdRequirements.length ? 'valid' : 'unmet'}>Al menos 6 caracteres</li>
                <li className={pwdRequirements.uppercase ? 'valid' : 'unmet'}>Una letra mayúscula</li>
                <li className={pwdRequirements.lowercase ? 'valid' : 'unmet'}>Una letra minúscula</li>
                <li className={pwdRequirements.number ? 'valid' : 'unmet'}>Un número</li>
                <li className={pwdRequirements.specialChar ? 'valid' : 'unmet'}>Un carácter especial</li>
              </ul>
            </div>
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

          <button
            type="submit"
            className="register-submit"
            disabled={isLoading}
          >
            {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="form-footer">
          <p>¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;

