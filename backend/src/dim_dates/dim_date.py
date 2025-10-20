from typing import Optional
from src.utils.conexion import Conexion
import datetime
import pytz
import math

class DIM_DATE:
    """
    Clase de servicio para la Dimensión de Tiempo/Fecha (`DIM_Date`).

    Esta clase maneja la lógica para obtener la fecha actual, buscar o generar 
    la entrada de fecha correspondiente en la tabla dimensional de la base de datos 
    (Data Warehouse), y proporciona métodos de utilidad para la gestión de fechas.
    """
    def __init__(self, connection: Conexion) -> None:
        """
        Constructor de la clase DIM_DATE.

        Al inicializar, obtiene la fecha actual y automáticamente busca su ID 
        correspondiente en la base de datos. Si la fecha no existe, intenta crearla 
        y obtener el ID generado (aunque la lógica de creación parece estar incompleta 
        en `get_id_by_object_date`, el flujo espera obtener el ID).

        **Flujo de Inicialización:**
        1. Se almacena la conexión a la BD.
        2. Se llama a `_get_full_date()` para obtener la tupla (año, mes, día).
        3. Se llama a `get_id_by_object_date()` para buscar el ID de la fecha.

        :param connection: Objeto de conexión activa a la base de datos.
        :type connection: Conexion
        :ivar full_date: Una tupla con (año, mes, día) de la fecha actual.
        :ivar dateId: El ID (clave primaria) de la fecha en la dimensión.
        :return: None
        """
        self.connection = connection
        self.full_date = self._get_full_date()
        self.dateId = self.get_id_by_object_date(*self.full_date)

    def _get_full_date(self) -> tuple:
        """
        Obtiene la fecha y hora actual en la zona horaria de la Ciudad de México.

        Este es un método interno (convención con `_`) para asegurar la consistencia 
        de la zona horaria en el Data Warehouse, crucial para procesos ETL.

        **Lógica:**
        * Utiliza `datetime.datetime.now()` junto con `pytz` para forzar la zona horaria 
        a "America/Mexico_City".

        :return: Una tupla que contiene (año, mes, día) de la fecha actual.
        :rtype: tuple[int, int, int]
        """
        now = datetime.datetime.now(pytz.timezone("America/Mexico_City"))
        return (now.year, now.month, now.day)

    def get_id_by_object_date(self, year: int, month: int, day: int) -> Optional[str]:
        """
        Busca el identificador (`DIM_DateId`) de una fecha específica en la base de datos.
        
        El ID de la fecha se genera concatenando el año, mes y día (ej: 20230515).

        **Proceso de Búsqueda:**
        1. Se construye el `date_id` numérico.
        2. Se ejecuta una consulta `SELECT` para verificar si el ID ya existe en la tabla `DIM_Date`.
        3. Si el registro existe (`result` no es `None`), se retorna su `DIM_DateId`.
        4. **NOTA:** El código actual indica "No se pudo conseguir la fecha" si no hay resultado,
           pero la lógica de **creación/inserción de la nueva fecha** está ausente, 
           lo cual requeriría una llamada a una función de repositorio de inserción aquí.
        
        **Permisos Requeridos:**
        * El usuario de la BD debe tener permisos de **SELECT** sobre la tabla `DIM_Date`.

        :param year: El año de la fecha a buscar.
        :type year: int
        :param month: El mes de la fecha a buscar.
        :type month: int
        :param day: El día de la fecha a buscar.
        :type day: int
        :raises Exception: Captura errores durante la ejecución de la consulta SQL.
        :return: El ID numérico de la fecha si se encuentra; `None` si ocurre un error 
                 o, según la lógica actual, un `str` de error si no se encuentra.
        :rtype: Optional[str]
        """
        date_id = int(f"{year}{month:02d}{day:02d}")
        try:
            query_select = "SELECT DIM_DateId FROM DIM_Date WHERE DIM_DateId = %s"
            # Usamos el método execute_query de la clase Conexion
            self.connection.cursor.execute(query_select, (date_id,))
            result = self.connection.cursor.fetchone()
            if not  result:
                return "No se pudo conseguir la fecha"

            # execute_query devuelve una lista, tomamos el primer elemento
            return result['DIM_DateId']
        except Exception as e:
            print(f"Error al obtener o insertar ID de fecha: {e}")
            return None
    
    def mostrar_todas_fechas(self) -> None:
        """
        Muestra todas las filas de la tabla `DIM_Date`.

        Este método está diseñado principalmente para propósitos de **depuración** (debugging) y verificación de datos en el entorno de desarrollo o prueba. 
        No es un método de uso común en producción.

        **Permisos Requeridos:**
        * El usuario de la BD debe tener permisos de **SELECT** sobre la tabla `DIM_Date`.

        :return: None. Imprime los resultados directamente en la consola.
        """
        query = "SELECT * FROM DIM_Date"
        try:
            self.connection.cursor.execute(query)
            results = self.connection.cursor.fetchall()
            print("Fechas en la tabla DIM_Date:")
            for row in results:
                print(row)
        except Exception as e:
            print(f"Error al mostrar las fechas: {e}")
