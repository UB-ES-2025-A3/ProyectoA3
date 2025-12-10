

# usar react-i18next

# Paso 1 : instalar la libreria 

npm install i18next react-i18next

# Paso 2 : Crear el archivo de configuración i18n.js

Actualmente esta en `src/i18n.js`

``` js

// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  es: {
    translation: {
      welcome: 'Bienvenido a mi web',
      home_title: 'Página principal',
      login_button: 'Iniciar sesión',
      logout_button: 'Cerrar sesión'
    }
  },
  en: {
    translation: {
      welcome: 'Welcome to my website',
      home_title: 'Home',
      login_button: 'Log in',
      logout_button: 'Log out'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es',            // idioma por defecto
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false  // React ya hace el escape
    }
  });

export default i18n;

```


# Paso 3 : añadir imports al index 

import './i18n'; //  importante importar antes de usar <App />

# Paso 4 : Añadir el boton para cambiar de idioma 

En la navbar añadir el código para cambiar el idioma
En el css añadir los colores 

# Paso 5 : Usar las traducciones en cualquier página

``` js 
// src/pages/Home.jsx
import { useTranslation } from 'react-i18next';

function Home() {
  const { t } = useTranslation();

  return (
    <div className="page">
      <h1>{t('welcome')}</h1>
      <button>{t('login_button')}</button>
    </div>
  );
}

export default Home;

```

``` js

// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;

``` 