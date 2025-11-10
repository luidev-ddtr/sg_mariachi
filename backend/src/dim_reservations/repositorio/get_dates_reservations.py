from src.utils.conexion import Conexion
from datetime import date
from typing import List, Dict

def get_dates_reservations(
    obj_conn: Conexion,
    service_owners_id: str = None,  # Tu DIM_ServiceOwnersId para filtrar por mariachi
    target_date: date = None
) -> List[Dict[str, str]]:
    """
    Obtiene una lista de reservaciones existentes para un proveedor de servicios y/o una fecha específica.

    Esta función es un componente de repositorio diseñado para ser altamente eficiente. Su propósito
    principal es recuperar únicamente la información esencial (ID, fecha de inicio y fin)
    necesaria para realizar validaciones de negocio, como la comprobación de solapamiento de horarios.

    **Flujo de Proceso:**
    1.  **Consulta Base:** Inicia con una consulta SQL simple para seleccionar los campos
        `DIM_ReservationId`, `DIM_StartDate`, y `DIM_EndDate` de la tabla `dim_reservation`.
    2.  **Filtrado Dinámico:**
        - Si se proporciona un `service_owners_id`, se añade una cláusula `WHERE` para
          filtrar las reservas que pertenecen exclusivamente a ese proveedor de servicios
          (ej. un mariachi específico). Esto es fundamental para no comparar horarios
          entre diferentes proveedores.
        - Si se proporciona una `target_date`, se añaden cláusulas `WHERE` para acotar
          la búsqueda a las reservas que ocurren dentro de ese día en particular. Esto
          reduce drásticamente el número de registros a procesar en la lógica de negocio.
    3.  **Ejecución Segura:** La consulta se ejecuta de forma parametrizada para prevenir
        inyecciones SQL.
    4.  **Formateo de Resultados:** Los resultados obtenidos de la base de datos (que son
        una lista de tuplas) se transforman en una lista de diccionarios. Este formato
        es más legible y fácil de manejar en las capas de servicio, ya que cada campo
        está identificado por su nombre (clave).
    5.  **Manejo de Errores:** Si ocurre cualquier problema durante la ejecución de la
        consulta, se captura la excepción, se imprime un mensaje de error y se retorna
        una lista vacía para evitar que el programa falle.

    **Permisos/Acceso:**
    - Esta función está diseñada para ser llamada desde la capa de servicio (ej. `ReservaService`).
    - El usuario de la base de datos asociado al objeto `obj_conn` debe tener
      permisos de **SELECT** sobre la tabla `dim_reservation`. No se requieren
      permisos de escritura.

    :param obj_conn: El objeto de conexión a la base de datos que gestionará la consulta.
    :type obj_conn: Conexion
    :param service_owners_id: (Opcional) El ID del propietario del servicio para filtrar
                              las reservas.
    :type service_owners_id: str, optional
    :param target_date: (Opcional) La fecha específica para la cual se desean obtener
                        las reservas.
    :type target_date: date, optional
    :return: Una lista de diccionarios, donde cada diccionario representa una reserva
             con su ID, fecha de inicio y fecha de fin. Retorna una lista vacía si
             no se encuentran resultados o si ocurre un error.
             Ejemplo: `[{'DIM_ReservationId': '...', 'DIM_StartDate': '...', 'DIM_EndDate': '...'}]`
    :rtype: List[Dict[str, str]]
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
        
        print(f"✅ Obtenidas {len(reservations)} reservas para validación")
        return reservations
    
    except Exception as err:
        print(f"❌ Error en query de reservas: {err}")
        return []