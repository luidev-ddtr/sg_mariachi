import axiosInstance from "./axiosInstance";

export const GetStats = async (filterType = 'month', year) => {
    try {
        console.log("Filtros enviados a api/revenues/stats:", filterType, year);

        // Hacer la petición GET con los parámetros correctos que espera el backend
        const response = await axiosInstance.get('revenues/stats', {
            params: { 
                filter_type: filterType,
                year: year 
            }
        });
        
        console.log("Respuesta del servidor al obtener estadísticas:", response.data);
         
        return response.data.body;
        
    } catch (error) { 
        // Manejo mejorado de errores
        let errorMessage = 'Error desconocido al obtener las estadísticas';
        
        if (error.response) {
            // El servidor respondió con un status fuera del rango 2xx
            errorMessage = `Error del servidor: ${error.response.status} - ${error.response.data?.message || 'Error desconocido'}`;
        } else if (error.request) {
            // No se recibió respuesta del servidor
            errorMessage = 'No se recibió respuesta del servidor';
        }
        console.error("Error al obtener estadísticas:", errorMessage);
        throw new Error(errorMessage);
    }
}