import axios from 'axios';

// 1. Obtenemos la URL base desde las variables de entorno de Vite.
//    - En producción (`npm run build`), Vite usará el valor de `VITE_API_BASE_URL` del archivo `.env.production`.
//    - En desarrollo (`npm run dev`), `import.meta.env.VITE_API_BASE_URL` será `undefined`, por lo que se usará 'http://localhost:5000'.
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Creamos una instancia de Axios con configuración centralizada.
const axiosInstance = axios.create({
  /**
   * URL base dinámica para tu API.
   * Agregamos '/api/' al final, ya que todas tus rutas del backend lo usan.
   */
  baseURL: `${apiBaseUrl}/api/`,
  /**
   * Tiempo máximo de espera para una petición (en milisegundos).
   */
  timeout: 10000,
  // Esta linea es clave ya que permite al Axios envíar y recibir cookies
  // en peticiones de otros dominios/puertos (Cross-Origin).
  withCredentials: true,
});

// 3. Exportamos la instancia para usarla en otros archivos.
export default axiosInstance;