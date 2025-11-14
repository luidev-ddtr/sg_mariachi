from src.dim_people.repository.update_people import update_people

from src.utils.conexion import Conexion


def test_update_people():
    """
    Esta funcion testea la funcion update_people
    se comprueba que esta funcion retorne un boolenao, ademas de que los parametros que pide son correctos
    """
    object_conection = Conexion()
    result = update_people("7713006156", 'be8fd147-9915-5530', object_conection)
    print(result)