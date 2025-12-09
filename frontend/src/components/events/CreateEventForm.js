// src/components/events/CreateEventForm.js
import React, { useState } from 'react';
import './CreateEventForm.css';
import { createEvent } from '../../services/eventService';
import { useTranslation } from 'react-i18next';

export default function CreateEventForm({ isOpen, onClose, onSuccess, initialLocation, initialCoordinates}) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    titulo: '',
    etiquetas: '',
    fecha: '',
    hora: '',
    idioma: '',
    plazasDisponibles: '',
    edadMinima: '',
    lugar: '',
    descripcion: '',
    latitud: '',
    longitud: ''
  });

  // Resetear el formulario cuando se cierre
  React.useEffect(() => {
    if (!isOpen) {
      setFormData({
        titulo: '',
        etiquetas: '',
        fecha: '',
        hora: '',
        idioma: '',
        plazasDisponibles: '',
        edadMinima: '',
        lugar: '',
        descripcion: '',
        latitud: '',
        longitud: ''
      });
      setErrors({});
      setSubmitError('');
    }
  }, [isOpen]);

  // Actualizar el formulario cuando se abra con coordenadas iniciales
  React.useEffect(() => {
    if (isOpen) {
      if (initialLocation) {
        setFormData(prev => ({
          ...prev,
          lugar: initialLocation
        }));
      }
      if (initialCoordinates) {
        // Convertir a string y reemplazar comas por puntos (formato europeo -> internacional)
        const lat = initialCoordinates.latitude != null 
          ? String(initialCoordinates.latitude).replace(',', '.') 
          : '';
        const lng = initialCoordinates.longitude != null 
          ? String(initialCoordinates.longitude).replace(',', '.') 
          : '';
        
        setFormData(prev => ({
          ...prev,
          latitud: lat,
          longitud: lng
        }));
      }
    }
  }, [isOpen, initialLocation, initialCoordinates]);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

