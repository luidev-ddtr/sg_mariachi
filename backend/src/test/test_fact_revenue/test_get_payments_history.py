import pytest
from src.utils.conexion import Conexion
from src.fact_revenues.repositorio.get_payments_history import get_payments_history
from src.utils.id_generator import create_id
from datetime import datetime

# Fixture para la conexión a la base de datos
@pytest.fixture(scope="function")
def db_connection():
    conn = Conexion()
    yield conn
    conn.close_conexion()

# Fixture para obtener una reserva existente de la BD donde insertar pagos de prueba
@pytest.fixture(scope="function")
def existing_reservation(db_connection):
    # Buscamos cualquier reserva existente
    db_connection.cursor.execute("SELECT DIM_ReservationId FROM dim_reservation LIMIT 1")
    result = db_connection.cursor.fetchone()
    
    if not result:
        pytest.skip("No se encontraron reservaciones en la base de datos para realizar la prueba.")
        
    return result['DIM_ReservationId']

def test_get_payments_history_success(db_connection, existing_reservation):
    """
    Prueba que get_payments_history devuelva correctamente la lista de pagos de una reserva.
    """
    reservation_id = existing_reservation
    
    # 1. Preparar datos: Obtener un DateId válido (hoy)
    db_connection.cursor.execute("SELECT DIM_DateId FROM dim_date WHERE DIM_DateId = DATE_FORMAT(NOW(), '%Y%m%d')")
    date_row = db_connection.cursor.fetchone()
    
    # Fallback por si no encuentra la fecha de hoy (usar la primera disponible)
    if not date_row:
         db_connection.cursor.execute("SELECT DIM_DateId FROM dim_date LIMIT 1")
         date_row = db_connection.cursor.fetchone()
    
    date_id = date_row['DIM_DateId']
    
    # 2. Generar IDs únicos para los pagos de prueba
    # Usamos un prefijo 'test_' para identificarlos fácilmente
    pay1_id = create_id(["test_pay_1", reservation_id, str(datetime.now())])
    pay2_id = create_id(["test_pay_2", reservation_id, str(datetime.now())])
    
    # 3. Insertar pagos directamente (Raw SQL) para asegurar el escenario de prueba
    # Insertamos un pago de 1500 y otro de 500
    query = """
        INSERT INTO fact_revenue (FACT_RevenueId, FACT_PaymentAmount, DIM_DateId, DIM_ReservationId)
        VALUES (%s, %s, %s, %s), (%s, %s, %s, %s)
    """
    db_connection.cursor.execute(query, (
        pay1_id, 1500.0, date_id, reservation_id,
        pay2_id, 500.0, date_id, reservation_id
    ))
    db_connection.save_changes()
    
    try:
        # 4. Ejecutar la función a probar
        history = get_payments_history(reservation_id, db_connection)
        
        # 5. Validaciones
        assert isinstance(history, list), "El historial debería ser una lista"
        
        print(f"DEBUG: Historial recuperado de la BD: {history}")
        
        # Filtramos el historial para buscar solo nuestros pagos de prueba
        # (por si la reserva ya tenía otros pagos reales)
        test_payments = []
        for p in history:
            # Buscamos el ID con diferentes variantes de nombre de columna para evitar errores por mayúsculas/minúsculas
            p_id = p.get('FACT_RevenueId') or p.get('fact_revenueid') or p.get('id') or p.get('ID')
            if p_id in [pay1_id, pay2_id]:
                test_payments.append(p)
        
        assert len(test_payments) == 2, f"Debería haber encontrado los 2 pagos insertados. Encontrados: {len(test_payments)}. IDs buscados: {[pay1_id, pay2_id]}"
        
        # Verificar que los montos coincidan
        # Nota: Dependiendo de cómo devuelva los datos tu repositorio, ajusta las claves ('monto', 'FACT_PaymentAmount', etc.)
        # Aquí asumo que devuelve un diccionario con claves similares a la BD o mapeadas.
        montos_encontrados = [float(p.get('FACT_PaymentAmount') or p.get('fact_paymentamount') or p.get('monto') or 0) for p in test_payments]
        
        assert 1500.0 in montos_encontrados
        assert 500.0 in montos_encontrados
        
    finally:
        # 6. Limpieza: Borrar los pagos de prueba
        db_connection.cursor.execute("DELETE FROM fact_revenue WHERE FACT_RevenueId IN (%s, %s)", (pay1_id, pay2_id))
        db_connection.save_changes()
