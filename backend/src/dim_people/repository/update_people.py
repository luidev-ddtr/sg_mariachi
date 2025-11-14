from src.utils.conexion import Conexion


def update_people(second_phone_number:str, people_id:str, object_conection:Conexion):
    """
    Actualiza el segundo número de teléfono (`DIM_SecondPhoneNumber`) de una persona
    específica en la tabla `dim_people`.

    Esta es la única columna de persona que la función está diseñada para modificar
    actualmente, realizando una operación de escritura (UPDATE) en la base de datos.

    Args:
        second_phone_number (str): El nuevo número de teléfono secundario a asignar.
        people_id (str): El ID único (`DIM_PeopleId`) de la persona cuyo registro será actualizado.
        object_conection (Conexion): El objeto de conexión a la base de datos que contiene el cursor activo.

    Returns:
        bool: Retorna `True` si la consulta `UPDATE` se ejecuta con éxito y los cambios se guardan
              (`object_conection.save_changes()`). Retorna `False` en caso de cualquier excepción.
    """
    query = """
    UPDATE
        dim_people
    SET
        DIM_SecondPhoneNumber = %s
    WHERE
        DIM_PeopleId = %s;
    """
    try:
        object_conection.cursor.execute(query, (second_phone_number, people_id))
        object_conection.save_changes()
        return True
    except Exception as e:
        print(f"Error al ejecutar la consulta: {e}")
        return False