from src.utils.conexion import Conexion


#Explicacion de cambios, por la naturalez del sistema, no puede ser persistenter, las fechas de las reservaciones
# sin embargo se opto por la opcion de que si se modifica alguna reservacion, se guarde la fecha de cuando se modifico, mas no la fecha de cuando se creo.
def update_reservation(date_id:str, StartDate:str, EndDate:str, NHours:int, TotalAmount:int, Notes:str, ReservationId: str, conn: Conexion):
    """
    Parametros:
    :param date_id: Identificador de la fecha (Foreign Key a la dimensión de tiempo, 'dim_date').
                    Aunque la fecha de inicio/fin de la reserva no se actualiza, este ID
                    generalmente se refiere a la fecha en que se realizó la modificación.
    :type date_id: str
    :param StartDate: Fecha de inicio de la reserva. Se incluye en la actualización,
                      pero según la lógica del sistema, su valor no debería cambiar.
    :type StartDate: str
    :param EndDate: Fecha de fin de la reserva. Se incluye en la actualización,
                    pero según la lógica del sistema, su valor no debería cambiar.
    :type EndDate: str
    :param NHours: Número de horas de duración de la reserva.
    :type NHours: int
    :param TotalAmount: Monto total de la reserva (incluye impuestos, cargos, etc.).
    :type TotalAmount: int
    :param Notes: Comentarios o notas adicionales sobre la reserva.
    :type Notes: str
    :param ReservationId: Identificador único de la reserva a actualizar (Primary Key de 'dim_reservation').
    :type ReservationId: str
    :param conn: Objeto de conexión a la base de datos, que contiene el cursor para ejecutar la query.
    :type conn: Conexion
    
    :raises Exception: Captura cualquier error que ocurra durante la ejecución de la consulta SQL.

    :returns: **True** si la actualización fue exitosa y los cambios se guardaron.
              **False** si ocurrió un error durante el proceso de actualización.
    :rtype: bool

    **Detalles de la Query:**
    La consulta SQL es un `UPDATE` a la tabla `dim_reservation`.
    Los campos actualizados son:
    * `dim_dateId`
    * `DIM_StartDate`
    * `DIM_EndDate`
    * `DIM_NHours`
    * `DIM_TotalAmount`
    * `DIM_Notes`
    La actualización se aplica únicamente al registro donde `DIM_ReservationId` coincide con el valor proporcionado.
    """
    query = """
    UPDATE
        `dim_reservation`
    SET
        `dim_dateId` = %s,
        `DIM_StartDate` = %s,
        `DIM_EndDate` = %s,
        `DIM_NHours` = %s,
        `DIM_TotalAmount` = %s,
        `DIM_Notes` = %s
    WHERE
        `DIM_ReservationId` = %s
                """
    try:
        values = (date_id, StartDate, EndDate, NHours, TotalAmount, Notes, ReservationId)
        print("Esta es la query: ", query)
        print("Estos son los valores", values)
        
        conn.cursor.execute(query, values)
        conn.save_changes()
        return True
    except Exception as err:
        print(f"Error al actualizar la reserva: {err}")
        return False