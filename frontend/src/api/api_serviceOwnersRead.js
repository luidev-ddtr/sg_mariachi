import axiosInstance from "./axiosInstance";

export const GetAdminInfo = async (id) => {
    try{
        if (!id) return null;
        console.log("ID enviado a api/admin/profile:", id);
        const data = { 'DIM_EmployeeId': id };
        
        const response = await axiosInstance.post('admin/profile', data);
        console.log("Respuesta del servidor al obtener información del administrador:", response.data);
        return response.data.body;
    }
    catch (error) {
        console.error();

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