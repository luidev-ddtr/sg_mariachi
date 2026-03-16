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
    query = "SELECT * FROM dim_employe WHERE DIM_EmployeeId = %s"
    try:
        conn.cursor.execute(query, (employee_id,))
        employee = conn.cursor.fetchone()
        return employee
    except Exception as e:
        print(f"❌ Error en repositorio al obtener empleado por ID: {e}")
        return None