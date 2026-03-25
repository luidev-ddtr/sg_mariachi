import axiosInstance from "./axiosInstance";

export const GetAdminInfo = async () => {
    try{
        // Hacemos GET en lugar de POST. No enviamos ID explícito, 
        // el backend lo toma de la cookie de sesión (g.user).
        const response = await axiosInstance.get('admin/profile');
        return response.data; // El backend devuelve { status, message, body: {...} }
    }
    catch (error) {
        console.error("Error en GetAdminInfo:", error);
        // Retornar null para que la UI sepa que falló
        return null;
    }
}

export const getAdministrators = async () => {
    try {
        const response = await axiosInstance.get('admin/list');
        return response.data.body;
    } catch (error) {
        console.error("Error al obtener administradores:", error);
        throw error;
    }
};