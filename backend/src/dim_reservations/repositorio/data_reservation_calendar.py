from src.utils.conexion import Conexion
from typing import Optional

def get_reservation_stats(conn: Conexion, filter_type: str, year: int, month: Optional[int] = None) -> list:
    """
    get_reservation_stats
    Obtiene información de las reservas por día, semana, mes y año
    
    Args:
        conn: Objeto de la función conexion.
        filter_type (str): Tipo de filtro ('day', 'week', 'month', 'year').
        year (int): Año para filtrar
        month (int, optional): Mes para filtrar (necesario para la vista de mes).
    Returns:
        list: Lista de diccionarios con datos basicos de una reserva
    """

    cursor = conn.cursor
    params = []

    # Vista Detallada: Para Día y Semana mostramos el detalle del evento (Quién, Dónde, Cuándo)
    if filter_type in ['day', 'week']:
        query = """
            SELECT
                V.DIM_fullname as client_name,
                R.DIM_EventAddress as event_address,
                V.DIM_StartDate as start_date,
                V.DIM_EndDate as end_date,
                V.DIM_StatusName as status,
                V.DIM_TotalAmount as total_amount,
                V.DIM_ReservationId as id
            FROM vista_reservaciones V
            JOIN DIM_Date D ON V.DIM_DateId = D.DIM_DateId
            JOIN dim_reservation R ON V.DIM_ReservationId = R.DIM_ReservationId
            WHERE D.Year = %s 
        """
        params.append(year)
        
        # Si nos pasan el mes, filtramos también por mes para no traer todo el año
        if month:
            query += " AND D.Month = %s"
            params.append(month)
            
        query += " ORDER BY V.DIM_StartDate ASC"

    # Vista Mensual: Conteo de eventos por día (ej. "El día 5 hubo 3 eventos")
    elif filter_type == 'month':
        if not month:
            # Si piden filtro por mes pero no envían el mes, retornamos vacío o error
            print("⚠️ Se requiere el mes para el filtro tipo 'month'")
            return []

        query = """
            SELECT
                D.Day as label,
                COUNT(V.DIM_ReservationId) as total_events
            FROM vista_reservaciones V
            JOIN DIM_Date D ON V.DIM_DateId = D.DIM_DateId
            WHERE D.Year = %s AND D.Month = %s
            GROUP BY D.Day
            ORDER BY D.Day ASC
        """
        params = (year, month)

    # Vista Anual: Conteo de eventos por mes (ej. "En Enero hubo 20 eventos")
    elif filter_type == 'year':
        query = """
            SELECT
                D.Month as label,
                COUNT(V.DIM_ReservationId) as total_events
            FROM vista_reservaciones V
            JOIN DIM_Date D ON V.DIM_DateId = D.DIM_DateId
            WHERE D.Year = %s
            GROUP BY D.Month
            ORDER BY D.Month ASC
        """
        params = (year,)
        
    else:
        return []

    try:
        # Convertimos params a tupla antes de ejecutar
        cursor.execute(query, tuple(params))
        results = cursor.fetchall()
        return results
    except Exception as e:
        print(f"❌ Error al obtener estadísticas de reservas: {e}")
        return []
