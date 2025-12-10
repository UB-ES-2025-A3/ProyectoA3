// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from './locales/es.json';
import en from './locales/en.json';
import cat from './locales/cat.json';

const resources = {
  es: {
    translation: es
  },
  en: {
    translation: en
  },
  cat: {
    translation: cat
  }
};

// leer idioma guardado (si existe)
const savedLang =
  typeof window !== 'undefined'
    ? localStorage.getItem('lang')
    : null;

// idioma inicial = el guardado o 'es'
const initialLang = savedLang || 'es';


i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLang,
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
