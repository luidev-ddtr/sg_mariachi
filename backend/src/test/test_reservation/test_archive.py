from src.dim_reservations.repositorio.archive_reservation import archive_reservation_by_id

from src.utils.conexion import Conexion

def test_archive_reservation():
    connection = Conexion()
    result = archive_reservation_by_id('32ea5c29-0eef-56bb', connection)
    assert result