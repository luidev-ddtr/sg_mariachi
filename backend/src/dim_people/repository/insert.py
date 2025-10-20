from src.utils.conexion import Conexion
from src.dim_people.people_model import DIM_PEOPLE

def insert_people(data_people: DIM_PEOPLE, object_coon: Conexion):
    """
    Función de repositorio encargada de ejecutar la sentencia INSERT para 
    agregar una nueva persona a la tabla dimensional `dim_people`.

    Este método recibe el modelo de datos ya preparado y una conexión activa 
    para realizar la operación en la base de datos (BD).

    **Lógica de Ejecución:**
    1. Se define la `query` SQL con placeholders (`%s`) para una inserción segura.
    2. Se prepara la tupla `values` con los atributos del objeto `data_people`, 
       manteniendo el orden exacto de las columnas definidas en la consulta.
    3. Se ejecuta la consulta utilizando el cursor de la conexión proporcionada, 
       pasando la consulta y los valores por separado.
    4. **Manejo de Errores:** En caso de fallar la ejecución (ej. error de clave duplicada, 
       error de tipo de dato, etc.), se captura la excepción, se imprime el error 
       y se retorna `False`.

    **Dependencias/Acceso:**
    * Requiere un objeto `Conexion` activo que maneje la conexión y el cursor de la BD.
    * Requiere que el usuario de la BD tenga permisos de **INSERT** sobre la tabla `dim_people`.

    :param data_people: Modelo de datos `DIM_PEOPLE` que contiene todos los atributos 
                        de la persona a insertar.
    :type data_people: DIM_PEOPLE
    :param object_coon: Objeto de conexión activa a la base de datos.
    :type object_coon: Conexion
    :raises Exception: Captura errores relacionados con la ejecución de la consulta SQL.
    :return: `True` si la inserción se realiza correctamente; `False` en caso de error.
    :rtype: bool
    """
    query = """
    INSERT INTO dim_people
        (DIM_PeopleId, DIM_Name, DIM_SecondName, DIM_LastName, DIM_SecondLastName, DIM_Address,DIM_PhoneNumber, DIM_SecondPhoneNumber, DIM_DateId)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    try:
        values = (
            data_people.DIM_PeopleId,
            data_people.DIM_Name,
            data_people.DIM_SecondName,
            data_people.DIM_LastName,
            data_people.DIM_SecondLastName,
            data_people.DIM_Address,
            data_people.DIM_PhoneNumber,
            data_people.DIM_SecondPhoneNumber,
            data_people.DIM_DateId
        )
        print(f"Estos son los valores: {values}")
        print(f"Esto es la query: {query}")
        object_coon.cursor.execute(query, values)
        
        return True
    except Exception as err:
        print(f"Error al insertar la persona: {err}")
        return False