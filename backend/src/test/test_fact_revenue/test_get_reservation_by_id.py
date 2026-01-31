from src.fact_revenues.repositorio.get_fact_revenues_by_id import get_fact_revenues_by_id
from src.utils.conexion import Conexion

# Test para la función get_fact_revenues_by_id mostrando el detalle de una reservación específica
def test_get_reservation_by_id():
    conn = Conexion()
    try:
        # ID de reservación de prueba
        test_reservation_id = "ccc62149-e5ff-5a96"
        revenue_info = get_fact_revenues_by_id(test_reservation_id, conn)
        print(revenue_info)
    except Exception as e:
        print(f"❌ Error durante la prueba: {e}")
    finally:
        conn.close_conexion()

if __name__ == "__main__":
    test_get_reservation_by_id()  