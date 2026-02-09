from src.fact_revenues.repositorio.get_total_paid import get_total_paid
from src.utils.conexion import Conexion

def test_get_total_amount():
    """
    Obtiene la suma total (acumulado) de los pagos registrados en fact_revenue
    para una reservación específica.
    
    Retorna 0.0 si no hay pagos registrados.
    """
    conn = Conexion()
    
    try:
        #Usaremos un id real para la prueba
        reservation_id = "85e2f78c-4ffd-535c"
        total_paid = get_total_paid(reservation_id, conn)
        print(f"Total pagado para la reservación {reservation_id}: {total_paid}")
    except Exception as e:
        print(f"❌ Error durante la prueba: {e}")
    finally:
        conn.close_conexion()

if __name__ == "__main__":
    test_get_total_amount()
