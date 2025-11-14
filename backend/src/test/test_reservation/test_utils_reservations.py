from src.dim_reservations.repositorio.read_reservations import *
from src.utils.conexion import Conexion

id = "ccc62149-e5ff-5a96"

def test_get_status_id_by_reservation_id():
    """
    Esta funcion retorna el id del status de una reservacion
    Testea con estos datos de prueba si y se compueba que la funcion solo devuelve el nombre 
    del estatus
    """
    object_conection = Conexion()
    result = get_status_name_by_reservation_id(id, object_conection)
    print(result)
    
    
def test_get_people_id_by_reservation_id():
    """
    Esta funcion retorna el id de la persona de una reservacion
    Testea con estos datos de prueba si y se compueba que la funcion solo devuelve el id 
    de la persona
    """
    object_conection = Conexion()
    result = get_people_id_by_reservation_id(id, object_conection)
    print(result)
    
    
