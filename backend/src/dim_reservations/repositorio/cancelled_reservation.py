from src.utils.conexion import Conexion

def cancelled_reservation_by_id(id: str, connection: Conexion):
    """
    Archiva lógicamente una reserva en la base de datos por su ID.

    Esta operación realiza una "eliminación suave" (`soft delete`) al actualizar 
    el campo `DIM_StatusId` a un estado predefinido de 'Archivado' ('cw42055f-3ecb-9099').
    El registro permanece en la base de datos, pero su estatus lo marca como inactivo.

    **Acceso/Permisos:**
    Requiere privilegios de Administrador o Gestor debido a la modificación de datos.

    :param id: El identificador único (`DIM_ReservationId`) de la reserva a archivar.
    :type id: str
    :param connection: El objeto de conexión a la base de datos que contiene el cursor activo.
    :type connection: Conexion
    :raises Exception: Captura y registra cualquier error de ejecución o al guardar cambios en la base de datos.
    :return: `True` si la actualización y el guardado de cambios son exitosos, `False` en caso contrario.
    :rtype: bool
    """
    query = """
    UPDATE
        `dim_reservation`
    SET
        `DIM_StatusId` = 'c842035f-aecb-5099'
    WHERE
        DIM_ReservationId = %s;
    """
    try:
        connection.cursor.execute(query, (id,))
        
        print("✅ Cambios guardados correctamente. Reserva Cancelada")
        connection.save_changes()
        return True
    except Exception as e:
        print(f"Error al cancelar la reservacion: {e}")
        return False
    