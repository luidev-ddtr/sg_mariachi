from src.utils.conexion import Conexion
from ..serviceowners_model import ServiceOwnerModel
import uuid

def insert_serviceowners(data_serviceowners: ServiceOwnerModel ,objetc_conn: Conexion ) -> bool:
    """
    Docstring for get_serviceowners
    
    :param data_serviceowners: Un objeto de la clase 'ServiceOwners'
            que contiene todos los atributos (ID, IDs de dimensión relacionados, etc.) 
            para la nueva reserva a insertar.
            Los datos son extraídos directamente de los atributos de este objeto
    :param objetc_conn: Un objeto de la clase 'Conexion' que maneja la
            conexión activa a la base de datos, incluyendo el cursor necesario
            para ejecutar la consulta y la función para guardar los cambios.
    :rtype: 
            Retorna True si la inserción se realiza con éxito y los cambios
            son guardados en la base de datos. Retorna False si ocurre una excepción
            durante la ejecución de la consulta o al guardar los cambios.
    """
    
    # Esto aun queda pendiente de implementación ya que no se ha definido
    # el como se manejara el registro de los administradores en la base de datos, ya que solo 
    # esta destinao a una sola persona, por lo que se podría manejar de forma manual, 
    # pero se deja esta función para futuras implementaciones

def upsert_google_user(google_user_data: dict, objetc_conn: Conexion) -> bool:
    """
    Inserta o actualiza la información de un usuario de Google en la tabla dim_usergoogle.
    
    Utiliza la sintaxis "INSERT ... ON DUPLICATE KEY UPDATE" para manejar eficientemente
    tanto a los usuarios nuevos como a los que regresan.

    :param google_user_data: Un diccionario con los datos del usuario obtenidos de Google.
    :param objetc_conn: El objeto de conexión a la base de datos.
    :return: True si la operación fue exitosa, False en caso contrario.
    """
    # NOTA: Para que 'ON DUPLICATE KEY UPDATE' funcione, la columna 'DIM_google_id'
    # debe tener una restricción UNIQUE en la base de datos.
    query = """
        INSERT INTO dim_usergoogle (DIM_UserId, DIM_google_id, DIM_User, DIM_Email, DIM_foto_perfil, DIM_PeopleId)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            DIM_User = VALUES(DIM_User),
            DIM_Email = VALUES(DIM_Email),
            DIM_foto_perfil = VALUES(DIM_foto_perfil);
    """
    try:
        params = (
             # Genera un nuevo ID único para el registro limitando a 18 caracteres si es necesario
            str(uuid.uuid4())[:18],
            google_user_data['google_id'],
            google_user_data['name'],
            google_user_data['email'],
            google_user_data['picture'],
            google_user_data['people_id']
        )
        objetc_conn.cursor.execute(query, params)
        # La transacción se manejará en el handler para asegurar consistencia.
        return True
    except Exception as e:
        print(f"❌ Error al insertar/actualizar usuario de Google: {e}")
        return False
