from src.utils.conexion import Conexion
from src.dim_reservations.repositorio.update_reservation import update_reservation

def test_update_reservation():
    conexion = Conexion()
    result = update_reservation('20251111', '2025-11-19 01:00:00', '2025-11-19 05:00:00', 4, 5000, 'No hay', '32ea5c29-0eef-56bb',conexion)
    assert result


"""
Notas, hay algunos detalles que tenemos que ver a la hora de crear registros, ya que para la vist se muestra la fecha de edicion del evento, lo cual no es correcto, ya que se deberia d emostrar la fecha del 
evento, aqui el problema es cuando el evento dura mas de una dia, se tiene que definir que se mostrara, ademas de que talvez debe estar mas informacion disponible, para poder editar mas mas cosas.

"""