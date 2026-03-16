from src.utils.conexion import Conexion

def update_owner_credentials(employee_id: str, data_to_update: dict, conn: Conexion) -> bool:
    """
    Actualiza los campos de un registro en la tabla dim_serviceowners.

    Args:
        employee_id (str): El ID del empleado cuyas credenciales se actualizarán.
        data_to_update (dict): Un diccionario con los campos a actualizar (ej. {'DIM_Username': 'new_user'}).
        conn (Conexion): Objeto de conexión a la base de datos.

    Returns:
        bool: True si la actualización fue exitosa, False en caso contrario.
    """
    if not data_to_update:
        return False

    # Construir la parte SET de la query dinámicamente
    set_parts = []
    values = []
    for key, value in data_to_update.items():
        set_parts.append(f"{key} = %s")
        values.append(value)

    set_clause = ", ".join(set_parts)
    query = f"UPDATE dim_serviceowners SET {set_clause} WHERE DIM_EmployeeId = %s"
    
    # Añadir el employee_id al final de la lista de valores
    values.append(employee_id)

    try:
        conn.cursor.execute(query, tuple(values))
        return True
    except Exception as e:
        print(f"❌ Error en repositorio al actualizar credenciales: {e}")
        return False