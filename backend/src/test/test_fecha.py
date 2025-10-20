from src.utils.conexion import Conexion
from src.dim_dates.dim_date import DIM_DATE

def test_dim_date():
    data_conection = Conexion()
    try:
        modelo = DIM_DATE(data_conection)
        modelo.mostrar_todas_fechas()
        # modelo.mostrar_todas_fechas() # Descomentar si se necesita para depurar
    finally:
        data_conection.close_conexion()