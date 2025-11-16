from src.dim_reservations.reservation_handler import ReservationService as ReservationHandler
from src.utils.conexion import Conexion

def test_get_contract_info():
    conn = Conexion()
    reservation_id = '4e4dad3d-e0ce-5a29'
    handler = ReservationHandler()
    status_code, message, contract_info = handler.get_contracto_info({"DIM_ReservationId": reservation_id}, conn)
    
    assert status_code == 200
    assert isinstance(contract_info, dict)
    assert contract_info is not None
    assert 'evento_dia' in contract_info # Verificar una de las nuevas llaves