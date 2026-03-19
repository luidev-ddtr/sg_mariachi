import axiosInstance from "./axiosInstance";

/**
 * Actualiza la información de un administrador.
 * Envía una petición PUT al backend con la estructura transaccional requerida.
 * 
 * @param {Object} formData - Objeto plano con los datos del formulario.
 * @param {string} employeeId - ID del empleado a actualizar.
 */
export const updateAdministrator = async (formData, employeeId) => {
    try {
        // Estructuramos el payload como lo espera admin_route.py (updateServiceowners)
        const payload = {
            DIM_EmployeeId: employeeId,
            people_data: {
                DIM_Name: formData.nombre,
                DIM_LastName: formData.apellido_paterno,
                DIM_SecondLastName: formData.apellido_materno,
                DIM_PhoneNumber: formData.telefono,
                DIM_Email: formData.email,
                DIM_Address: formData.direccion
            },
            employ_data: {
                DIM_Position: formData.rol 
            },
            serviceowner_data: {
                DIM_Username: formData.usuario
                // La contraseña se maneja por separado o si viene en formData se agrega aquí
            }
        };

        const response = await axiosInstance.put('admin/update', payload);
        return response.data;

    } catch (error) {
        console.error("Error al actualizar administrador:", error);
        throw error;
    }
};
