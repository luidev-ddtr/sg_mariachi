from src.utils.conexion import Conexion

def get_report_data_filtered(filter_value: str, conexion: Conexion) -> list:
    """
    Función unificada para obtener datos detallados de reservaciones para reportes.
    Permite filtrar dinámicamente por Año, Mes o Día usando el operador LIKE.

    Parameters
    ----------
    filter_value : str
        El valor de búsqueda (ej. '2025', '2025-10', '2025-10-22').
    conexion : Conexion
        Conexión activa a la BD.
    """
    query = """
    SELECT 
        'AGENDA_OPERATIVA' AS ActivityType,
        rsv.DIM_ReservationId,
        Vrsv.DIM_fullname,
        rsv.DIM_EventAddress,
        Vrsv.FullDate,
        rsv.DIM_NHours,	
        Vrsv.DIM_StartDate,
        Vrsv.DIM_EndDate,
        Vrsv.DIM_TotalAmount,
        people.DIM_Address,
        people.DIM_PhoneNumber,
        people.DIM_SecondPhoneNumber,
        rsv.DIM_Notes,
        st.DIM_StatusName
    FROM vista_reservaciones AS Vrsv
    JOIN dim_reservation AS rsv ON rsv.DIM_ReservationId = Vrsv.DIM_ReservationId
    JOIN dim_people AS people ON rsv.DIM_PeopleId = people.DIM_PeopleId
    JOIN dim_status AS st ON rsv.DIM_StatusId = st.DIM_StatusId
    WHERE rsv.DIM_StartDate LIKE %s

    UNION ALL

    SELECT 
        'MOVIMIENTO_SISTEMA' AS ActivityType,
        rsv.DIM_ReservationId,
        Vrsv.DIM_fullname,
        rsv.DIM_EventAddress,
        Vrsv.FullDate,
        rsv.DIM_NHours,	
        rsv.DIM_StartDate,
        rsv.DIM_EndDate,
        rsv.DIM_TotalAmount,
        people.DIM_Address,
        people.DIM_PhoneNumber,
        people.DIM_SecondPhoneNumber,
        rsv.DIM_Notes,
        st.DIM_StatusName
    FROM vista_reservaciones AS Vrsv
    JOIN dim_reservation AS rsv ON rsv.DIM_ReservationId = Vrsv.DIM_ReservationId
    JOIN dim_people AS people ON rsv.DIM_PeopleId = people.DIM_PeopleId
    JOIN dim_status AS st ON rsv.DIM_StatusId = st.DIM_StatusId
    JOIN dim_date AS d ON rsv.DIM_DateId = d.DIM_DateId
    WHERE rsv.DIM_Timestamp LIKE %s

    ORDER BY DIM_StartDate ASC;
    """
    
    try:
        # Se pasan dos parámetros para el filtro LIKE (Agenda y Movimientos)
        conexion.cursor.execute(query, (f"{filter_value}%", f"{filter_value}%"))
        results = conexion.cursor.fetchall()
        
        # Asegurar formato ISO para fechas en JSON
        for row in results:
            if row.get('FullDate'): row['FullDate'] = str(row['FullDate'])
            if row.get('DIM_StartDate'): row['DIM_StartDate'] = str(row['DIM_StartDate'])
            if row.get('DIM_EndDate'): row['DIM_EndDate'] = str(row['DIM_EndDate'])
            
        return results
    except Exception as e:
        print(f"Error al obtener información para reportes: {e}")
        return []