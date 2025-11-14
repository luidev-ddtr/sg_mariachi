// /api/api_reservacion_update.js

/**
 * SIMULACIÓN DE API: Cambia el estado de una reservación a "Archivado".
 * @param {string} reservationId - El ID de la reservación a archivar.
 */
export const ArchiveReservacion = async (reservationId) => {
  
  // 1. Imprimimos en consola para saber que se llamó
  console.log(`Simulando archivado para el ID: ${reservationId}`);

  // 2. Simulamos un retraso de red (1 segundo)
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 3. Simulamos una respuesta de éxito
  console.log("Simulación completada. La API 'ficticia' tuvo éxito.");
  
  return { 
    success: true, 
    message: "Reservación archivada (simulado)" 
  };

  // --- Para probar errores ---
  // Si alguna vez quieres probar tu 'catch', borra el 'return' 
  // de arriba y descomenta la siguiente línea:
  // throw new Error("Error de simulación: El servidor no responde");
};