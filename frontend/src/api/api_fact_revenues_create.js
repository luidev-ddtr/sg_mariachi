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
        if (!data || !data.DIM_ReservationId || !data.Amount || !data.DIM_DateId) {
            throw new Error("Faltan datos obligatorios para registrar el pago (ID de reservación, ID de fecha o Monto).");
        }

        // Construimos el payload que el backend espera.
        // El backend espera 'FACT_PaymentAmount', no 'Amount'.
        const payload = {
            DIM_ReservationId: data.DIM_ReservationId,
            DIM_DateId: data.DIM_DateId,
            FACT_PaymentAmount: data.Amount // Mapeo de 'Amount' a 'FACT_PaymentAmount'
        };

        console.log("Enviando pago a api/revenues/create:", payload);

        // La ruta 'revenue/create' es correcta.
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