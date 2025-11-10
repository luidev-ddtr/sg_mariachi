import pytest
from src.dim_reservations.reservation_handler import ReservationService
from src.utils.conexion import Conexion

@pytest.fixture(scope="function")
def db_connection():
    """
    Fixture de Pytest que gestiona una conexión a la base de datos para una prueba.
    Abre la conexión antes de la prueba y la cierra automáticamente después.
    """
    conn = Conexion()
    print("\n✅ (Fixture) Conexión a BD abierta para la prueba.")
    yield conn
    # Código de limpieza (Teardown) que se ejecuta después de la prueba
    conn.close_conexion()
    print("🔌 (Fixture) Conexión a BD cerrada.")

def test_read_reservations_by_date_success(db_connection):
    """
    Prueba que el método `read_reservations_by_date` devuelve una lista de reservaciones
    para una semana específica.

    Esta prueba asume que existen reservaciones en la base de datos para la fecha consultada
    (semana 1 de octubre de 2025).
    """
    # --- ARRANGE ---
    # Preparamos los datos de entrada para la prueba.
    handler = ReservationService()

    date = "2025-11-10"

    # --- ACT ---
    # Ejecutamos el método que queremos probar, pasando la conexión del fixture.
    status, reservations = handler.read_reservations_by_date(date, conn=db_connection)

    # --- ASSERT ---
    # Verificamos que los resultados sean los esperados.
    print(f"\nResultado de la API -> Estado: {status}, Reservaciones: {reservations}")
    assert status == 200, f"Se esperaba un estado 200, pero se obtuvo {status}"
    assert isinstance(reservations, list), "Se esperaba que el resultado fuera una lista."
    # Opcional: Si sabes que debe haber resultados, puedes añadir esta aserción.
    # assert len(reservations) > 0, "Se esperaba al menos una reservación, pero no se encontró ninguna."
