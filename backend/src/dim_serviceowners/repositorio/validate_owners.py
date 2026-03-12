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

    # NOTA: En producción, las contraseñas deberían compararse usando hashes (ej. bcrypt)
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
        SELECT s.DIM_ServiceOwnersId, p.DIM_Name, p.DIM_LastName
        FROM dim_serviceowners s
        JOIN dim_employe e ON s.DIM_EmployeeId = e.DIM_EmployeeId
        JOIN dim_people p ON e.DIM_PersonId = p.DIM_PeopleId
        WHERE e.DIM_Position = 'Administrador' AND p.DIM_PeopleId = %s;
    """    
    try:
        conexion.cursor.execute(query, (people_id,))
        user = conexion.cursor.fetchone()
        print(user)
        return user
    except Exception as e:
        print (f"Error al validar el rol: {e}")
        return False