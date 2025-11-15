import pytest
from src.utils.conexion import Conexion
from src.dim_reservations.reservation_handler import ReservationService

@pytest.fixture(scope="function")
def db_connection():
    """Fixture que gestiona una conexión a la BD para la prueba."""
    conn = Conexion()
    print("\n✅ (Fixture) Conexión a BD abierta.")
    try:
        yield conn
    finally:
        conn.close_conexion()
        print("🔌 (Fixture) Conexión a BD cerrada.")

def test_archive_real_reservation(db_connection):
    """
    Prueba que una reservación con estatus 'completada' puede ser archivada exitosamente.
    Utiliza un ID de una reserva real existente en la base de datos de pruebas.
    """
    service = ReservationService()
    id_modificate = '32ea5c29-0eef-56bb'
    archive_payload = {'DIM_ReservationId': id_modificate}
    archived_status_id = 'cw42055f-3ecb-9099' # ID para 'Archivado'

    # Guardamos el estado original para restaurarlo después y poder repetir la prueba
    db_connection.cursor.execute("SELECT DIM_StatusId FROM dim_reservation WHERE DIM_ReservationId = %s", (id_modificate,))
    original_status = db_connection.cursor.fetchone()
    
    if not original_status:
        pytest.fail(f"No se encontró la reserva con el ID '{id_modificate}' en la base de datos.")

    original_status_id = original_status['DIM_StatusId']
    print(f"ℹ️ Estatus original de la reserva '{id_modificate}': {original_status_id}")

    try:
        status, message = service.archivate_reservation(archive_payload, conn=db_connection)

        assert status == 200, f"Se esperaba estado 200 pero se obtuvo {status}: {message}"
        
        # Verificar directamente en la BD que el estatus cambió
        db_connection.cursor.execute("SELECT DIM_StatusId FROM dim_reservation WHERE DIM_ReservationId = %s", (id_modificate,))
        result = db_connection.cursor.fetchone()
        assert result['DIM_StatusId'] == archived_status_id, "El estatus en la BD no fue actualizado a 'Archivado'."
        print("✅ Test de archivado exitoso: La reserva fue archivada y verificada en la BD.")

    finally:
        # --- TEARDOWN: Restaurar el estado original de la reserva ---
        print(f"🧹 Restaurando estatus original '{original_status_id}' a la reserva '{id_modificate}'...")
        db_connection.cursor.execute("UPDATE dim_reservation SET DIM_StatusId = %s WHERE DIM_ReservationId = %s", (original_status_id, id_modificate))
        db_connection.save_changes()
        print("✅ Estatus original restaurado.")


def test_archive_reservation():
    manejador = ReservationService()
    conexion = Conexion()

    id = "32ea5c29-0eef-56bb"
    data = {'DIM_ReservationId': id}

    resultado = manejador.archivate_reservation(data, conexion)