from src.utils.conexion import Conexion

def get_global_totals_repo(connection: Conexion) -> dict:
    """
    Consulta la base de datos para obtener los totales de reservaciones
    pendientes, completadas (activas + log) y el gran total histórico.
    """
    query = """
        SELECT 
            (SELECT COUNT(*) FROM dim_reservation WHERE DIM_StatusId = '6d0fa47f-1933-5928') AS pendientes,
            (SELECT COUNT(*) FROM dim_reservation_log WHERE Final_StatusId = 'd9664265-818c-52dc') 
            + 
            (SELECT COUNT(*) FROM dim_reservation WHERE DIM_StatusId = 'd9664265-818c-52dc') AS completados,
            (SELECT COUNT(*) FROM dim_reservation) 
            + 
            (SELECT COUNT(*) FROM dim_reservation_log) AS totales;
    """
    try:
        connection.cursor.execute(query)
        result = connection.cursor.fetchone()
        
        if result:
            return {
                "pendientes": result[0],
                "completados": result[1],
                "totales": result[2]
            }
        return {"pendientes": 0, "completados": 0, "totales": 0}
    except Exception as e:
        print(f"Error en el repositorio al obtener totales globales: {e}")
        raise e