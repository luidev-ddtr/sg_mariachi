from src.fact_revenues.repositorio.get_payments_history import get_payments_history
from src.utils.conexion import Conexion

def test_get_payments_history():
    """
    Prueba manual para obtener el historial de pagos de una reserva específica.
    """
    conn = Conexion()
    
    try:
        # ID de reservación de prueba
        reservation_id = "85e2f78c-4ffd-535c"
        print(f"--- Consultando historial para: {reservation_id} ---")

        history = get_payments_history(reservation_id, conn)
        
        if not history:
            print("No se encontraron pagos para esta reservación.")
            
        else:
            for i, pago in enumerate(history, 1):
                print(f"Pago #{i}: Fecha: {pago['fecha']} | Monto: ${pago['monto']}")

    except Exception as e:
        print(f"❌ Error durante la prueba: {e}")
    finally:
        conn.close_conexion()

if __name__ == "__main__":
    test_get_payments_history()
