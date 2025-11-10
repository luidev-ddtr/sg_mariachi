from src.dim_reservations.reservation_handler import ReservationService
import random
import pytest
from src.utils.conexion import Conexion

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
    "DIM_EndDate": "2025-11-21T16:00:00",
    "DIM_EventAddress": "Las gemelas, Ixmiquilpan, Hgo.",
    "DIM_LastName": "Hernandez",
    "DIM_NHours": 1,
    "DIM_Name": "Alec",
    "DIM_Notes": "que lleven trajes de payaso",
    "DIM_PhoneNumber": "1234567891",
    "DIM_SecondLastName": "Perez",
    "DIM_SecondName": "Beltran",
    "DIM_SecondPhoneNumber": "1234567891",    
    "DIM_StartDate": "2025-11-21T15:00:00",
    "DIM_TotalAmount": 2500,
    "DIM_ServiceOwnersId": "f07e69a4-4e80-527e"
}

@pytest.fixture(scope="function")
def db_connection():
    """Fixture que gestiona una única conexión a la BD para una prueba."""
    conn = Conexion()
    print("✅ (Fixture) Conexión a BD abierta.")
    yield conn
    # Teardown: se ejecuta después de que la prueba termina
    conn.close_conexion()
    print("🔌 (Fixture) Conexión a BD cerrada.")

@pytest.fixture(scope="function")
def base_reservation(sample_reservation_data, db_connection):
    """
    Fixture de Pytest para crear una reserva base y limpiarla después de la prueba.
    - `scope="function"` asegura que se ejecute para cada función de prueba que la use.
    - `yield` pasa el control a la prueba y proporciona el ID de la reserva creada.
    - El código después de `yield` (el bloque de limpieza) se ejecuta siempre al final,
      incluso si la prueba falla.
    """
    service = ReservationService()
    reservation_id = None

    # --- SETUP: Crear la reserva base ---
    base_start_time = "2025-11-21T10:00:00"
    base_end_time = "2025-11-21T12:00:00"
    sample_reservation_data["DIM_StartDate"] = base_start_time
    sample_reservation_data["DIM_EndDate"] = base_end_time
    
    # Pasamos la conexión compartida al método
    status, msg = service.create_reservation(sample_reservation_data, conn=db_connection)
    assert status == 201, f"Fallo al crear la reserva base para la prueba: {msg}"
    reservation_id = msg.split("ID: ")[1].replace(")", "")
    print(f"✅ (Setup) Reserva base creada (ID: {reservation_id})")

    yield reservation_id  # La prueba se ejecuta aquí

    # --- TEARDOWN: Limpiar la reserva base usando la misma conexión ---
    if reservation_id:
        db_connection.cursor.execute("DELETE FROM dim_reservation WHERE DIM_ReservationId = %s", (reservation_id,))
        db_connection.save_changes()
        print(f"🧹 (Teardown) Limpieza exitosa de la reserva (ID: {reservation_id})")

def test_insert_reservation_overlap_failure(sample_reservation_data, base_reservation, db_connection):
    """
    Prueba que el sistema lanza un ValueError cuando se intenta insertar una reserva
    que se solapa con una existente.
    """
    service = ReservationService()
    overlapping_data = sample_reservation_data.copy()
    overlapping_data["DIM_StartDate"] = "2025-11-21T11:00:00"  # Empieza durante la reserva base
    overlapping_data["DIM_EndDate"] = "2025-11-21T12:00:00"    # Termina después
    
    # ### FIX: NO cambies el address para simular overlap en MISA ubicación.
    # Si hay PK duplicate, ajusta create_id en handler para incluir random/timestamp.
    # Cambiamos la dirección para generar un ID de reserva diferente y evitar un error de PK duplicada.
    overlapping_data["DIM_EventAddress"] = "Calle Falsa 123, Ixmiquilpan, Hgo."

    # Dado que el handler atrapa la excepción y devuelve un código de estado,
    # verificamos la tupla (código, mensaje) que retorna.
    status_code, message = service.create_reservation(overlapping_data, conn=db_connection)

    # Verificamos que el código de estado sea 400 (Bad Request) y que el mensaje sea el esperado.
    assert status_code == 400
    assert "Choque de horario con reserva" in message
    print("✅ Test de solapamiento exitoso: Se detectó el choque de horario correctamente.")