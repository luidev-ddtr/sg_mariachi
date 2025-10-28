from src.dim_dates.dim_date import DIM_DATE
from src.utils.conexion import Conexion
from src.dim_people.people_model import DIM_PEOPLE
from src.utils.id_generator import create_id

from src.dim_people.repository.insert import insert_people
class PeopleService:
    """
    Clase que representa el servicio de la tabla People
    manejara todo el crud y la logica principald e la informacion sobre las 
    perosnas que son agregaras a la tabla dim_people
    """
    
    def create_people(self, data_people: dict) -> tuple[str, int]:
        """
        Crea una nueva entrada de persona en la tabla dimensional `dim_people`.
        Este método gestiona toda la lógica para preparar e insertar un nuevo registro
        de persona, incluyendo la generación de IDs y la asociación con la dimensión de fechas.
        
        **Flujo de Proceso:**
        1. **Conexión:** Se inicializa una nueva conexión a la base de datos.
        2. **Fecha:** Se obtiene la información de la fecha actual a través de `DIM_DATE`
           para determinar `DIM_DateId` y el día actual para la generación del ID.
        3. **Generación de ID:** Se genera un identificador único para la persona (`DIM_PeopleId`)
           utilizando los campos de nombre, apellido y el día actual.
        4. **Formato del Modelo:** El diccionario de datos de entrada se mapea al modelo
           `DIM_PEOPLE` para asegurar el formato correcto.
        5. **Inserción:** Se llama a la función de repositorio `insert_people` para ejecutar
           la inserción en la base de datos.
        6. **Transacción:** Si la inserción es exitosa, se confirman los cambios (`save_changes`).
        7. **Cierre:** La conexión a la base de datos se cierra en el bloque `finally`
           independientemente del resultado.

        **Permisos/Acceso:**
        * Este servicio está destinado a ser utilizado por procesos de ETL o APIs internas.
        * Típicamente requiere credenciales de base de datos con permisos de **INSERT**
            en la tabla `dim_people` y de **SELECT** en la tabla de fechas.

        :param data_people: Diccionario que contiene los datos de la nueva persona. 
                            Debe incluir al menos "DIM_Name" y "DIM_LastName".
        :type data_people: dict
        :raises Exception: Captura cualquier error durante la conexión, la generación de IDs, 
                           el formateo de datos o la inserción en la base de datos.
        :return: Una tupla que contiene un mensaje de estado y un código HTTP.
                 Ejemplo: ("Persona creada exitosamente", 201) o ("Error al crear la persona", 500).
        :rtype: tuple[str, int]
        """
        conexion = Conexion()
        try:
            #Se rellena el modelo con la informacion que haya 
            #en el json
            dim_date = DIM_DATE(conexion)
            year, month, day = dim_date.full_date
            data_people["DIM_PeopleId"] = create_id([data_people["DIM_Name"], data_people["DIM_LastName"], day])
            data_people["DIM_DateId"] = dim_date.dateId
            data_format = DIM_PEOPLE(**data_people)
            
            #Se inserta la persona en la BD
            result = insert_people(data_format, conexion)
            
            if result:
                return "Persona creada exitosamente", 201
            else:
                return "Error al crear la persona", 500
        except Exception as e:
            print(f"Error al crear la persona: {e}")
            return "Error al crear la persona", 500
        finally:
            conexion.close_conexion()