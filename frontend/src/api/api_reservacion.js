import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://127.0.0.1:5000/api",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});

export const crear_reservacion = async (data) => {
    try {
        // Verificar si el diccionario de datos está vacío
        if (Object.keys(data).length === 0) {
            return { success: true, message: "No hay datos para crear la reservación.", data: [] };
        }

        //console.log("Payload enviado a api/reservation/create:", data);
        const response = await axiosInstance.post('reservation/create/', data);
        
        //console.log("Respuesta del servidor al crear reservación:", response.data);
        
        return {
            success: response.data.status || false,
            message: response.data.message,
            data: response.data.body
        };
        
    } catch (error) {
        // Manejo mejorado de errores
        let errorMessage = 'Error desconocido al crear la reservación';
        
        if (error.response) {
            // El servidor respondió con un status fuera del rango 2xx
            console.error("Error de respuesta:", error.response.data);
            errorMessage = error.response.data?.message || 
                          error.response.data?.error || 
                          `Error ${error.response.status}: ${error.response.statusText}`;
        } else if (error.request) {
            // La petición fue hecha pero no se recibió respuesta
            console.error("No se recibió respuesta:", error.request);
            errorMessage = 'No se recibió respuesta del servidor';
        } else {
            // Algo pasó en la configuración de la petición
            console.error("Error de configuración:", error.message);
            errorMessage = error.message || 'Error al configurar la petición';
        }
        
        throw new Error(errorMessage);
    }
};

// Ejemplo de uso:
/*
const datosReservacion = {
    "DIM_EventAddress": "san monica de Santa elena el Bajio Guanaguato mexico",
    "DIM_StartDate": "2026-01-05 14:00:00",
    "DIM_EndDate": "2026-01-05 19:00:00",
    "DIM_NHours": 5.0,
    "DIM_TotalAmount": 1000.0,
    "DIM_Notes": "mariachis para xv de color verde pantano",
    "DIM_Name": "valor_a_reemplazar",
    "DIM_SecondName": "perez",
    "DIM_LastName": "Garcia",
    "DIM_SecondLastName": "Cruz",
    "DIM_PhoneNumber": "123456789",
    "DIM_SecondPhoneNumber": "123456789",
    "DIM_Address": "123 Main St"
};

// Uso de la función
crear_reservacion(datosReservacion)
    .then(resultado => {
        console.log("Reservación creada:", resultado);
    })
    .catch(error => {
        console.error("Error:", error.message);
    });
*/