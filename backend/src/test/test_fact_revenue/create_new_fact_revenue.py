import pytest
from src.utils.conexion import Conexion
from src.fact_revenues.fact_revenues_handler import FactRevenuesHandler
from src.dim_dates.dim_date import DIM_DATE

# Fixture para la conexión a la base de datos
@pytest.fixture(scope="function")
def db_connection():
    conn = Conexion()
    yield conn
    conn.close_conexion()

# Fixture para obtener una reserva existente de la BD
@pytest.fixture(scope="function")
def existing_reservation(db_connection):
    # Buscamos cualquier reserva existente para usarla como base
    db_connection.cursor.execute("SELECT DIM_ReservationId FROM dim_reservation LIMIT 1")
    result = db_connection.cursor.fetchone()
    
    if not result:
        pytest.skip("No se encontraron reservaciones en la base de datos para realizar la prueba.")
        
    return result['DIM_ReservationId']

def test_create_revenue_success(db_connection, existing_reservation):
    """
    Prueba el flujo exitoso de creación de un ingreso (fact_revenue).
    """
    handler = FactRevenuesHandler()
    reservation_id = existing_reservation
    
    # Obtener un DateId válido para la prueba
    dim_date = DIM_DATE(db_connection)
    # Usamos la fecha del evento (2026-06-15)
    date_id = dim_date.get_id_by_object_date(2026, 6, 15)
    
    # Datos del ingreso a crear
    revenue_payload = {
        'FACT_PaymentAmount': 5000.0,
        'DIM_DateId': date_id,
        'DIM_ReservationId': reservation_id
    }
    
    # Ejecutar el método a probar
    status, msg, data = handler.create_revenue(revenue_payload, conn=db_connection)
    
    created_id = getattr(data, 'FACT_RevenueId', None)

    try:
        # Validaciones de respuesta
        assert status == 201, f"Se esperaba 201, se obtuvo {status}: {msg}"
        assert msg == "Ingreso facturado creado correctamente"
        assert created_id is not None
        
        # Validación directa en base de datos
        db_connection.cursor.execute(
            "SELECT FACT_PaymentAmount FROM fact_revenue WHERE FACT_RevenueId = %s", 
            (created_id,)
        )
        row = db_connection.cursor.fetchone()
        assert row is not None
        assert float(row['FACT_PaymentAmount']) == 5000.0
        print("✅ Test de creación de ingreso exitoso.")
    finally:
        # Limpieza: Borrar solo el ingreso creado para no afectar la reserva real
        if created_id:
            db_connection.cursor.execute("DELETE FROM fact_revenue WHERE FACT_RevenueId = %s", (created_id,))
            db_connection.save_changes()

def test_create_revenue_invalid_amount(db_connection, existing_reservation):
    """
    Prueba que el sistema rechace montos inválidos (entre 0 y 4000).
    """
    handler = FactRevenuesHandler()
    reservation_id = existing_reservation
    dim_date = DIM_DATE(db_connection)
    date_id = dim_date.get_id_by_object_date(2026, 6, 15)
    
    # Monto inválido (regla de negocio: > 4000 o 0)
    revenue_payload = {
        'FACT_PaymentAmount': 2000.0, 
        'DIM_DateId': date_id,
        'DIM_ReservationId': reservation_id
    }
    
    status, msg, _ = handler.create_revenue(revenue_payload, conn=db_connection)
    
    assert status == 400
    assert "mayor a 4000" in msg
    print("✅ Test de validación de monto exitoso.")
