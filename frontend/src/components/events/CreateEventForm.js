// src/components/events/CreateEventForm.js
import React, { useState } from 'react';
import './CreateEventForm.css';
import { createEvent } from '../../services/eventService';

export default function CreateEventForm({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    titulo: '',
    etiquetas: '',
    fecha: '',
    hora: '',
    idioma: '',
    plazasDisponibles: '',
    lugar: '',
    descripcion: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    // Clear submit error
    if (submitError) {
      setSubmitError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título del evento es requerido';
    }


    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es requerida';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(formData.fecha);
      if (selectedDate < today) {
        newErrors.fecha = 'La fecha no puede ser anterior a hoy';
      }
    }

    if (!formData.hora) {
      newErrors.hora = 'La hora es requerida';
    }

    if (!formData.idioma) {
      newErrors.idioma = 'Debes seleccionar un idioma';
    }

    if (!formData.plazasDisponibles) {
      newErrors.plazasDisponibles = 'Las plazas disponibles son requeridas';
    } else if (parseInt(formData.plazasDisponibles) < 1) {
      newErrors.plazasDisponibles = 'Debe haber al menos 1 plaza disponible';
    }

    if (!formData.lugar.trim()) {
      newErrors.lugar = 'El lugar es requerido';
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
      // Llamar al backend para crear el evento
      const response = await createEvent({
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        etiquetas: formData.etiquetas,
        fecha: formData.fecha,
        hora: formData.hora,
        lugar: formData.lugar,
        restricciones: {
          idiomaRequerido: formData.idioma,
          plazasDisponibles: parseInt(formData.plazasDisponibles)
        }
      });

      console.log('Evento creado exitosamente:', response);

      // Resetear formulario
      setFormData({
        titulo: '',
        etiquetas: '',
        fecha: '',
        idioma: '',
        plazasDisponibles: '',
        lugar: '',
        descripcion: ''
      });

      // Llamar al callback de éxito
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error al crear el evento:', error);
      setSubmitError(error.message || 'Error al crear el evento. Inténtalo de nuevo.');
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
          <h2>Crear Nuevo Evento</h2>
          <p>Completa el formulario para crear un nuevo evento</p>
        </div>

        {submitError && (
          <div className="form-error-banner" style={{
            padding: '12px 16px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '6px',
            marginBottom: '16px',
            color: '#c33',
            fontSize: '14px'
          }}>
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-event-form">
          <div className="form-group">
            <label htmlFor="titulo">Título del Evento *</label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="ej: Paseo por el centro histórico"
              className={errors.titulo ? 'error' : ''}
              disabled={loading}
            />
            {errors.titulo && <span className="error-message">{errors.titulo}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Describe tu evento (opcional)"
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
            <label htmlFor="etiquetas">Etiquetas *</label>
            <select
              id="etiquetas"
              name="etiquetas"
              value={formData.etiquetas}
              onChange={handleChange}
              className={errors.etiquetas ? 'error' : ''}
              disabled={loading}
            >
              <option value="">Selecciona una etiqueta</option>
              <option value="comida">Comida</option>
              <option value="excursion">Excursión</option>
              <option value="turismo">Turismo</option>
              <option value="otros">Otros</option>
            </select>
            {errors.etiquetas && <span className="error-message">{errors.etiquetas}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fecha">Fecha *</label>
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
              <label htmlFor="hora">Hora *</label>
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
              <label htmlFor="idioma">Idioma *</label>
              <select
                id="idioma"
                name="idioma"
                value={formData.idioma}
                onChange={handleChange}
                className={errors.idioma ? 'error' : ''}
                disabled={loading}
              >
                <option value="">Selecciona un idioma</option>
                <option value="es">🇪🇸 Español</option>
                <option value="en">🇬🇧 Inglés</option>
                <option value="fr">🇫🇷 Francés</option>
                <option value="de">🇩🇪 Alemán</option>
                <option value="it">🇮🇹 Italiano</option>
                <option value="pt">🇵🇹 Portugués</option>
                <option value="ru">🇷🇺 Ruso</option>
              </select>
              {errors.idioma && <span className="error-message">{errors.idioma}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="plazasDisponibles">Plazas Disponibles *</label>
              <input
                type="number"
                id="plazasDisponibles"
                name="plazasDisponibles"
                value={formData.plazasDisponibles}
                onChange={handleChange}
                min="1"
                placeholder="Número de plazas"
                className={errors.plazasDisponibles ? 'error' : ''}
                disabled={loading}
              />
              {errors.plazasDisponibles && <span className="error-message">{errors.plazasDisponibles}</span>}
            </div>

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

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

