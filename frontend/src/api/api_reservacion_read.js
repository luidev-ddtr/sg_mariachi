import axiosInstance from "./axiosInstance";

export const GetReservaciones = async (date) => {
    try {
        // Validar que se proporcionó una fecha
        if (!date) {
            return [];
        }

        console.log("Fecha enviada a api/reservation/read:", date);

        // Hacer la petición GET con el parámetro de fecha
        const response = await axiosInstance.get('reservation/read', {
            params: { date }
        });
        
        console.log("Respuesta del servidor al obtener reservaciones:", response.data);
         
        return response.data.body;
        
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
  const evento = todasLasReservaciones.find(item => item.DIM_ReservationId == id);
  return evento || null;
};
//export default data_base;


export const GetContractInfo = async (id) => {
    try {
        // Validar que se proporcionó un ID
        if (!id) {
            return null;
        }

        console.log("ID enviado a api/reservation/get_contract:", id);

        // Hacer la petición POST enviando el ID como payload
        const response = await axiosInstance.post(
            'reservation/get_contract',
            { id }   // <- el backend lo recibe como JSON
        );

        console.log("Respuesta del servidor al obtener contrato:", response.data);

        // Retornar el cuerpo tal como lo hace GetReservaciones
        return response.data.body;

    } catch (error) {
        // Manejo mejorado de errores
        let errorMessage = 'Error desconocido al obtener la información del contrato';

        if (error.response) {
            // El servidor respondió con un status fuera del rango 2xx
            console.error("Error de respuesta:", error.response.data);
            errorMessage = error.response.data?.message ||
                           error.response.data?.error ||
                           `Error ${error.response.status}: ${error.response.statusText}`;
        } else {
            // Algo pasó en la configuración de la petición
            console.error("Error de configuración:", error.message);
            errorMessage = error.message || 'Error al configurar la petición';
        }

        throw new Error(errorMessage);
    }
};
// Esta e sla funcion que retornara toda la infromacion, de la api
// se devuelve en este formato.
// [
//         {
//         id: "j9h8g7f6e5d4c3b2a1", // otro hash de ejemplo
//         contratante_nombre: "Ana López",
//         evento_lugar: "Auditorio Principal hidalgo mexico",
//         evento_dia: "20",
//         evento_mes: "10",
//         evento_anio: "2025",
//         evento_horas: 4,
//         evento_hora_inicio: "2025-10-20T16:00",
//         evento_hora_fin: "2025-10-20T20:00",
//         pago_total: 4000,
//         contratante_domicilio: "Avenida Siempre Viva 456, Ciudad",
//         contratante_telefono: "234567890",
//         contratante_segundo_telefono: "876543210"
//     }
// ]