const handleChange = (e) => {
  const { name, value } = e.target;

  // Limitar el año del date a 4 dígitos
  if (name === "fecha") {
    // value en un input type="date" es siempre "YYYY-MM-DD" o parcial ("2025-", "2025-01", etc.)
    const [year] = value.split("-");

    // Si el usuario intenta meter más de 4 dígitos en el año, ignoramos el cambio
    if (year && year.length > 4) {
      return;
    }
  }

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));

  if (errors[name]) {
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }
  if (submitError) {
    setSubmitError("");
  }
};


  const validateForm = () => {
    const newErrors = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = t("createEvent.validation.titleRequired");
    }

    if (!formData.fecha) {
      newErrors.fecha = t("createEvent.validation.dateRequired");
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(formData.fecha);
      if (selectedDate < today) {
        newErrors.fecha = t("createEvent.validation.dateInPast");
      }
    }

    if (!formData.hora) {
      newErrors.hora = t("createEvent.validation.timeRequired");
    }

    if (
      !formData.idioma ||
      (typeof formData.idioma === 'string' && formData.idioma.trim() === '') ||
      (Array.isArray(formData.idioma) && formData.idioma.length === 0)
    ) {
      newErrors.idioma = t("createEvent.validation.languageRequired");
    }

    if (!formData.plazasDisponibles) {
      newErrors.plazasDisponibles = t("createEvent.validation.capacityRequired");
    } else if (parseInt(formData.plazasDisponibles) < 1) {
      newErrors.plazasDisponibles = t("createEvent.validation.capacityMin");
    }

    if (formData.edadMinima && parseInt(formData.edadMinima) < 0) {
      newErrors.edadMinima = t("createEvent.validation.minAgeMin");
    } else if (formData.edadMinima && parseInt(formData.edadMinima) > 120) {
      newErrors.edadMinima = t("createEvent.validation.minAgeMax");
    }

    if (!formData.lugar.trim()) {
      newErrors.lugar = t("createEvent.validation.placeRequired");
    }

    // Validación de latitud y longitud
    // Si vienen del mapa (initialCoordinates), son requeridas
    // Si no vienen del mapa, son opcionales pero si se rellenan deben ser válidas
    const hasInitialCoordinates = initialCoordinates?.latitude != null && initialCoordinates?.longitude != null;
    
    // Validación de latitud
    if (hasInitialCoordinates) {
      // Si vienen del mapa, deben estar rellenas
      if (!formData.latitud || formData.latitud.trim() === '') {
        newErrors.latitud = 'La latitud es requerida';
      } else {
        // Convertir coma a punto para parseFloat
        const latStr = String(formData.latitud).replace(',', '.');
        const lat = parseFloat(latStr);
        if (isNaN(lat) || lat < -90 || lat > 90) {
          newErrors.latitud = 'Latitud inválida';
        }
      }
    } else {
      // Si no vienen del mapa, son opcionales pero si se rellenan deben ser válidas
      if (formData.latitud && formData.latitud.trim() !== '') {
        const latStr = String(formData.latitud).replace(',', '.');
        const lat = parseFloat(latStr);
        if (isNaN(lat) || lat < -90 || lat > 90) {
          newErrors.latitud = 'Latitud inválida';
        }
      }
    }

    // Validación de longitud
    if (hasInitialCoordinates) {
      // Si vienen del mapa, deben estar rellenas
      if (!formData.longitud || formData.longitud.trim() === '') {
        newErrors.longitud = 'La longitud es requerida';
      } else {
        // Convertir coma a punto para parseFloat
        const lngStr = String(formData.longitud).replace(',', '.');
        const lng = parseFloat(lngStr);
        if (isNaN(lng) || lng < -180 || lng > 180) {
          newErrors.longitud = 'Longitud inválida';
        }
      }
    } else {
      // Si no vienen del mapa, son opcionales pero si se rellenan deben ser válidas
      if (formData.longitud && formData.longitud.trim() !== '') {
        const lngStr = String(formData.longitud).replace(',', '.');
        const lng = parseFloat(lngStr);
        if (isNaN(lng) || lng < -180 || lng > 180) {
          newErrors.longitud = 'Longitud inválida';
        }
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

    setLoading(true);
    setSubmitError('');

    try {
      // Convertir coordenadas, reemplazando coma por punto si es necesario
      const latStr = formData.latitud ? String(formData.latitud).replace(',', '.') : '';
      const lngStr = formData.longitud ? String(formData.longitud).replace(',', '.') : '';
      
      const lat = latStr ? parseFloat(latStr) : null;
      const lng = lngStr ? parseFloat(lngStr) : null;

      const response = await createEvent({
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        etiquetas: formData.etiquetas || 'otros',
        fecha: formData.fecha,
        hora: formData.hora,
        lugar: formData.lugar,
        latitud: lat,
        longitud: lng,
        restricciones: {
          idiomasRequerido: formData.idioma ? [formData.idioma] : [],
          plazasDisponibles: parseInt(formData.plazasDisponibles),
          edad_minima: formData.edadMinima ? parseInt(formData.edadMinima) : null
        }
      });

      console.log('Evento creado exitosamente:', response);

      setFormData({
        titulo: '',
        etiquetas: '',
        fecha: '',
        hora: '',
        idioma: '',
        plazasDisponibles: '',
        edadMinima: '',
        lugar: '',
        descripcion: '',
        latitud: '',
        longitud: ''
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error al crear el evento:', error);
      setSubmitError(error.message || t("createEvent.messages.submitErrorFallback"));
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="create-event-modal-content">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        
        <div className="modal-header">
          <h2 data-testid="create-event-title">
            {t("createEvent.modal.title")}
          </h2>
          <p>{t("createEvent.modal.subtitle")}</p>
        </div>


        {submitError && (
          <div
            className="form-error-banner"
            style={{
              padding: '12px 16px',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '6px',
              marginBottom: '16px',
              color: '#c33',
              fontSize: '14px'
            }}
          >
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-event-form">
          <div className="form-group">
            <label htmlFor="titulo">
              {t("createEvent.form.labels.title")} *
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder={t("createEvent.form.placeholders.title")}
              className={errors.titulo ? 'error' : ''}
              disabled={loading}
            />
            {errors.titulo && <span className="error-message">{errors.titulo}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">
              {t("createEvent.form.labels.description")}
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder={t("createEvent.form.placeholders.description")}
              disabled={loading}
              rows="3"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontFamily: 'inherit',
                fontSize: '14px'
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="etiquetas">
              {t("createEvent.form.labels.tags")}
            </label>
            <select
              id="etiquetas"
              name="etiquetas"
              value={formData.etiquetas}
              onChange={handleChange}
              className={errors.etiquetas ? 'error' : ''}
              disabled={loading}
            >
              <option value="">
                {t("createEvent.form.tags.placeholder")}
              </option>
              <option value="turismo">
                {t("createEvent.form.tags.options.turismo")}
              </option>
              <option value="comida">
                {t("createEvent.form.tags.options.comida")}
              </option>
              <option value="excursion">
                {t("createEvent.form.tags.options.excursion")}
              </option>
              <option value="cultural">
                {t("createEvent.form.tags.options.cultural")}
              </option>
              <option value="social">
                {t("createEvent.form.tags.options.social")}
              </option>
              <option value="deporte">
                {t("createEvent.form.tags.options.deporte")}
              </option>
              <option value="aventura">
                {t("createEvent.form.tags.options.aventura")}
              </option>
              <option value="familiar">
                {t("createEvent.form.tags.options.familiar")}
              </option>
              <option value="juegos">
                {t("createEvent.form.tags.options.juegos")}
              </option>
              <option value="cine">
                {t("createEvent.form.tags.options.cine")}
              </option>
              <option value="relax">
                {t("createEvent.form.tags.options.relax")}
              </option>
              <option value="tardeo">
                {t("createEvent.form.tags.options.tardeo")}
              </option>
              <option value="noche">
                {t("createEvent.form.tags.options.noche")}
              </option>
              <option value="otros">
                {t("createEvent.form.tags.options.otros")}
              </option>
            </select>
            {errors.etiquetas && <span className="error-message">{errors.etiquetas}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fecha">
                {t("createEvent.form.labels.date")} *
              </label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                className={errors.fecha ? 'error' : ''}
                disabled={loading}
                min={minDate}
              />
              {errors.fecha && <span className="error-message">{errors.fecha}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="hora">
                {t("createEvent.form.labels.time")} *
              </label>
              <input
                type="time"
                id="hora"
                name="hora"
                value={formData.hora}
                onChange={handleChange}
                className={errors.hora ? 'error' : ''}
                disabled={loading}
              />
              {errors.hora && <span className="error-message">{errors.hora}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="idioma">
                {t("createEvent.form.labels.language")} *
              </label>
              <select
                id="idioma"
                name="idioma"
                value={formData.idioma}
                onChange={handleChange}
                className={errors.idioma ? 'error' : ''}
                disabled={loading}
              >
                <option value="">
                  {t("createEvent.form.language.placeholder")}
                </option>
                <option value="es">🇪🇸 {t("createEvent.form.language.options.es")}</option>
                <option value="en">🇬🇧 {t("createEvent.form.language.options.en")}</option>
                <option value="fr">🇫🇷 {t("createEvent.form.language.options.fr")}</option>
                <option value="de">🇩🇪 {t("createEvent.form.language.options.de")}</option>
                <option value="it">🇮🇹 {t("createEvent.form.language.options.it")}</option>
                <option value="pt">🇵🇹 {t("createEvent.form.language.options.pt")}</option>
                <option value="ru">🇷🇺 {t("createEvent.form.language.options.ru")}</option>
              </select>
              {errors.idioma && <span className="error-message">{errors.idioma}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="plazasDisponibles">
                {t("createEvent.form.labels.capacity")} *
              </label>
              <input
                type="number"
                id="plazasDisponibles"
                name="plazasDisponibles"
                value={formData.plazasDisponibles}
                onChange={handleChange}
                min="1"
                placeholder={t("createEvent.form.placeholders.capacity")}
                className={errors.plazasDisponibles ? 'error' : ''}
                disabled={loading}
              />
              {errors.plazasDisponibles && (
                <span className="error-message">{errors.plazasDisponibles}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="edadMinima">
                {t("createEvent.form.labels.minAge")}
              </label>
              <input
                type="number"
                id="edadMinima"
                name="edadMinima"
                value={formData.edadMinima}
                onChange={handleChange}
                min="0"
                max="120"
                placeholder={t("createEvent.form.placeholders.minAge")}
                className={errors.edadMinima ? 'error' : ''}
                disabled={loading}
              />
              {errors.edadMinima && (
                <span className="error-message">{errors.edadMinima}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="lugar">Lugar *</label>
              <input
                type="text"
                id="lugar"
                name="lugar"
                value={formData.lugar}
                onChange={handleChange}
                placeholder="Ej: Café Central"
                className={errors.lugar ? 'error' : ''}
                disabled={loading}
              />
              {errors.lugar && <span className="error-message">{errors.lugar}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="latitud">
                Latitud {initialCoordinates?.latitude != null ? '*' : '(opcional)'}
              </label>
              <input
                type="number"
                id="latitud"
                name="latitud"
                value={formData.latitud}
                onChange={handleChange}
                step="any"
                min="-90"
                max="90"
                placeholder="Ej: 41.3851"
                className={errors.latitud ? 'error' : ''}
                disabled={loading}
                readOnly={!!initialCoordinates?.latitude}
                style={initialCoordinates?.latitude ? { backgroundColor: '#f0f0f0', cursor: 'not-allowed' } : {}}
              />
              {initialCoordinates?.latitude && (
                <span style={{ fontSize: '0.85rem', color: '#666', fontStyle: 'italic' }}>
                  Rellenado automáticamente desde el mapa
                </span>
              )}
              {errors.latitud && <span className="error-message">{errors.latitud}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="longitud">
                Longitud {initialCoordinates?.longitude != null ? '*' : '(opcional)'}
              </label>
              <input
                type="number"
                id="longitud"
                name="longitud"
                value={formData.longitud}
                onChange={handleChange}
                step="any"
                min="-180"
                max="180"
                placeholder="Ej: 2.1734"
                className={errors.longitud ? 'error' : ''}
                disabled={loading}
                readOnly={!!initialCoordinates?.longitude}
                style={initialCoordinates?.longitude ? { backgroundColor: '#f0f0f0', cursor: 'not-allowed' } : {}}
              />
              {initialCoordinates?.longitude && (
                <span style={{ fontSize: '0.85rem', color: '#666', fontStyle: 'italic' }}>
                  Rellenado automáticamente desde el mapa
                </span>
              )}
              {errors.longitud && <span className="error-message">{errors.longitud}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={loading}
            >
              {t("createEvent.buttons.cancel")}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? t("createEvent.buttons.submitting")
                : t("createEvent.buttons.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
