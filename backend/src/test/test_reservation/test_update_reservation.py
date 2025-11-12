import pytest
import random
from src.utils.conexion import Conexion
from src.dim_reservations.reservation_handler import create_reservation, update_reservation

@pytest.fixture(scope="function")
def db_connection():
    """Fixture que gestiona una conexión a la BD para la prueba y la cierra al final."""
    conn = Conexion()
    print("\n✅ (Fixture) Conexión a BD abierta.")
    yield conn
    conn.close_conexion()
    print("🔌 (Fixture) Conexión a BD cerrada.")

@pytest.fixture(scope="function")
def base_reservation_for_update(db_connection):
    """
    Crea una reserva base en la BD para ser usada en las pruebas de actualización.
    Limpia la reserva y la persona asociada después de que la prueba finalice.
    """
    people_id = None
    reservation_id = None
    random_suffix = random.randint(1000, 9999)
    
    # --- SETUP: Crear una persona y una reserva base ---
    initial_reservation_data = {
        "DIM_Name": "UsuarioDePrueba",
        "DIM_SecondName": "ParaActualizar",
        "DIM_LastName": "Test",
        "DIM_SecondLastName": str(random_suffix),
        "DIM_Address": "Calle Falsa 123",
        "DIM_PhoneNumber": "5551112233",
        "DIM_SecondPhoneNumber": "1112223333",
        "DIM_ServiceOwnersId": "f07e69a4-4e80-527e", # ID de mariachi de prueba
        "DIM_EventAddress": f"Lugar de prueba {random_suffix}",
        "DIM_StartDate": "2025-12-25T10:00:00",
        "DIM_EndDate": "2025-12-25T12:00:00",
        "DIM_TotalAmount": 1500,
        "DIM_Notes": "Nota inicial de la reserva."
    }

    status, msg = create_reservation(initial_reservation_data, conn=db_connection)
    assert status == 201, f"Fallo al crear la reserva base para la prueba: {msg}"
    
    reservation_id = msg.split("ID: ")[1].replace(")", "")
    
    # Obtenemos el ID de la persona creada para la limpieza posterior
    db_connection.cursor.execute("SELECT DIM_PeopleId FROM dim_reservation WHERE DIM_ReservationId = %s", (reservation_id,))
    people_id = db_connection.cursor.fetchone()['DIM_PeopleId']
    
    print(f"✅ (Setup) Reserva base creada (ID: {reservation_id}) para la persona (ID: {people_id})")

    # Proporciona el ID de la reserva a la prueba
    yield reservation_id

    # --- TEARDOWN: Limpiar la reserva y la persona ---
    if reservation_id:
        db_connection.cursor.execute("DELETE FROM dim_reservation WHERE DIM_ReservationId = %s", (reservation_id,))
    if people_id:
        db_connection.cursor.execute("DELETE FROM dim_people WHERE DIM_PeopleId = %s", (people_id,))
    db_connection.save_changes()
    print(f"🧹 (Teardown) Limpieza de reserva (ID: {reservation_id}) y persona (ID: {people_id})")

def test_update_reservation_success_and_validate_changes(db_connection, base_reservation_for_update):
    """
    Prueba el flujo completo de actualización de una reserva y valida que los datos
    se hayan persistido correctamente en la base de datos.
    """
    # --- ARRANGE ---
    # Datos que enviaría el frontend para la actualización
    update_payload = {
        'DIM_ReservationId': 'ccc62149-e5ff-5a96',
        'DIM_StartDate': '2025-12-25T11:00:00',
        'DIM_EndDate': '2025-12-25T13:00:00',
        'DIM_NHours': 2.0,
        'DIM_TotalAmount': 9999, # Valor fácil de identificar
        'DIM_Notes': 'La reserva ha sido actualizada exitosamente.', # Nota actualizada
        'DIM_SecondPhoneNumber': '555-NUEVO-NUMERO' # Teléfono actualizado
    }

    # --- ACT ---
    status, message = update_reservation(update_payload, conn=db_connection)

    # --- ASSERT (Parte 1): Verificar la respuesta del handler ---
    assert status == 200, f"Se esperaba estado 200 pero se obtuvo {status}: {message}"
    assert message == "Reserva actualizada exitosamente"

    # --- ASSERT (Parte 2): Verificar los datos directamente en la BD ---
    db_connection.cursor.execute("SELECT DIM_TotalAmount, DIM_Notes FROM dim_reservation WHERE DIM_ReservationId = %s", (base_reservation_for_update,))
    updated_data = db_connection.cursor.fetchone()
    
    assert updated_data['DIM_TotalAmount'] == 9999
    assert updated_data['DIM_Notes'] == 'La reserva ha sido actualizada exitosamente.'
    print("✅ Test de actualización exitosa: La reserva se actualizó y los cambios fueron verificados en la BD.")

"""
Notas, hay algunos detalles que tenemos que ver a la hora de crear registros, ya que para la vist se muestra la fecha de edicion del evento, lo cual no es correcto, ya que se deberia d emostrar la fecha del 
evento, aqui el problema es cuando el evento dura mas de una dia, se tiene que definir que se mostrara, ademas de que talvez debe estar mas informacion disponible, para poder editar mas mas cosas.

"""