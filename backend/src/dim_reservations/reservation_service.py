from src.utils.conexion import Conexion
from datetime import datetime, date
from src.dim_reservations.repositorio.get_dates_reservations import get_dates_reservations # Aseguramos que la importación sea correcta
from src.dim_reservations.repositorio.insert_reservation import insert_reservation
from src.dim_reservations.reservation_model import Reservation

class ReservaService:
    """
    Contiene la lógica de negocio específica para las reservaciones.
    Estas funciones son reutilizables y no gestionan la transacción completa.
    """

    def __init__(self, conn: Conexion):
        self.conn = conn
        """
        Inicializa una nueva instancia del servicio de reservaciones.

        Este constructor es fundamental para la inyección de dependencias, ya que
        recibe un objeto de conexión a la base de datos (`conn`). Al operar con una
        conexión externa, se asegura que todas las operaciones realizadas por esta
        instancia del servicio (como validar solapamientos e insertar) formen parte

        de una única transacción controlada por la capa superior (el `handler`).

        Esto es crucial para mantener la integridad de los datos: si una validación
        falla, la capa superior puede revertir (rollback) todas las operaciones
        pendientes en esa transacción, incluyendo la creación de un cliente nuevo.

        **Acceso/Uso:**
        - No está diseñado para ser invocado directamente por un endpoint.
        - Es instanciado por la capa de `handler` (ej. `ReservationHandler`), que
        le proporciona la conexión activa.

        :param conn: Objeto de conexión a la base de datos que gestionará
                    las operaciones de lectura y escritura.
        :type conn: Conexion
        """
    def validate_overlaps(
        self,
        service_owners_id: str,  # administrador
        start_str: str = "",  # ISO: "2025-11-05T10:00:00"
        end_str: str = "",
    ) -> None:
        """
        Valida si un nuevo intervalo de tiempo de reserva se solapa con alguna reserva existente
        para un proveedor de servicios específico (ej. un mariachi).

        Este método es una regla de negocio crítica para evitar dobles reservaciones.
        Si detecta un conflicto, lanza una excepción `ValueError`, deteniendo el flujo
        de creación de la reserva.

        **Flujo de Proceso:**
        1.  **Conversión de Fechas:** Convierte las fechas de inicio y fin (en formato
            string ISO 8601) a objetos `datetime` para poder realizar comparaciones.
        2.  **Obtención de Datos:** Llama a la función de repositorio `get_dates_reservations`,
            pasándole el ID del proveedor (`service_owners_id`) para obtener una lista
            de todas sus reservas existentes. Esto optimiza la validación al no traer
            reservas de otros proveedores.
        3.  **Lógica de Solapamiento:** Itera sobre cada reserva existente y aplica la
            lógica de intervalo: `(new_start < existing_end) and (new_end > existing_start)`.
            Esta condición es verdadera si los dos intervalos de tiempo tienen cualquier
            superposición, por mínima que sea.
        4.  **Lanzamiento de Excepción:** Si se encuentra un solapamiento, se interrumpe
            el bucle y se lanza un `ValueError` con un mensaje claro que incluye el ID
            de la reserva conflictiva y su horario, proporcionando feedback útil al usuario final.

        **Permisos/Acceso:**
        - El usuario de la base de datos asociado a la conexión (`self.conn`) debe
        tener permisos de **SELECT** en la tabla `dim_reservation` para poder
        consultar los horarios existentes.
        - Es una función de lógica de negocio interna, llamada por otros métodos
        del servicio como `create_and_validate_reservation`.

        :param service_owners_id: El ID del propietario del servicio (mariachi) cuya
                                agenda se está validando.
        :type service_owners_id: str
        :param start_str: La fecha y hora de inicio de la nueva reserva en formato
                        string ISO ("YYYY-MM-DDTHH:MM:SS").
        :type start_str: str
        :param end_str: La fecha y hora de fin de la nueva reserva en formato
                        string ISO ("YYYY-MM-DDTHH:MM:SS").
        :type end_str: str
        :raises ValueError: Si el nuevo intervalo de tiempo se solapa con una reserva
                        existente.
        """
        new_start = datetime.fromisoformat(start_str)
        new_end = datetime.fromisoformat(end_str)

        # 1. Obtener TODAS las reservas existentes para ese mariachi
        existing_reservations = get_dates_reservations(self.conn, service_owners_id)

        # 2. Validar si hay solapamiento (overlap)
        for res_dict in existing_reservations:
            existing_start = datetime.fromisoformat(res_dict['DIM_StartDate'])
            existing_end = datetime.fromisoformat(res_dict['DIM_EndDate'])

            if (new_start < existing_end) and (new_end > existing_start):
                res_id = res_dict['DIM_ReservationId']
                raise ValueError(f"Choque de horario con reserva {res_id}: {existing_start.time()} - {existing_end.time()}")

    def create_and_validate_reservation(self, new_reservation: Reservation) -> tuple[bool, str]:
        """
        Orquesta la validación de solapamiento y la inserción de una nueva reserva
        de manera atómica dentro de una transacción.

        Este método combina dos responsabilidades críticas: primero, asegurar que la
        nueva reserva no entre en conflicto con el calendario existente y, segundo,
        persistirla en la base de datos si la validación es exitosa.

        **Flujo de Proceso:**
        1.  **Validación de Solapamiento:** Invoca a `self.validate_overlaps` con los
            datos del objeto `new_reservation`. Esta es la primera barrera de
            validación de negocio.
        2.  **Manejo de Errores de Validación:** Si `validate_overlaps` lanza un
            `ValueError` (indicando un choque de horario), este método lo captura
            y lo transforma en una tupla de resultado `(False, "mensaje de error")`,
            que es un formato manejable por la capa de `handler`.
        3.  **Inserción en Repositorio:** Si la validación de solapamiento no lanza
            ninguna excepción, procede a llamar a la función de repositorio
            `insert_reservation`. Esta función ejecuta el comando `INSERT` SQL final.
        4.  **Retorno de Resultado:** Devuelve una tupla que indica el éxito o fracaso
            de la operación completa, junto con un mensaje descriptivo.

        **Permisos/Acceso:**
        - Este método es llamado por la capa `handler` (ej. `ReservationHandler`).
        - El usuario de base de datos subyacente necesita permisos de:
            - **SELECT** en `dim_reservation` (requerido por `validate_overlaps`).
            - **INSERT** en `dim_reservation` (requerido por `insert_reservation`).

        :param new_reservation: Un objeto `Reservation` completamente populado con
                                todos los datos de la reserva a crear.
        :type new_reservation: Reservation
        :return: Una tupla `(success, message)` donde `success` es un booleano que
                indica si la operación fue exitosa, y `message` es una cadena
                descriptiva del resultado.
        :rtype: tuple[bool, str]
        """
        try:
            # 1. Primero, validamos el solapamiento.
            self.validate_overlaps(
                service_owners_id=new_reservation.DIM_ServiceOwnersId,
                start_str=new_reservation.DIM_StartDate,
                end_str=new_reservation.DIM_EndDate
            )
            # 2. Si la validación pasa (no lanza excepción), procedemos a insertar.
            success = insert_reservation(new_reservation, self.conn)
            return success, "Reserva insertada" if success else "Fallo en la inserción del repositorio"
        except ValueError as ve:
            # Si validate_overlaps lanza un error, lo capturamos y lo devolvemos como un fallo.
            return False, str(ve)