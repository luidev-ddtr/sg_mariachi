from src.utils.conexion import Conexion

def get_owner_by_username(username: str, conexion: Conexion) -> dict | None:
    """
    Obtiene los datos de un administrador por su nombre de usuario.
    
    :param username: Nombre de usuario del administrador.
    :type username: str
    :param conexion: Conexion a la base de datos
    :type conexion: Conexion
    :return: Un diccionario con los datos del administrador si se encuentra, de lo contrario None.
    :rtype: dict | None
    """
    query = """
        SELECT s.*, e.DIM_Position 
        FROM dim_serviceowners s
        JOIN dim_employe e ON s.DIM_EmployeeId = e.DIM_EmployeeId
        WHERE s.DIM_Username = %s
    """
    try:
        conexion.cursor.execute(query, (username,))
        user = conexion.cursor.fetchone()
        return user
    except Exception as e:
        print(f"Error al obtener administrador por username: {e}")
        return None

def validate_email(email: str, conexion: Conexion) -> dict:
    """
    Docstring for validate_email

    :param email: Correo del usuario a validar
    :type email: str
    :param conexion: Conexion a la base de datos
    :type conexion: Conexion
    :return: Lista de admnistradores registrados
    :rtype: dict
    """

    query = """
        SELECT DIM_PeopleId FROM dim_people
        WHERE DIM_Email = %s
    """

    try:
        conexion.cursor.execute(query, (email,))
        user = conexion.cursor.fetchone()
        print(user)
        return user
    except Exception as e:
        print (f"Error al validar el email: {e}")
        return False
    

def validateowner(people_id: str, conexion: Conexion) -> dict:
    """
    Validar que el usuario que intenta iniciar sesión es un administrador registrado en la base de datos.
    En base al Id de la persona obtenida de la función validate_email, se valida que esa persona tenga un rol de administrador en la tabla dim_employe.
    """

    # NOTA: En producción, las contraseñas deberían compararse usando hashes (ej. bcrypt)
    query = """
        SELECT s.DIM_ServiceOwnersId, p.DIM_Name, p.DIM_LastName, e.DIM_Position
        FROM dim_serviceowners s
        JOIN dim_employe e ON s.DIM_EmployeeId = e.DIM_EmployeeId
        JOIN dim_people p ON e.DIM_PersonId = p.DIM_PeopleId
        WHERE e.DIM_Position IN ('Administrador principal', 'Administrador') AND p.DIM_PeopleId = %s;
    """    
    try:
        conexion.cursor.execute(query, (people_id,))
        user = conexion.cursor.fetchone()
        print(user)
        return user
    except Exception as e:
        print (f"Error al validar el rol: {e}")
        return False