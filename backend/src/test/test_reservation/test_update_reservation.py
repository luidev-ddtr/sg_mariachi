import pytest
from src.utils.conexion import Conexion
from src.dim_reservations.reservation_handler import ReservationService


def test_update_reservation_success():
    """
    Prueba el flujo de actualización de una reserva usando un ID existente
    y valida que los datos se persistan correctamente en la base de datos.
    """
    # --- ARRANGE ---
    service = ReservationService()
    reservation_id_to_update = '32ea5c29-0eef-56bb'

    # Datos que enviaría el frontend para la actualización
    update_payload = {
        'DIM_ReservationId': reservation_id_to_update,
        'DIM_StartDate': '2025-12-25T12:00:00',
        'DIM_EndDate': '2025-12-25T16:00:00',
        'DIM_NHours': 2,
        'DIM_TotalAmount': 9999, # Valor fácil de identificar
        'DIM_Notes': 'La reserva ha sido actualizada exitosamente.', # Nota actualizada
        'DIM_SecondPhoneNumber': '555-NUEVO-NUMERO' # Teléfono actualizado
    }

    # --- ACT ---
    # El servicio gestionará su propia conexión
    status, message, data = service.update_reservation(update_payload)

    # --- ASSERT (Parte 1): Verificar la respuesta del handler ---
    assert status == 200, f"Se esperaba estado 200 pero se obtuvo {status}: {message}"
    assert message == "Reserva actualizada exitosamente"

    # --- ASSERT (Parte 2): Verificar los datos directamente en la BD ---
    conn_verify = Conexion()
    try:
        conn_verify.cursor.execute("SELECT DIM_TotalAmount, DIM_Notes FROM dim_reservation WHERE DIM_ReservationId = %s", (reservation_id_to_update,))
        updated_data = conn_verify.cursor.fetchone()
        assert updated_data['DIM_TotalAmount'] == 9999
        assert updated_data['DIM_Notes'] == 'La reserva ha sido actualizada exitosamente.'
        print("✅ Test de actualización exitosa: La reserva se actualizó y los cambios fueron verificados en la BD.")
    finally:
        conn_verify.close_conexion()

"""
Notas, hay algunos detalles que tenemos que ver a la hora de crear registros, ya que para la vist se muestra la fecha de edicion del evento, lo cual no es correcto, ya que se deberia d emostrar la fecha del 
evento, aqui el problema es cuando el evento dura mas de una dia, se tiene que definir que se mostrara, ademas de que talvez debe estar mas informacion disponible, para poder editar mas mas cosas.

"""