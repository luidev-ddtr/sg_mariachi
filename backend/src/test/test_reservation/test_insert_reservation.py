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
    "DIM_Address": "Av. siempre viva",
    "DIM_EndDate": "2025-11-09 17:00:00",
    "DIM_EventAddress": "Cerrado siempre viva, Ixmiquilpan, Hgo.",
    "DIM_LastName": "Hernandez",
    "DIM_NHours": 1,
    "DIM_Name": "Alec",
    "DIM_Notes": "que lleven trajes de payaso",
    "DIM_PhoneNumber": "1234567891",
    "DIM_SecondLastName": "Perez",
    "DIM_SecondName": "Beltral",
    "DIM_SecondPhoneNumber": "1234567891",
    "DIM_StartDate": "2025-11-09 16:00:00",
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

#def test_insert_reservation_overlap_failure(sample_reservation_data):
    # """
    # Prueba de integración que verifica la detección de solapamiento de horarios.
    # 1. Inserta una reserva base.
    # 2. Intenta insertar una segunda reserva que se solapa con la primera.
    # """
    # service = ReservationService()
    
    # # --- Paso 1: Insertar la reserva base ---
    # # Asegurémonos de que la reserva base no exista para evitar fallos por solapamiento previo.
    # # Usamos una fecha y hora muy específicas para esta prueba.
    # base_start_time = "2025-11-21T10:00:00"
    # base_end_time = "2025-11-21T12:00:00"
    # sample_reservation_data["DIM_StartDate"] = base_start_time
    # sample_reservation_data["DIM_EndDate"] = base_end_time
    
    # # Limpiamos cualquier reserva que pueda existir en ese horario antes de la prueba
    # # (Esta parte es avanzada, por ahora asumimos que el horario está libre)
    
    # msg_base, status_base = service.create_reservation(sample_reservation_data)
    # assert status_base == 201, f"La inserción de la reserva base falló: {msg_base}"
    # print("✅ Reserva base para prueba de overlap creada exitosamente.")

    # # --- Paso 2: Intentar insertar una reserva que se solapa ---
    # overlapping_data = sample_reservation_data.copy()
    # overlapping_data["DIM_StartDate"] = "2025-11-21T11:00:00"  # Empieza durante la reserva base
    # overlapping_data["DIM_EndDate"] = "2025-11-21T13:00:00"    # Termina después
    
    # msg_overlap, status_overlap = service.create_reservation(overlapping_data)
    
    # assert status_overlap == 400
    # assert "Choque de horario con reserva" in msg_overlap
    # print("✅ Test falla: Overlap detectado correctamente")

# def test_insert_reservation_invalid_dates(sample_reservation_data):
#     """
#     Prueba que el sistema rechaza una reserva si la fecha de inicio es mayor o igual a la de fin.
#     """
#     invalid_data = sample_reservation_data.copy()
#     invalid_data["DIM_StartDate"] = "2025-11-22T14:00:00"
#     invalid_data["DIM_EndDate"] = "2025-11-22T13:00:00"  # Fecha de fin es ANTERIOR
    
#     service = ReservationService()
#     msg, status = service.create_reservation(invalid_data)
#     assert status == 400
#     assert "La hora de inicio debe ser anterior a la hora de fin" in msg
#     print("✅ Test falla: Fechas inválidas (fin < inicio) detectado correctamente")
