import axiosInstance from "./axiosInstance";

/**
 * Registra un nuevo pago o abono para una reservación.
 * 
 * @param {object} data - Objeto con los datos del pago.
 * @param {string} data.DIM_ReservationId - ID de la reservación (viene del modal).
 * @param {string} data.DIM_DateId - ID de la fecha de la transacción (viene del modal).
 * @param {number} data.Amount - Monto que el usuario ingresó en el modal.
 * @returns {Promise<object>} Respuesta del servidor.
 */
export const registrarPago = async (data) => {
    try {
        // DIM_DateId es opcional si el backend lo genera, pero validamos lo esencial
        if (!data || !data.DIM_ReservationId || !data.Amount) {
            throw new Error("Faltan datos obligatorios para registrar el pago (ID de reservación o Monto).");
        }

        // Construimos el payload que el backend espera.
        const payload = {
            DIM_ReservationId: data.DIM_ReservationId,
            // Enviamos el DateId si existe, pero lo ideal es que el backend lo asigne
            DIM_DateId: data.DIM_DateId || null, 
            // Aseguramos que el monto sea un número decimal
            FACT_PaymentAmount: parseFloat(data.Amount),
            // Sugerencia: Incluir quién registra el pago si está disponible en la sesión
            DIM_ServiceOwnersId: data.DIM_ServiceOwnersId || null 
        };

        console.log("Enviando pago a api/revenues/create:", payload);

        const response = await axiosInstance.post('revenues/create', payload);
        
        console.log("Respuesta del servidor al registrar pago:", response.data);
         
        return {
            success: response.data.status || false,
            message: response.data.message,
            data: response.data.body
        };
        
    } catch (error) {
        let errorMessage = 'Error desconocido al registrar el pago';
        
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