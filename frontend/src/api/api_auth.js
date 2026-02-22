import axiosInstance from "./axiosInstance";

export const logoutUser = async () => {
    try {
        // 1. Petición al backend para que limpie la cookie de sesión
        await axiosInstance.post('auth/logout');
        
        // 2. Redirigir al usuario al login
        window.location.href = '/pages/login.html'; 
        
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        // Incluso si falla la API, deberías sacar al usuario visualmente
        window.location.href = '/pages/login.html';
    }
};

export const checkSession = async () => {
    try {
        const response = await axiosInstance.get('auth/check_session');
        // Si responde 200, retornamos los datos del usuario
        return response.data; 
    } catch (error) {
        // Si responde 401 u otro error, retornamos null indicando que no hay sesión
        return null;
    }
};

export const loginUser = async (credentials) => {
    try {
        const response = await axiosInstance.post('auth/login', credentials);
        return response.data;
    } catch (error) {
        if (error.response) {
            return error.response.data;
        }
        return { status: 'error', message: 'Error de conexión con el servidor' };
    }
};
