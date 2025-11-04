(function () {
  var isLocal =
    location.hostname === 'localhost' || location.hostname === '127.0.0.1';

  window.APP_CONFIG = {
    REACT_APP_API_URL: isLocal
      ? 'http://localhost:8080/api'
      : 'https://proyectoa3.onrender.com/api',
    REACT_APP_USE_MOCKS: false
  };
})();
