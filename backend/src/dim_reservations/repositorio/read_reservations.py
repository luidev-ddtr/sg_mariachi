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