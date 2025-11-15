import axiosInstance from "./axiosInstance";

export const ArchivarReservacion = async (id) => {
    try {
        if (!id) {
            throw new Error("ID de reservación es requerido");
        }

        console.log("Id enviada a api/reservation/archive:", id);
        const data = { 'DIM_ReservationId': id}

        console.log("infromacion final= ",data)
        // Petición DELETE con parámetro de consulta
        const response = await axiosInstance.post('reservation/archive', data);
        
        console.log("Respuesta del servidor al archivar reservacion:", response.data);
        
        return response.data.body;
        
    } catch (error) {
        // Manejo de errores (igual que tu código actual)
        let errorMessage = 'Error desconocido al archivar la reservacion';
        
        if (error.response) {
            console.error("Error de respuesta:", error.response.data);
            errorMessage = error.response.data?.message || 
                          error.response.data?.error || 
                          `Error ${error.response.status}: ${error.response.statusText}`;
        } else {
            console.error("Error de configuración:", error.message);
            errorMessage = error.message || 'Error al configurar la petición';
        }
        
        throw new Error(errorMessage);
    }
};