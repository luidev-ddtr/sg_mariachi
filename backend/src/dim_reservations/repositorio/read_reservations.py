from src.dim_reservations.view_reservation_model import VIEWReservation
from src.utils.conexion import Conexion


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
        return [VIEWReservation(*row) for row in result]
    except Exception as e:
        print(f"Error al ejecutar la consulta: {e}")
        return []