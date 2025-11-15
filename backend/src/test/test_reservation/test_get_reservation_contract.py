from src.dim_reservations.repositorio.get_contract_info import get_contract_info
from src.utils.conexion import Conexion

def test_get_contract_info():
    conn = Conexion()
    reservation_id = '4e4dad3d-e0ce-5a29'
    contract_info = get_contract_info(reservation_id, conn)
    assert isinstance(contract_info, dict)
    assert contract_info is not None