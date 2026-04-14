import axiosInstance from "./axiosInstance";

/**
 * API dedicada exclusivamente al cambio de contraseña del administrador.
 * @param {Object} data - Contiene id, cp_actual y cp_nueva
 */
export const updateAdministratorPassword = async (data) => {
    try {
        const response = await axiosInstance.put('admin/change-password', data);
        return response.data;
    } catch (error) {
        console.error("Error al actualizar contraseña:", error);
        throw {
            status: error.response?.status || 500,
            message: error.response?.data?.message || "Error al conectar con el servidor"
        };
    }
};