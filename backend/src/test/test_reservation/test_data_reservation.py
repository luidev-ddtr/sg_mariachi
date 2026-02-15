from src.utils.conexion import Conexion
from src.dim_reservations.repositorio.data_reservation_calendar import get_reservation_stats

def test_get_reservation_stats():

    # Instanciar la conexión
    conn = Conexion()

    # Probar la función para obtener estadísticas de reservas por día
    day__stats = get_reservation_stats(conn, filter_type='day', year=2025)
    print("Estadísticas por día:", day__stats)

    # Probar la función para obtener estadísticas de reservas por semana
    week_stats = get_reservation_stats(conn, filter_type='week', year=2025)
    print("Estadísticas por semana:", week_stats)

    # Probar la función para obtener estadísticas de reservas por mes
    month_stats = get_reservation_stats(conn, filter_type='month', year=2025, month=1)
    print("Estadísticas por mes:", month_stats)
    
    # Probar la función para obtener estadísticas de reservas por año
    year_stats = get_reservation_stats(conn, filter_type='year', year=2025) 
    print("Estadísticas por año:", year_stats)

    print("✅ Pruebas de get_reservation_stats completadas.")
    print(day__stats)
    print(week_stats)
    print(month_stats)
    print(year_stats)

    # Cerrar la conexión
    conn.close_conexion()

if __name__ == "__main__":
    test_get_reservation_stats()
    

