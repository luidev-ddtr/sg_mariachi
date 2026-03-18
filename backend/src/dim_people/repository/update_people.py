from src.utils.conexion import Conexion

def update_people(people_id: str, data_to_update: dict, conn: Conexion) -> bool:
    """
    Actualiza dinámicamente los campos de un registro en la tabla dim_people.

    Args:
        people_id (str): El ID de la persona a actualizar.
        data_to_update (dict): Diccionario con los campos a actualizar (ej. {'DIM_PhoneNumber': '123'}).
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
    query = f"UPDATE dim_people SET {set_clause} WHERE DIM_PeopleId = %s"
    
    values.append(people_id)

    try:
        conn.cursor.execute(query, tuple(values))
        return True
    except Exception as e:
        print(f"Error en repositorio al actualizar persona: {e}")
        return False