from src.utils.conexion import Conexion

def validate_serviceowners(dim_ServiceownerId: str, conexion: Conexion, password: str) -> dict:
    """
    Docstring for validate_serviceowners

    :param dim_ServiceownerId: ID del administrador
    :type dim_ServiceownerId: str
    :param conexion: Conexion a la base de datos
    :type conexion: Conexion
    :return: Lista de admnistradores registrados
    :rtype: dict
    """

    # NOTA: En producción, las contraseñas deberían compararse usando hashes (ej. bcrypt)
    query = """
        SELECT * FROM dim_serviceowners 
        WHERE DIM_Username = %s AND DIM_Password = %s
    """

    try:
        conexion.cursor.execute(query, (dim_ServiceownerId, password))
        user = conexion.cursor.fetchone()
        print(user)
        return user
    except Exception as e:
        print (f"Error al validar las credenciales del administrador: {e}")
        return False