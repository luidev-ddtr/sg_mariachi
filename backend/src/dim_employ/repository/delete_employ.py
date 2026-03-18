from src.utils.conexion import Conexion

def delete_employ_repo(employee_id: str, conn: Conexion) -> bool:
    """
    Elimina un registro de la tabla dim_employe por su EmployeeId.

    Args:
        employee_id (str): El ID del empleado a eliminar.
        conn (Conexion): Objeto de conexión a la base de datos.

    Returns:
        bool: True si la eliminación fue exitosa, False en caso contrario.
    """
    query = "DELETE FROM dim_employe WHERE DIM_EmployeeId = %s"
    try:
        conn.cursor.execute(query, (employee_id,))
        return conn.cursor.rowcount > 0
    except Exception as e:
        print(f"Error en repositorio al eliminar empleado: {e}")
        return False
