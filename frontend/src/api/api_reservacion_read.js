import axiosInstance from "./axiosInstance";

export const GetReservaciones = async (date) => {
    try {
        // Validar que se proporcionó una fecha
        if (!date) {
            return { 
                success: false, 
                message: "La fecha es requerida para obtener las reservaciones.", 
                data: [] 
            };
        }

        console.log("Fecha enviada a api/reservation/read:", date);

        // Hacer la petición GET con el parámetro de fecha
        const response = await axiosInstance.get('reservation/read', {
            params: { date }
        });
        
        console.log("Respuesta del servidor al obtener reservaciones:", response.data);
         
        return {
            success: response.data.status || true,
            message: response.data.message,
            data: response.data.body || []
        };
        
    } catch (error) {
        // Manejo mejorado de errores
        let errorMessage = 'Error desconocido al obtener las reservaciones';
        
        if (error.response) {
            // El servidor respondió con un status fuera del rango 2xx
            console.error("Error de respuesta:", error.response.data);
            errorMessage = error.response.data?.message || 
                          error.response.data?.error || 
                          `Error ${error.response.status}: ${error.response.statusText}`;
        }  else {
            // Algo pasó en la configuración de la petición
            console.error("Error de configuración:", error.message);
            errorMessage = error.message || 'Error al configurar la petición';
        }
        
        throw new Error(errorMessage);
    }
};
/**
 * Devuelve todas las reservaciones.
 */
/**
 * ¡FUNCIÓN CLAVE! Obtiene una reservación por su ID.
 */
export const GetReservacionPorId = async (id) => {
  const todasLasReservaciones = await GetReservaciones(new Date());
  // Buscamos la reservación que coincida con el ID
  const evento = todasLasReservaciones.find(item => item.DIM_DateId == id);
  return evento || null;
};
//export default data_base;
