from src.utils.conexion import Conexion
from typing import List, Dict

def get_fact_revenues_by_id(
        object_conn: Conexion,
        revenue_id: str
) -> List[Dict[str, str]]:
    query = """
        SELECT cliente.DIM_Name, cliente.DIM_SecondName, cliente.DIM_LastName, cliente.DIM_SecondLastName
        FROM dim_reservation as reservacion
        INNER JOIN fact_revenue as pagos
        ON reservacion.DIM_ReservationId = pagos.DIM_ReservationId
        INNER JOIN dim_people as cliente
        ON reservacion.DIM_PeopleId = cliente.DIM_PeopleId AND reservacion.DIM_ReservationId = %s;
        """
    
    try:
        cursor = object_conn.conn.cursor(dictionary=True)
        cursor.execute(query, (revenue_id,))
        revenues = cursor.fetchall()

        print(f"Información obtenida de la reserva a la que aplicara el pago: {revenues}.")
        return revenues

    except Exception as err:
        print(f"❌ Error en query de ingresos facturados por ID: {err}")
        return []