from src.dim_reservations.view_reservation_model import VIEWReservation
from src.utils.conexion import Conexion
import datetime

def read_reservations_with_date_filter(year: int, month: int, week: int, object_conection:Conexion)-> list | list[VIEWReservation]:
    """
    Esta funcion retorna de una semana en especifico, recibe los parametros 
    
    Args:
        year (int): año
        month (int): mes
        week (int): semana
        object_conection (Conexion): objeto de conexion
    Returns:
        list: lista de reservaciones
    """
    query = """
    SELECT
    vista_reservaciones.*
    FROM
        vista_reservaciones
    JOIN DIM_Date AS dates
    ON
        dates.DIM_DateId = vista_reservaciones.DIM_DateId
    WHERE
        dates.Year = %s AND dates.Month = %s AND dates.WEEK = %s 
    """
    
    try:
        
        object_conection.cursor.execute(query, (year, month, week))
        result = object_conection.cursor.fetchall()
        if not result:
            return []
        
        print(result)
        #serializar las fehcas a formato js entendible
        data_format = []
        for data in result:
            # Convertir los objetos datetime a strings ISO para JavaScript
            # FullDate: solo fecha (YYYY-MM-DD)
            if isinstance(data['FullDate'], (datetime.date, datetime.datetime)):
                fullDate_str = data['FullDate'].strftime('%Y-%m-%d')
            else:
                fullDate_str = str(data['FullDate'])
            
            # DIM_StartDate y DIM_EndDate: fecha y hora completa (YYYY-MM-DDTHH:MM:SS)
            if isinstance(data['DIM_StartDate'], datetime.datetime):
                start_date_str = data['DIM_StartDate'].strftime('%Y-%m-%dT%H:%M:%S')
            else:
                start_date_str = str(data['DIM_StartDate'])
            
            if isinstance(data['DIM_EndDate'], datetime.datetime):
                end_date_str = data['DIM_EndDate'].strftime('%Y-%m-%dT%H:%M:%S')
            else:
                end_date_str = str(data['DIM_EndDate'])
            
            # Crear el diccionario con los formatos correctos para JS
            reservation_data = {
                'DIM_fullname': data['DIM_fullname'],
                'DIM_PhoneNumber': data['DIM_PhoneNumber'],
                'FullDate': fullDate_str,  # "2025-11-11"
                'DIM_StartDate': start_date_str,  # "2025-11-19T01:00:00"
                'DIM_EndDate': end_date_str,  # "2025-11-19T05:00:00"
                'DIM_TotalAmount': data['DIM_TotalAmount'],
                'DIM_StatusName': data['DIM_StatusName'],
                'DIM_DateId': data['DIM_DateId'],
                'DIM_ReservationId': data['DIM_ReservationId']
            }
            
            data_format.append(reservation_data)

        return data_format
    except Exception as e:
        print(f"Error al ejecutar la consulta: {e}")
        return []
    
    

def get_status_name_by_reservation_id(reservation_id: int, object_conection:Conexion)-> str:
    """
    Obtiene el nombre del estado (status) actual de una reserva específica utilizando su ID.

    Esta función realiza una consulta de unión (JOIN) entre la tabla de Reservaciones 
    (`DIM_Reservation`) y la tabla de Estados (`DIM_Status`) para recuperar el nombre
    legible del estado.

    Args:
        reservation_id (int): El identificador único (`DIM_ReservationId`) de la reserva.
        object_conection (Conexion): El objeto de conexión a la base de datos que contiene el cursor activo.

    Returns:
        str: Retorna el nombre del estado (`DIM_StatusName`) de la reserva si se encuentra.
             Retorna una cadena vacía (`""`) si la reserva no existe, si no tiene estado
             asociado, o si ocurre una excepción durante la ejecución de la consulta.
    Constrains:
        * Se espera que el ID de la reserva sea un `int`, aunque se utiliza un placeholder `%s`
          para prevenir inyección SQL.
        * Si el resultado de la consulta (`object_conection.cursor.fetchone()`) es `None` (no se
          encuentra la reserva), se retorna una cadena vacía.
    """
    query = """
    SELECT
        st.DIM_StatusName
    FROM
        DIM_Reservation AS rsv
    JOIN DIM_Status AS st
    ON
        st.DIM_StatusId = rsv.DIM_StatusId
    WHERE DIM_ReservationId = %s;
    """
    
    try:
        object_conection.cursor.execute(query, (reservation_id,))
        result = object_conection.cursor.fetchone()
        if not result:
            return ""
        return result["DIM_StatusName"]
    except Exception as e:
        print(f"Error al ejecutar la consulta: {e}")
        return ""
    
    
def get_people_id_by_reservation_id(reservation_id: int, object_conection:Conexion)-> str:
    """
    Obtiene el identificador único de la persona (`DIM_PeopleId`) asociada a una reserva específica.
    Args:
        reservation_id (int): El identificador único (`DIM_ReservationId`) de la reserva.
        object_conection (Conexion): El objeto de conexión a la base de datos que contiene el cursor activo.

    Returns:
        str: Retorna el ID de la persona (`DIM_PeopleId`) como una cadena si la reserva se encuentra.
             Retorna una cadena vacía (`""`) si la reserva no existe o si ocurre una excepción
             durante la ejecución de la consulta.
    Constrains:
        * Se espera que `reservation_id` sea un valor numérico (`int`), aunque el manejo
          de la consulta usa el placeholder `%s` para seguridad.
        * El ID de persona se almacena como un `str` (cadena) para mantener la consistencia
          con el tipo de dato devuelto.
        * Si no se encuentra la reserva (el resultado es `None`), se retorna una cadena vacía.
    """
    query = """
    SELECT
        rsv.DIM_PeopleId
    FROM
        DIM_Reservation AS rsv
    WHERE DIM_ReservationId = %s;
    """
    
    try:
        object_conection.cursor.execute(query, (reservation_id,))
        result = object_conection.cursor.fetchone()
        if not result:
            return ""
        return result["DIM_PeopleId"]
    except Exception as e:
        print(f"Error al ejecutar la consulta: {e}")
        return ""