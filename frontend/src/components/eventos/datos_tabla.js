/**
 * @file datos_tabla.js
 * @description Contiene datos de prueba constantes para simular la API.
 */

// Simula la respuesta que vendría de la API (get_reservacion_por_id)
export const EVENTO_PRUEBA = {
    DIM_Name: "Ángel (Prueba)",
    DIM_SecondName: "Gabriel",
    DIM_LastName: "Pérez",
    DIM_SecondLastName: "Hernández",
    DIM_PhoneNumber: "7711223344",
    DIM_Address: "Calle de la Simulación 123", // Dirección Cliente
    DIM_EventAddress: "Salón El Mariachi", // Dirección Evento (Localidad)
    DIM_EventMunicipality: "Ixmiquilpan",
    DIM_EventState: "Hgo.",
    DIM_TotalAmount: 7800,
    DIM_Notes: "Datos cargados desde 'datos_tabla.js'.",
    // Simula fechas en formato ISO (así vendrían de la BD)
    DIM_StartDate: "2025-11-20T14:00:00",
    DIM_EndDate: "2025-11-20T19:00:00"
};