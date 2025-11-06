import mysql.connector
from src.utils.conexion import Conexion
from typing import Any

def get_id_if_person_exists(nombre, segundo_nombre, apellido, segundo_apellido, direccion, telefono, segundo_telefono, conexion: Conexion) -> None | Any:
    """
    Verifica la existencia de una persona (cliente) en la tabla DIM_People
    basándose en la coincidencia de todos los campos de identificación.

    Args:
        nombre (str): Primer nombre de la persona.
        segundo_nombre (str): Segundo nombre de la persona (puede ser None o cadena vacía).
        apellido (str): Apellido principal.
        segundo_apellido (str): Segundo apellido.
        direccion (str): Dirección de residencia.
        telefono (str/int): Número de teléfono principal.
        segundo_telefono (str/int): Segundo número de teléfono (puede ser None o cadena vacía).
        conexion (Conexion): Objeto de conexión a la base de datos (se asume que tiene
                             un cursor ya configurado para diccionarios/resultados con nombre de columna).

    Returns:
        int/str/None: El identificador único (DIM_PeopleId) de la persona si existe,
                      o None si no se encuentra la persona o si ocurre un error.

    Lógica SQL:
        - La búsqueda es case-insensitive para la mayoría de los campos de texto
          (nombre, apellidos, dirección) utilizando la función `LOWER()`.
        - **Manejo del Segundo Nombre (`DIM_SecondName`):**
          - Implementa una lógica OR que considera dos casos para la validación:
            1.  **Caso A (Segundo Nombre NO proporcionado):** Si el parámetro `segundo_nombre`
                es `NULL` o una cadena vacía, solo buscará registros donde
                `DIM_SecondName` también sea `NULL` o una cadena vacía.
            2.  **Caso B (Segundo Nombre SÍ proporcionado):** Si el parámetro
                `segundo_nombre` no es `NULL` ni vacío, buscará registros donde
                `DIM_SecondName` coincida con el valor proporcionado (después de
                aplicar `TRIM()` y `LOWER()`).
        - Restringe el resultado a una sola fila (`LIMIT 1`).

    Comportamiento:
        - Utiliza `conexion.cursor.execute()` para ejecutar la consulta con los
          parámetros de forma segura (prevención de SQL Injection).
        - Si la persona existe, retorna el valor de la columna `DIM_PeopleId`.
        - Captura y reporta errores de `mysql.connector.Error`.
        - Es una función de utilidad interna; no se espera que un usuario final
          tenga acceso directo a ella, sino que se ejecuta bajo un proceso de sistema
          o un servicio con permisos de **solo lectura (SELECT)** sobre la tabla `DIM_People`.
    """
    query = """
    SELECT
        DIM_PeopleId
    FROM
        DIM_People
    WHERE
        LOWER(DIM_Name) = LOWER(%s)
        AND         (
            -- Caso A: el parámetro del segundo nombre viene vacío o NULL
            (%s IS NULL OR TRIM(%s) = '')
            AND (DIM_SecondName IS NULL OR TRIM(DIM_SecondName) = '')
        )
        OR
        (
            -- Caso B: el parámetro del segundo nombre tiene contenido
            ( %s IS NOT NULL AND TRIM(%s) <> '' )
            AND LOWER(TRIM(DIM_SecondName)) = LOWER(TRIM(%s))
        )
        AND LOWER(DIM_LastName) = LOWER(%s)
        AND LOWER(DIM_SecondLastName) = LOWER(%s)
        AND LOWER(DIM_Address) = LOWER(%s)
        AND DIM_PhoneNumber = %s
        AND DIM_SecondPhoneNumber = %s
    LIMIT 1;
    """
    values = (
        nombre,
        segundo_nombre,
        segundo_nombre, #Se repite porque se valida si no sea nulo o vacio
        segundo_nombre,
        segundo_nombre,
        segundo_nombre,
        apellido,
        segundo_apellido,
        direccion,
        telefono,
        segundo_telefono
    )
    try:
        # print("Intentando obtener el ID de la persona...")
        # print(f"Query: {query}")
        # print(f"Values: {values}")
        conexion.cursor.execute(query, values)
        result = conexion.cursor.fetchone()
        if result is None or result["DIM_PeopleId"] is None:
            return None
        return result["DIM_PeopleId"]
    
    except mysql.connector.Error as e:
        print(f"Error al obtener el ID de la persona: {e}")
    return None
