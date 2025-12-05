import React, { useState } from 'react';
import authService from '../../services/authService';
import './RegisterForm.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const RegisterForm = ({ onSuccess, onError }) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    username: '',
    correo: '',
    fechaNacimiento: '',
    ciudad: '',
    idioma: [],
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

  const [idiomaOpen, setIdiomaOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    
    if (name === 'fechaNacimiento') {
    const [year] = value.split('-'); // "YYYY-MM-DD" → ["YYYY", "MM", "DD"]

    // Si el usuario intenta meter más de 4 dígitos en el año, no actualizamos el estado
    if (year && year.length > 4) {
      return;
    }
  }

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

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      if (checked) {
        return { ...prev, idioma: [...prev.idioma, value] };
      } else {
        return { ...prev, idioma: prev.idioma.filter(i => i !== value) };
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = t("Register.errors.nombreRequired");
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = t("Register.errors.apellidosRequired");
    }

    if (!formData.username.trim()) {
      newErrors.username = t("Register.errors.usernameRequired");
    }

    if (!formData.correo.trim()) {
      newErrors.correo = t("Register.errors.correoRequired");
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      newErrors.correo = t("Register.errors.correoInvalid");
    }

if (!formData.fechaNacimiento) {
  newErrors.fechaNacimiento = t("Register.errors.fechaNacimientoRequired");
} else {
  // Esperamos formato "YYYY-MM-DD"
  const match = formData.fechaNacimiento.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    // Formato inválido (año con más o menos de 4 dígitos, etc.)
    newErrors.fechaNacimiento = t("Register.errors.fechaNacimientoInvalid");
  } else {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);

    // Aquí puedes ajustar los rangos según lo que tenga sentido para vuestra app
    if (year < 1900 || year > 2100) {
      newErrors.fechaNacimiento = t("Register.errors.fechaNacimientoInvalid");
    } else if (month < 1 || month > 12 || day < 1 || day > 31) {
      newErrors.fechaNacimiento = t("Register.errors.fechaNacimientoInvalid");
    }
  }
}


    if (!formData.password) {
      newErrors.password = t("Register.errors.passwordRequired");
    } else {
      const { length, uppercase, lowercase, number, specialChar } = pwdRequirements;
      if (!length || !uppercase || !lowercase || !number || !specialChar) {
        newErrors.password = t("Register.errors.passwordRequirements");
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
      // El backend espera List<String> idioma (array), no string
      const payload = {
        ...formData,
        idioma: Array.isArray(formData.idioma) ? formData.idioma : []
      };
      const result = await authService.signUp(payload);
      
      if (result.success) {
        onSuccess && onSuccess(result.data);
      } else {
        onError && onError(result.error);
      }
    } catch (error) {
      const errorMsg = t("Register.errors.unexpected");
      onError && onError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-form-container">
      <div className="register-form">
        <h2>{t("Register.title")}</h2>
        <p className="form-subtitle">{t("Register.subtitle")}</p>
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="nombre">
                {t("Register.fields.nombre")} *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                className={`form-input ${errors.nombre ? 'error' : ''}`}
                value={formData.nombre}
                onChange={handleChange}
                placeholder={t("Register.fields.placeholderNombre")}
              />
              {errors.nombre && <div className="error-message">{errors.nombre}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="apellidos">
                {t("Register.fields.apellidos")} *
              </label>
              <input
                type="text"
                id="apellidos"
                name="apellidos"
                className={`form-input ${errors.apellidos ? 'error' : ''}`}
                value={formData.apellidos}
                onChange={handleChange}
                placeholder={t("Register.fields.placeholderApellidos")}
              />
              {errors.apellidos && <div className="error-message">{errors.apellidos}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="username">
              {t("Register.fields.username")} *
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className={`form-input ${errors.username ? 'error' : ''}`}
              value={formData.username}
              onChange={handleChange}
              placeholder={t("Register.fields.placeholderUsername")}
            />
            {errors.username && <div className="error-message">{errors.username}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="correo">
              {t("Register.fields.correo")} *
            </label>
            <input
              type="email"
              id="correo"
              name="correo"
              className={`form-input ${errors.correo ? 'error' : ''}`}
              value={formData.correo}
              onChange={handleChange}
              placeholder={t("Register.fields.placeholderCorreo")}
            />
            {errors.correo && <div className="error-message">{errors.correo}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="fechaNacimiento">
              {t("Register.fields.fechaNacimiento")} *
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
                {t("Register.fields.ciudad")}
              </label>
              <input
                type="text"
                id="ciudad"
                name="ciudad"
                className="form-input"
                value={formData.ciudad}
                onChange={handleChange}
                placeholder={t("Register.fields.placeholderCiudad")}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                {t("Register.fields.idioma")}
              </label>
              <div className="multi-dropdown">
                <div
                  className="multi-dropdown-header"
                  onClick={() => setIdiomaOpen(!idiomaOpen)}
                >
                  {formData.idioma.length > 0 
                    ? formData.idioma.join(', ') 
                    : t("Register.fields.idiomaPlaceholder")}
                  <span className="dropdown-arrow">{idiomaOpen ? '▲' : '▼'}</span>
                </div>
                {idiomaOpen && (
                  <div className="multi-dropdown-menu">
                    <label>
                      <input
                        type="checkbox"
                        value="es"
                        checked={formData.idioma.includes('es')}
                        onChange={handleCheckboxChange}
                      />
                      {t("Register.languages.es")}
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        value="en"
                        checked={formData.idioma.includes('en')}
                        onChange={handleCheckboxChange}
                      />
                      {t("Register.languages.en")}
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        value="fr"
                        checked={formData.idioma.includes('fr')}
                        onChange={handleCheckboxChange}
                      />
                      {t("Register.languages.fr")}
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        value="de"
                        checked={formData.idioma.includes('de')}
                        onChange={handleCheckboxChange}
                      />
                      {t("Register.languages.de")}
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        value="it"
                        checked={formData.idioma.includes('it')}
                        onChange={handleCheckboxChange}
                      />
                      {t("Register.languages.it")}
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        value="pt"
                        checked={formData.idioma.includes('pt')}
                        onChange={handleCheckboxChange}
                      />
                      {t("Register.languages.pt")}
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        value="ru"
                        checked={formData.idioma.includes('ru')}
                        onChange={handleCheckboxChange}
                      />
                      {t("Register.languages.ru")}
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              {t("Register.password.label")} *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              value={formData.password}
              onChange={handleChange}
              placeholder={t("Register.password.placeholder")}
            />
            <div className="password-requirements">
              <p>{t("Register.password.requirementsTitle")}</p>
              <ul>
                <li className={pwdRequirements.length ? 'valid' : 'unmet'}>
                  {t("Register.password.requirements.length")}
                </li>
                <li className={pwdRequirements.uppercase ? 'valid' : 'unmet'}>
                  {t("Register.password.requirements.uppercase")}
                </li>
                <li className={pwdRequirements.lowercase ? 'valid' : 'unmet'}>
                  {t("Register.password.requirements.lowercase")}
                </li>
                <li className={pwdRequirements.number ? 'valid' : 'unmet'}>
                  {t("Register.password.requirements.number")}
                </li>
                <li className={pwdRequirements.specialChar ? 'valid' : 'unmet'}>
                  {t("Register.password.requirements.specialChar")}
                </li>
              </ul>
            </div>
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

          <button
            type="submit"
            className="register-submit"
            disabled={isLoading}
          >
            {isLoading ? t("Register.button.loading") : t("Register.button.submit")}
          </button>
        </form>

        <div className="form-footer">
          <p>
            {t("Register.footer.question")}{" "}
            <Link to="/login">{t("Register.footer.link")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
