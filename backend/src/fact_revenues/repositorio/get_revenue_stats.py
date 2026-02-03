from src.utils.conexion import Conexion

def get_revenue_stats(conn: Conexion, filter_type: str, year: int) -> list:
    """
    Obtiene las estadísticas de ingresos agrupadas por mes, semana o año.
    
    Args:
        conn (Conexion): Objeto de conexión.
        filter_type (str): Tipo de filtro ('month', 'week', 'year').
        year (int): Año para filtrar (relevante para 'month' y 'week').
        
    Returns:
        list: Lista de diccionarios con 'label' y 'total'.
    """
    # Usamos el cursor de diccionario configurado en Conexion
    cursor = conn.cursor 
    
    # Definir la consulta según el filtro
    if filter_type == 'month':
        # Agrupar por mes para un año específico
        query = """
            SELECT 
                D.Month as label, 
                SUM(F.FACT_PaymentAmount) as total 
            FROM fact_revenue F
            JOIN DIM_Date D ON F.DIM_DateId = D.DIM_DateId
            WHERE D.Year = %s
            GROUP BY D.Month
            ORDER BY D.Month ASC
        """
        params = (year,)
        
    elif filter_type == 'week':
        # Agrupar por semana para un año específico
        query = """
            SELECT 
                D.Week as label, 
                SUM(F.FACT_PaymentAmount) as total 
            FROM fact_revenue F
            JOIN DIM_Date D ON F.DIM_DateId = D.DIM_DateId
            WHERE D.Year = %s
            GROUP BY D.Week
            ORDER BY D.Week ASC
        """
        params = (year,)
        
    elif filter_type == 'year':
        # Agrupar por año (comparativa anual)
        query = """
            SELECT 
                D.Year as label, 
                SUM(F.FACT_PaymentAmount) as total 
            FROM fact_revenue F
            JOIN DIM_Date D ON F.DIM_DateId = D.DIM_DateId
            GROUP BY D.Year
            ORDER BY D.Year DESC
            LIMIT 5
        """
        params = ()
    else:
        return []

    try:
        cursor.execute(query, params)
        results = cursor.fetchall()
        return results
    except Exception as e:
        print(f"❌ Error al obtener estadísticas de ingresos: {e}")
        return []