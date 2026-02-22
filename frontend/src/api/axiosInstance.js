import axios from 'axios';

// Creamos una instancia de Axios con configuración centralizada.
const axiosInstance = axios.create({
  /**
   * URL base de tu API.
   * NOTA: Usar 127.0.0.1 en lugar de 'localhost' a veces puede
   * evitar problemas de resolución de DNS en algunos sistemas.
   */
  baseURL: "http://localhost:5000/api/", // Usamos localhost para que coincida con el dominio del frontend
  
  /**
   * Tiempo máximo de espera para una petición (en milisegundos).
   */
  timeout: 10000,
  
  // ¡ESTA ES LA LÍNEA CLAVE! Le dice a Axios que envíe y reciba cookies
  // en peticiones a otros dominios/puertos (Cross-Origin).
  withCredentials: true,
});

// 3. Exportamos la instancia para usarla en otros archivos.
export default axiosInstance;