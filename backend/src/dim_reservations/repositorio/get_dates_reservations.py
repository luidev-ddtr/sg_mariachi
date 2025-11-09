from src.utils.conexion import Conexion
from datetime import date
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

def get_dates_reservations(
    obj_conn: Conexion,
    service_owners_id: str = None,  # Tu DIM_ServiceOwnersId para filtrar por mariachi
    target_date: date = None
) -> List[Dict[str, str]]:
    """
    Obtiene reservas existentes con start/end para validación de overlaps.
    Filtrado por mariachi (DIM_ServiceOwnersId) y fecha.

    Returns:
        List[Dict]: [{'DIM_ReservationId': 'ABC123', 'DIM_StartDate': '2025-11-05T10:00:00', 'DIM_EndDate': '2025-11-05T12:00:00'}, ...]
    """
    query = """
    SELECT DIM_ReservationId, DIM_StartDate, DIM_EndDate 
    FROM dim_reservation 
    WHERE 1=1
    """
    params = []

    if service_owners_id:
        query += " AND DIM_ServiceOwnersId = %s"
        params.append(service_owners_id)
    
    if target_date:
        start_of_day = target_date.strftime('%Y-%m-%d 00:00:00')
        end_of_day = target_date.strftime('%Y-%m-%d 23:59:59')
        query += " AND DIM_StartDate >= %s AND DIM_EndDate <= %s"
        params.extend([start_of_day, end_of_day])
    
    query += " ORDER BY DIM_StartDate DESC"

    try:
        cursor = obj_conn.conn.cursor()
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        reservations = [
            {
                'DIM_ReservationId': row[0],
                'DIM_StartDate': str(row[1]) if row[1] else None,
                'DIM_EndDate': str(row[2]) if row[2] else None
            }
            for row in rows
        ]
        
        logger.info(f"✅ Obtenidas {len(reservations)} reservas para validación")
        return reservations
    
    except Exception as err:
        logger.error(f"❌ Error en query de reservas: {err}")
        return []