// src/api/axiosInstance.js (o donde lo vayas a guardar)

import axios from 'axios';

// 1. Crear la instancia de Axios
const axiosInstance = axios.create({
  /**
   * URL base de tu API.
   * Se toma desde las variables de entorno de Vite.
   * Asegúrate de tener un archivo .env en la raíz de tu proyecto.
   */
  baseURL: "http://127.0.0.1:5000/api/",
  
  /**
   * Tiempo máximo de espera para una petición (en milisegundos).
   */
  timeout: 10000,
  
  /**
   * Cabeceras estáticas que irán en TODAS las peticiones.
   */
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// 2. Crear un interceptor de peticiones
// Esto se ejecuta ANTES de que cada petición sea enviada.
axiosInstance.interceptors.request.use(
  (config) => {
    // --- ESTA ES LA LÓGICA PARA LOS TOKENS ---
    // (Si no hay token, simplemente no hace nada y la petición se va)
    
    // 1. Recuperar la cadena de texto JSON de localStorage
    const tokensString = localStorage.getItem('tokens'); // O como llames a tu item
    
    if (tokensString) {
      try {
        // 2. Parsear la cadena para convertirla en un objeto
        const tokens = JSON.parse(tokensString);
        
        // 3. Si el accessToken existe, añadirlo a la cabecera
        // (Uso la misma estructura que tenías: tokens?.tokens?.access_token)
        if (tokens?.tokens?.access_token) {
          config.headers['Authorization'] = `Bearer ${tokens.tokens.access_token}`;
        }
      } catch (error) {
        console.error("Error al parsear los tokens desde localStorage:", error);
      }
    }
    
    // 4. Devolver la configuración modificada (o la original si no hubo token)
    return config;
  }, 
  (error) => {
    // Manejar un error que ocurra durante la configuración de la petición
    return Promise.reject(error);
  }
);

// 3. Exportar la instancia
export default axiosInstance;