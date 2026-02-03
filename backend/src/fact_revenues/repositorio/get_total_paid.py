from src.utils.conexion import Conexion

def get_total_paid(reservation_id: str, conn: Conexion) -> float:
    """
    Obtiene la suma total (acumulado) de los pagos registrados en fact_revenue
    para una reservación específica.
    
    Retorna 0.0 si no hay pagos registrados.
    """
    # Sumamos la columna FACT_PaymentAmount filtrando por el ID de la reservación
    query = "SELECT SUM(FACT_PaymentAmount) AS total_paid FROM fact_revenue WHERE DIM_ReservationId = %s"
    
    try:
        # Usamos el cursor de la conexión existente
        conn.cursor.execute(query, (reservation_id,))
        result = conn.cursor.fetchone()
        
        # Si hay resultado y no es None (es decir, hay pagos), devolvemos el valor float
        if result and result['total_paid'] is not None:
            return float(result['total_paid'])
        
        # Si es None (no hay pagos), devolvemos 0
        return 0.0
        
    except Exception as e:
        print(f"❌ Error al obtener el total pagado para {reservation_id}: {e}")
        import traceback
        print(f"Error details: {traceback.format_exc()}")
        # En caso de error, asumimos 0 para no romper el flujo, pero lo registramos en consola
        return 0.0
