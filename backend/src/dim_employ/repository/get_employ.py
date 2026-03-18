from src.utils.conexion import Conexion

def get_employ_by_id_repo(employee_id: str, conn: Conexion) -> dict | None:
    """
    Obtiene los datos de un empleado por su ID desde la tabla dim_employ.

    Args:
        employee_id (str): El ID del empleado a buscar.
        conn (Conexion): Objeto de conexión a la base de datos.

    Returns:
        dict | None: Un diccionario con los datos del empleado si se encuentra, o None.
    """
    # Seleccionamos columnas explícitas para asegurar el orden si el cursor devuelve tuplas
    query = "SELECT DIM_EmployeeId, DIM_PersonId, DIM_Position, DIM_DateId FROM dim_employe WHERE DIM_EmployeeId = %s"
    try:
        conn.cursor.execute(query, (employee_id,))
        row = conn.cursor.fetchone()
        
        if not row:
            return None

        # Si el cursor devuelve una tupla (comportamiento por defecto), lo convertimos a diccionario
        if isinstance(row, tuple):
            return {
                "DIM_EmployeeId": row[0],
                "DIM_PersonId": row[1],
                "DIM_Position": row[2],
                "DIM_DateId": row[3]
            }
            
        # Si ya es un diccionario
        return row
    except Exception as e:
        print(f"Error en repositorio al obtener empleado por ID: {e}")
        return None