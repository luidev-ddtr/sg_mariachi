from src.dim_reservations.repositorio.insert_reservation import insert_reservation
from src.dim_reservations.reservation_model import Reservation
from src.utils.conexion import Conexion

def test_insert_reservation():
    instancia_conexion = Conexion()
    data = {
        "DIM_ReservationId": "4e4dad3d-e0ce-5a29" ,
        "DIM_PeopleId": "ce037ec9-32c2-58f1",
        "DIM_StatusId": "6d0fa47f-1933-5928",
        "DIM_DateId": "20251027",
        "DIM_ServiceOwnersId": "f07e69a4-4e80-527e",
        "DIM_EventAddress": "san monica de Santa elena el Bajio Guanaguato mexico",
        "DIM_StartDate": "2026-01-05 14:00:00",
        "DIM_EndDate": "2026-01-05 19:00:00",
        "DIM_NHours": 5.0,
        "DIM_TotalAmount": 1000.0,
        "DIM_Notes": "mariachis para xv de color verde pantano"
    }
    reservacion = Reservation(**data)
    
    result = insert_reservation(reservacion, instancia_conexion)
    assert result
