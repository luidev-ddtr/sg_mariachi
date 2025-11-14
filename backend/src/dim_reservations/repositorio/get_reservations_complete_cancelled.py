from src.utils.conexion import Conexion
from typing import List, Dict

def get_reservations_complete_cancelled(
        objec_conn: Conexion,
        service_owners_id: str = None
) -> List[Dict[str, str]]:
    query = """
        SELECT * FROM dim_reservation
        WHERE DIM_StatusId IN (%s, %s)
        """
    
    # IDs para 'completada' y 'cancelada'
    completed_id = 'd9664265-818c-52dc'
    cancelled_id = 'c842035f-aecb-5099'
    params = [completed_id, cancelled_id]

    if service_owners_id:
        query += " AND DIM_ServiceOwnersId = %s"
        params.append(service_owners_id)

    try:
        cursor = objec_conn.conn.cursor(dictionary=True)
        cursor.execute(query, params)
        reservations = cursor.fetchall()
        
        # Es buena práctica asegurarse de que las fechas se devuelvan como strings
        for res in reservations:
            if res.get('DIM_StartDate'):
                res['DIM_StartDate'] = str(res['DIM_StartDate'])
            if res.get('DIM_EndDate'):
                res['DIM_EndDate'] = str(res['DIM_EndDate'])

        print(f"✅ Obtenidas {len(reservations)} reservaciones completadas/canceladas.")
        return reservations

    except Exception as err:
        print(f"❌ Error en query de reservaciones completadas/canceladas: {err}")
        return []