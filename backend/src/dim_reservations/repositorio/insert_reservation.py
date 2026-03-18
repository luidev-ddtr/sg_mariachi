from src.utils.conexion import Conexion
from src.dim_reservations.reservation_model import Reservation


def insert_reservation(data_reservation: Reservation, object_coon: Conexion) -> bool:
    """
    Inserta una nueva reserva en la tabla 'dim_reservation' de la base de datos.

    Esta función toma un objeto de reserva y un objeto de conexión a la base de
    datos para ejecutar una consulta SQL de inserción. Está diseñada para ser
    utilizada por el sistema de back-end (por ejemplo, un servicio de ingesta de datos
    o un módulo de API) que maneja las operaciones de persistencia de datos.

    Args:
        data_reservation (Reservation): Un objeto de la clase 'Reservation'
            que contiene todos los atributos (ID, IDs de dimensión relacionados,
            dirección del evento, fechas, montos, etc.) para la nueva reserva a insertar.
            Los datos son extraídos directamente de los atributos de este objeto
            para la ejecución de la consulta.
        object_coon (Conexion): Un objeto de la clase 'Conexion' que maneja la
            conexión activa a la base de datos, incluyendo el cursor necesario
            para ejecutar la consulta y la función para guardar los cambios.

    Returns:
        bool: Retorna True si la inserción se realiza con éxito y los cambios
            son guardados en la base de datos. Retorna False si ocurre una excepción
            durante la ejecución de la consulta o al guardar los cambios.

    Raises:
        Exception: Captura cualquier excepción que pueda ocurrir durante la
            ejecución de 'object_coon.cursor.execute()' o 'object_coon.save_changes()',
            imprimiendo el error específico y devolviendo False.

    Acceso:
        Esta función debe ser ejecutada por un usuario de base de datos que tenga
        permisos de **INSERT** sobre la tabla 'dim_reservation'. Típicamente,
        esto sería una cuenta de servicio o un usuario con privilegios de escritura
        del sistema ETL o la aplicación.
    """
    query = """
INSERT INTO `dim_reservation` (
    `DIM_ReservationId`,
    `DIM_PeopleId`,
    `DIM_StatusId`,
    `DIM_DateId`,
    `DIM_ServiceOwnersId`,
    `DIM_EventAddress`,
    `DIM_StartDate`,
    `DIM_EndDate`,
    `DIM_NHours`,
    `DIM_TotalAmount`,
    `DIM_Notes`
    )
    VALUES (
        %s,
        %s, 
        %s,
        %s,
        %s,
        %s,
        %s,
        %s,
        %s,
        %s,
        %s  -- Este era el que faltaba
    );
    """
    try:
        values = (
            data_reservation.DIM_ReservationId,
            data_reservation.DIM_PeopleId,
            data_reservation.DIM_StatusId,
            data_reservation.DIM_DateId,
            data_reservation.DIM_ServiceOwnersId,
            data_reservation.DIM_EventAddress,
            data_reservation.DIM_StartDate,
            data_reservation.DIM_EndDate,
            data_reservation.DIM_NHours,
            data_reservation.DIM_TotalAmount,
            data_reservation.DIM_Notes
        )
        print(f"Estos son los valores: {values}")
        print(f"Esto es la query: {query}")
        object_coon.cursor.execute(query, values)
        
        print("Cambios guardados correctamente. Reserva creada")
        object_coon.save_changes()
        
        return True
    except Exception as err:
        print(f"Error al registrar la reserva: {err}")
        object_coon.conn.rollback()
        return False