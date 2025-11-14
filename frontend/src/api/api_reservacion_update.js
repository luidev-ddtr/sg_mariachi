import axiosInstance from "./axiosInstance";

/**
 * API: Cambia el estado de una reservación a "Archivado".
 * @param {string} reservationId - El ID de la reservación a archivar.
 */
export const updateReservation = async (reservacion_data) => {
    try {
        // Validar que se proporcionó un ID de reservación
        if (!reservacion_data) {
            throw new Error("No se proporcionó datos para actualizar la reservación");
        }

        console.log(`Enviando solicitud de actualización para el ID: ${reservacion_data}`);

        // Hacer la petición PUT/PATCH para actualizar el estado de la reservación
        const response = await axiosInstance.post(`reservation/update/`, reservacion_data);
        
        console.log("Respuesta del servidor al actualizar reservación:", response.data);
        
        return response.data.body; 
        
    } catch (error) {
        // Manejo mejorado de errores
        let errorMessage = 'Error desconocido al actualizar la reservación';
        
        if (error.response) {
            // El servidor respondió con un status fuera del rango 2xx
            console.error("Error de respuesta:", error.response.data);
            errorMessage = error.response.data?.message || 
                          error.response.data?.error || 
                          `Error ${error.response.status}: ${error.response.statusText}`;
        } else if (error.request) {
            // La petición fue hecha pero no se recibió respuesta
            console.error("Error de red:", error.request);
            errorMessage = 'Error de conexión: No se pudo contactar al servidor';
        } else {
            // Algo pasó en la configuración de la petición
            console.error("Error de configuración:", error.message);
            errorMessage = error.message || 'Error al configurar la petición';
        }
        
        throw new Error(errorMessage);
    }
};