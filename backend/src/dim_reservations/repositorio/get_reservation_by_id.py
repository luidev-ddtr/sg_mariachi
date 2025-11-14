from src.utils.conexion import Conexion

def get_reservation_by_id(reservation_id: str, conn: Conexion) -> dict | None:
    """
    Obtiene una reserva específica por su ID desde la base de datos.

    Esta función ejecuta una consulta SELECT para encontrar un registro en la
    tabla `dim_reservation` que coincida con el `reservation_id` proporcionado.

    **Flujo de Proceso:**
    1.  **Definición de la Query:** Se define una consulta SQL para seleccionar
        todos los campos (`*`) de la tabla `dim_reservation`.
    2.  **Cláusula WHERE:** La consulta filtra los resultados utilizando el
        `DIM_ReservationId` para asegurar que solo se devuelva el registro deseado.
    3.  **Ejecución Segura:** Se utiliza una consulta parametrizada (`%s`) para
        prevenir inyecciones SQL. El `reservation_id` se pasa como una tupla
        en el método `execute`.
    4.  **Obtención de Resultados:** Se utiliza `fetchone()` para obtener el
        primer (y único) registro que coincide con el ID. Si no se encuentra
        ningún registro, `fetchone()` devuelve `None`.
    5.  **Manejo de Errores:** Un bloque `try...except` captura cualquier
        excepción de la base de datos durante la ejecución de la consulta,
        imprime un mensaje de error y devuelve `None`.

    **Permisos/Acceso:**
    - El usuario de la base de datos asociado a la conexión (`conn`) debe tener
      permisos de **SELECT** en la tabla `dim_reservation`.

    :param reservation_id: El identificador único de la reserva que se desea obtener.
    :type reservation_id: str
    :param conn: Un objeto de conexión a la base de datos que gestiona la sesión
                 y el cursor.
    :type conn: Conexion
    :return: Un diccionario que representa la reserva encontrada, con los nombres
             de las columnas como claves. Si no se encuentra ninguna reserva con
             ese ID o si ocurre un error, devuelve `None`.
    :rtype: dict | None
    """
    query = "SELECT * FROM dim_reservation WHERE DIM_ReservationId = %s"
    try:
        conn.cursor.execute(query, (reservation_id,))
        reservation = conn.cursor.fetchone()
        return reservation
    except Exception as e:
        print(f"Error al obtener la reserva por ID desde el repositorio: {e}")
        return None