from src.utils.conexion import Conexion
from typing import List, Dict

def get_payments_history(reservation_id: str, conn: Conexion) -> List[Dict]:
    """
    Obtiene el historial detallado de pagos para una reservación.
    Une fact_revenues con DIM_Date para obtener la fecha legible.
    
    :param reservation_id: ID de la reservación.
    :param conn: Instancia de conexión a la base de datos.
    :return: Lista de diccionarios con fecha y monto de cada pago.
    """
    # Seleccionamos la fecha legible (FullDate) y el monto
    query = """
        SELECT 
            dd.FullDate AS fecha,
            fr.FACT_PaymentAmount AS monto,
 --           su.fullname AS administrador
 			dp.DIM_Name AS administrador
        FROM fact_revenue fr
        INNER JOIN dim_date dd ON fr.DIM_DateId = dd.DIM_DateId
        INNER JOIN dim_reservation dr ON fr.DIM_ReservationId = dr.DIM_ReservationId
        INNER JOIN dim_serviceowners dso ON dr.DIM_ServiceOwnersId = dso.DIM_ServiceOwnersId
--        LEFT JOIN securityusers su ON dso.DIM_ServiceOwnersId = su.DIM_ServiceOwnersId
        LEFT JOIN dim_employe de ON dso.DIM_EmployeeId = de.DIM_EmployeeId
        LEFT JOIN dim_people dp ON de.DIM_PersonId = dp.DIM_PeopleId
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
                'monto': float(row['monto']),
                'administrador': row['administrador'] if row['administrador'] else "Sistema"
            })
            
        return history
        
    except Exception as e:
        print(f"Error al obtener historial de pagos: {e}")
        # import traceback
        # print(f"Error details: {traceback.format_exc()}")
        return []