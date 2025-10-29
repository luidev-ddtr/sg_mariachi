from src.dim_reservations.repositorio.read_reservations import read_reservations_with_date_filter
from src.utils.conexion import Conexion


def test_read_reservations_with_date_filter():
    conecion = Conexion()
    result = read_reservations_with_date_filter(2025, 10, 3, conecion)
    print("Este es el resultado")
    print(result)
    assert len(result) > 0