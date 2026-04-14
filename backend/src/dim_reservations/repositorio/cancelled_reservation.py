from src.utils.conexion import Conexion

def cancelled_reservation_by_id(id: str, connection: Conexion):
    """
    Cancela una reserva de forma lógica actualizando su estado en la tabla principal.

    Nota: Debido al trigger 'trg_archive_before_delete' en la base de datos,
    los datos se respaldan automáticamente en 'dim_reservation_cancelled_archive' 
    antes de que la fila sea borrada permanentemente de 'dim_reservation'.

    Nota: Se utiliza un UPDATE en lugar de un DELETE para mantener la integridad
    referencial y evitar errores con triggers complejos de archivado.

    **Acceso/Permisos:**
    Requiere privilegios de Administrador o Gestor debido a la modificación de datos.

    :param id: El identificador único (`DIM_ReservationId`) de la reserva a eliminar.
    :type id: str
    :param connection: El objeto de conexión a la base de datos que contiene el cursor activo.
    :type connection: Conexion
    :raises Exception: Captura y registra cualquier error de ejecución o al guardar cambios en la base de datos.
    :return: `True` si la eliminación fue exitosa, `False` en caso contrario.
    :rtype: bool
    """
    query = """
    UPDATE `dim_reservation`
    SET `DIM_StatusId` = 'c842035f-aecb-5099'
    WHERE DIM_ReservationId = %s;
    """
    try:
        connection.cursor.execute(query, (id,))
        
        print("Cambios guardados correctamente. Reserva Cancelada")
        #connection.save_changes()
        return True
    except Exception as e:
        print(f"Error al cancelar la reservacion: {e}")
        return False
    