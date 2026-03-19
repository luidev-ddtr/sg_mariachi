import axiosInstance from "./axiosInstance";

/**
 * 1. Eliminar al administrador de la base de datos
 */
export const deleteAdministrator = async (employeeId) => {
    try {
        if (!employeeId) throw new Error("ID de empleado es requerido para eliminar.");

        const response = await axiosInstance.delete(`admin/delete/${employeeId}`);
        return response.data;
    } catch (error) {
        console.error("Error al eliminar administrador:", error);
        throw error; // Re-lanzamos para manejarlo en la UI
    }
};