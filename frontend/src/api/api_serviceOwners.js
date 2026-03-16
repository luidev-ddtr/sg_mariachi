import axiosInstance from "./axiosInstance";

/**
 * 1. Crea la persona en la base de datos.
 * Retorna el ID de la persona creada (DIM_PeopleId).
 */
export const createPerson = async (personData) => {
  // personData debe tener: DIM_Name, DIM_LastName, DIM_Address, DIM_PhoneNumber, etc.
  const response = await axiosInstance.post("people/create", personData);
  return response.data.body.DIM_PeopleId;
};

/**
 * 2. Asigna el rol (puesto) a la persona creada.
 * Retorna el ID del empleado (DIM_EmployeeId).
 */
export const assignRole = async (personId, position) => {
  const payload = {
    DIM_PersonId: personId,
    DIM_Position: position, // Ej: "Administrador"
    // DIM_DateId es opcional, el backend lo maneja si no se envía
  };
  
  const response = await axiosInstance.post("employ/assign_role", payload);
  return response.data.body.DIM_EmployeeId;
};

/**
 * 3. Crea las credenciales de acceso para el empleado.
 */
export const createCredentials = async (employeeId, username, password) => {
  const payload = {
    DIM_EmployeeId: employeeId,
    DIM_Username: username,
    DIM_Password: password,
  };

  const response = await axiosInstance.post("admin/register_credentials", payload);
  return response.data.body; // Retorna los datos del usuario creado
};

/**
 * FUNCIÓN ORQUESTADORA (PRINCIPAL)
 * Ejecuta los 3 pasos en secuencia. Si uno falla, el proceso se detiene y lanza error.
 * 
 * @param {Object} formData - Objeto con toda la información del formulario
 */
export const registerNewAdministrator = async (formData) => {
  try {
    console.log("1. Iniciando registro de persona...");
    const personId = await createPerson({
      DIM_Name: formData.firstName,
      DIM_SecondName: formData.secondName || "",
      DIM_LastName: formData.lastName,
      DIM_SecondLastName: formData.secondLastName || "",
      DIM_Address: formData.address,
      DIM_PhoneNumber: formData.phone,
      DIM_SecondPhoneNumber: formData.secondPhone || ""
    });

    console.log("2. Persona creada. Asignando rol...");
    const employeeId = await assignRole(personId, "Administrador");

    console.log("3. Rol asignado. Creando credenciales...");
    await createCredentials(employeeId, formData.username, formData.password);

    console.log("¡Administrador registrado exitosamente!");
    return { success: true, message: "Administrador registrado correctamente" };

  } catch (error) {
    console.error("Falló el registro del administrador:", error.message);
    // Aquí podrías implementar una lógica para revertir cambios si fuera necesario,
    // aunque lo ideal es que el backend maneje transacciones atómicas si se enviara todo junto.
    return { success: false, message: error.message };
  }
};