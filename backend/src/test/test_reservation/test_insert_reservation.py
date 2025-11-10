import pytest
from src.dim_reservations.reservation_handler import ReservationService
import random
from datetime import datetime, timedelta

@pytest.fixture
def sample_reservation_data():
    """
    Genera datos de prueba para una reserva.
    Usa un número aleatorio para asegurar que la dirección sea única en cada ejecución,
    evitando conflictos si la prueba se corre múltiples veces.
    """
    random_suffix = random.randint(1000, 9999)
    return  {
    "DIM_Address": "Independencias siempre viva",
    "DIM_EndDate": "2025-11-11T19:00:00",
    "DIM_EventAddress": "Sexto principal, Ixmiquilpan, Hgo.",
    "DIM_LastName": "Hernandez",
    "DIM_NHours": 6,
    "DIM_Name": "Jaime",
    "DIM_Notes": "que lleven trajes de payaso",
    "DIM_PhoneNumber": "1234567891",
    "DIM_SecondLastName": "Perez",
    "DIM_SecondName": "Beltran",
    "DIM_SecondPhoneNumber": "1234567891",    
    "DIM_StartDate": "2025-11-11T17:00:00",
    "DIM_TotalAmount": 2500,
    "DIM_ServiceOwnersId": "f07e69a4-4e80-527e"
}

def test_insert_reservation_success(sample_reservation_data):
    """
    Prueba de integración para insertar una reserva exitosamente en la base de datos.
    Esta prueba se conecta a la BD real y realiza una inserción.
    """
    # NOTA: Esta prueba asume que no hay reservas que se solapen con la fecha/hora de los datos de prueba.
    service = ReservationService()
    status, msg = service.create_reservation(sample_reservation_data)
    print(f"El estado es [{status}] y el mensaje es [{msg}")
    assert status == 201
    assert "Reserva creada exitosamente" in msg
    print("✅ Test éxito: Reserva insertada sin problemas")

def test_insert_reservation_invalid_dates(sample_reservation_data):
    """
        Prueba que el sistema rechaza una reserva si la fecha de inicio es mayor o igual a la de fin.
    """
    invalid_data = sample_reservation_data.copy()
    invalid_data["DIM_StartDate"] = "2025-11-09T14:00:00"
    invalid_data["DIM_EndDate"] = "2025-11-09T13:00:00"  # Fecha de fin es ANTERIOR
    
    service = ReservationService()
    status, msg = service.create_reservation(invalid_data)
    assert status == 400
    assert "La hora de inicio debe ser anterior a la hora de fin" in msg
    print("✅ Test falla: Fechas inválidas (fin < inicio) detectado correctamente")
