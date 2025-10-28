// src/components/events/CreateEventForm.js
import React, { useState } from 'react';
import './CreateEventForm.css';

export default function CreateEventForm({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    titulo: '',
    etiquetas: '',
    fecha: '',
    idioma: '',
    plazasDisponibles: '',
    lugar: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título del evento es requerido';
    }


    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es requerida';
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

    try {
      // TODO: Implementar llamada al backend cuando esté disponible
      // Por ahora solo simulamos la creación exitosa
      console.log('Datos del evento a crear:', formData);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Resetear formulario
      setFormData({
        titulo: '',
        etiquetas: '',
        fecha: '',
        idioma: '',
        plazasDisponibles: '',
        lugar: ''
      });

      // Llamar al callback de éxito
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error al crear el evento:', error);
      alert('Error al crear el evento. Inténtalo de nuevo.');
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

        <form onSubmit={handleSubmit} className="create-event-form">
          <div className="form-group">
            <label htmlFor="titulo">Título del Evento *</label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Idioma"
              className={errors.titulo ? 'error' : ''}
            />
            {errors.titulo && <span className="error-message">{errors.titulo}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="etiquetas">Etiquetas *</label>
            <select
              id="etiquetas"
              name="etiquetas"
              value={formData.etiquetas}
              onChange={handleChange}
              className={errors.etiquetas ? 'error' : ''}
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
              />
              {errors.fecha && <span className="error-message">{errors.fecha}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="idioma">Idioma *</label>
              <select
                id="idioma"
                name="idioma"
                value={formData.idioma}
                onChange={handleChange}
                className={errors.idioma ? 'error' : ''}
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

