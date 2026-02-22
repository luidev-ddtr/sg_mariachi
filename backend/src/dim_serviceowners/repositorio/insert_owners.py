from src.utils.conexion import Conexion
from ..serviceowners_model import ServiceOwnerModel

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
