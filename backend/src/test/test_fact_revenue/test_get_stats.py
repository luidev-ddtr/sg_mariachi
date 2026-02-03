from src.fact_revenues.repositorio.get_revenue_stats import get_revenue_stats
from src.utils.conexion import Conexion

def test_get_revenue_stats():
    # Configurar la conexión de prueba
    conn = Conexion()
    
    try:
        # Probar con filtro por mes
        month_stats = get_revenue_stats(conn, 'month', 2026)
        assert isinstance(month_stats, list)
        
        # Probar con filtro por semana
        week_stats = get_revenue_stats(conn, 'week', 2026)
        assert isinstance(week_stats, list)
        
        # Probar con filtro por año
        year_stats = get_revenue_stats(conn, 'year', 2026)
        assert isinstance(year_stats, list)
        
        print("✅ test_get_revenue_stats passed.")
        print("Ganancias por mes:", month_stats)
        print("Ganancias por semana:", week_stats)
        print("Ganancias por año:", year_stats)
        
    except AssertionError as e:
        print(f"❌ test_get_revenue_stats failed: {e}")
        
    finally:
        conn.close_conexion()

if __name__ == "__main__":
    test_get_revenue_stats()