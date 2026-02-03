from src.utils.conexion import Conexion
from typing import List, Dict

def get_payments_history(reservation_id: str, conn: Conexion) -> List[Dict]:
    """
    Obtiene el historial detallado de pagos para una reservación.
    Une fact_revenues con DIM_Date para obtener la fecha legible.
    """
    # Seleccionamos la fecha legible (FullDate) y el monto
    query = """
        SELECT 
            dd.FullDate AS fecha,
            fr.FACT_PaymentAmount AS monto
        FROM fact_revenue fr
        INNER JOIN dim_date dd ON fr.DIM_DateId = dd.DIM_DateId
        WHERE fr.DIM_ReservationId = %s
        ORDER BY dd.FullDate DESC, fr.FACT_RevenueId DESC
    """
    
    try:
        conn.cursor.execute(query, (reservation_id,))
        rows = conn.cursor.fetchall()
        
        history = []
        for row in rows:
            history.append({
                'fecha': str(row['fecha']), # Convertimos fecha a string
                'monto': float(row['monto'])
            })
            
        return history
        
    except Exception as e:
        print(f"❌ Error al obtener historial de pagos: {e}")
        # import traceback
        # print(f"Error details: {traceback.format_exc()}")
        return []