from src.utils.conexion import Conexion

def update_employ_repo(employee_id: str, data_to_update: dict, conn: Conexion) -> bool:
    """
    Actualiza los campos de un registro en la tabla dim_employ.

    Args:
        employee_id (str): El ID del empleado a actualizar.
        data_to_update (dict): Un diccionario con los campos a actualizar (ej. {'DIM_Position': 'Super Admin'}).
        conn (Conexion): Objeto de conexión a la base de datos.

    Returns:
        bool: True si la actualización fue exitosa, False en caso contrario.
    """
    if not data_to_update:
        return False

    set_parts = []
    values = []
    for key, value in data_to_update.items():
        set_parts.append(f"{key} = %s")
        values.append(value)

    set_clause = ", ".join(set_parts)
    query = f"UPDATE dim_employe SET {set_clause} WHERE DIM_EmployeeId = %s"
    
    values.append(employee_id)

    try:
        conn.cursor.execute(query, tuple(values))
        return True
    except Exception as e:
        print(f"❌ Error en repositorio al actualizar empleado: {e}")
        return False