import axiosInstance from "./axiosInstance";

/**
 * Obtiene el historial de pagos de una reservación.
 * @param {string} reservationId 
 */
export const GetPaymentHistory = async (reservationId) => {
    try {
        // Asumiendo que crearás la ruta 'revenues/history' en el backend
        const response = await axiosInstance.get(`revenues/history/${reservationId}`);
        return response.data.body || [];
    } catch (error) {
        console.error("Error al obtener historial de pagos:", error);
        return [];
    }
};
