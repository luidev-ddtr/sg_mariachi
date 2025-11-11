import axiosInstance from "./axiosInstance";

export const ArchivarReservacion = async (id) => {
    try {
        // Validar que se proporcionó una fecha
        if (!id) {
            return "";
        }

        console.log("Id enviada a api/reservation/archive:", id);

        // Hacer la petición GET con el parámetro de fecha
        const response = await axiosInstance.get('reservation/archive', {
            params: { id }
        });
        
        console.log("Respuesta del servidor al archivar reservacion:", response.data);
        
        return response.data.body;
        
    } catch (error) {
        // Manejo mejorado de errores
        let errorMessage = 'Error desconocido al archivar la reservacion';
        
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