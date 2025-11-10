
class Reservation():
    """
    Modelo de datos para representar una Reserva (Reservation) en el sistema.

    Esta clase actúa como un Data Transfer Object (DTO) o un modelo de dominio
    para la dimensión 'dim_reservation' en un esquema de base de datos tipo
    Data Warehouse (o dimensional). Contiene todos los atributos que definen
    una reserva específica, incluyendo identificadores de clave subrogada
    (IDs de otras dimensiones) y métricas relevantes.

    Se utiliza para:
    1. **Validación de Datos**: Asegurar que los datos pasados para una reserva
       contengan todos los campos requeridos y con el tipo de dato esperado.
    2. **Transferencia de Datos**: Mover datos de reserva entre las capas de
       la aplicación (por ejemplo, desde la capa de servicio a la capa de persistencia).
    3. **Serialización/Deserialización**: Convertir el objeto a formatos como
       diccionarios o strings para su almacenamiento, transmisión o logging.

    Atributos:
        DIM_ReservationId (str): Clave primaria/Subrogada única de la reserva.
        DIM_PeopleId (str): Clave foránea que referencia a la dimensión de Persona (Cliente).
        DIM_StatusId (str): Clave foránea que referencia a la dimensión de Estatus (ej. Confirmada, Cancelada).
        DIM_DateId (str): Clave foránea que referencia a la dimensión de Fecha de creación/registro.
        DIM_ServiceOwnersId (str): Clave foránea que referencia a la dimensión de Propietarios de Servicio.
        DIM_EventAddress (str): Dirección física donde se llevará a cabo el evento/servicio.
        DIM_StartDate (str): Fecha y hora de inicio de la reserva (en formato string, típicamente ISO 8601).
        DIM_EndDate (str): Fecha y hora de finalización de la reserva (en formato string, típicamente ISO 8601).
        DIM_NHours (float): Número total de horas cubiertas por la reserva.
        DIM_TotalAmount (int): Monto total monetario de la reserva.
        DIM_Notes (str): Notas o comentarios adicionales relacionados con la reserva.
    """
    def __init__(self,
                DIM_ReservationId: str,
                DIM_PeopleId: str,
                DIM_StatusId: str,
                DIM_DateId: str,
                DIM_ServiceOwnersId: str,
                DIM_EventAddress: str,
                DIM_StartDate: str,
                DIM_EndDate: str,
                DIM_NHours: float,
                DIM_TotalAmount: int,
                DIM_Notes: str):
        """
        Constructor de la clase Reservation. Inicializa un nuevo objeto de reserva
        con todos los datos necesarios.

        Los tipos de datos son definidos para hinting, pero la representación
        interna (ej. fecha como 'str' o 'datetime') dependerá del flujo de datos.
        Aquí se usa 'str' para IDs y fechas, manteniendo consistencia con las
        operaciones típicas de transferencia/almacenamiento.

        Args:
            DIM_ReservationId (str): ID de la reserva.
            DIM_PeopleId (str): ID de la persona/cliente.
            DIM_StatusId (str): ID del estatus de la reserva.
            DIM_DateId (str): ID de la fecha.
            DIM_ServiceOwnersId (str): ID del propietario del servicio.
            DIM_EventAddress (str): Dirección.
            DIM_StartDate (str): Fecha de inicio.
            DIM_EndDate (str): Fecha de fin.
            DIM_NHours (float): Número de horas.
            DIM_TotalAmount (int): Monto total.
            DIM_Notes (str): Notas.
        """
        self.DIM_ReservationId = DIM_ReservationId
        self.DIM_PeopleId = DIM_PeopleId
        self.DIM_StatusId = DIM_StatusId
        self.DIM_DateId = DIM_DateId
        self.DIM_ServiceOwnersId = DIM_ServiceOwnersId
        self.DIM_EventAddress = DIM_EventAddress
        self.DIM_StartDate = DIM_StartDate
        self.DIM_EndDate = DIM_EndDate
        self.DIM_NHours = DIM_NHours
        self.DIM_TotalAmount = DIM_TotalAmount
        self.DIM_Notes = DIM_Notes
        
        
    def to_dict(self):
        """
        Convierte el objeto Reservation en un diccionario de Python.

        Esta es una utilidad clave para la serialización, especialmente al
        preparar datos para un API JSON o para la ingesta en bases de datos
        que aceptan formatos clave-valor.

        Detalles de implementación:
            - **Conversión de Fechas**: Los campos 'DIM_StartDate' y 'DIM_EndDate'
              se convierten explícitamente a `str()` si existen. Esto es crucial
              si las fechas son objetos `datetime` y deben ser representadas como
              cadenas de texto (ej. ISO 8601) para la serialización. Si el valor
              es nulo (`None`), se asigna `None` al diccionario para evitar errores
              de conversión.

        Returns:
            dict: Un diccionario donde las claves son los nombres de los atributos
                  de la reserva y los valores son los datos correspondientes.
        """
        return {
            'DIM_ReservationId': self.DIM_ReservationId,
            'DIM_PeopleId': self.DIM_PeopleId,
            'DIM_StatusId': self.DIM_StatusId,
            'DIM_DateId': self.DIM_DateId,
            'DIM_ServiceOwnersId': self.DIM_ServiceOwnersId,
            'DIM_EventAddress': self.DIM_EventAddress,
            'DIM_StartDate': str(self.DIM_StartDate) if self.DIM_StartDate else None,
            'DIM_EndDate': str(self.DIM_EndDate) if self.DIM_EndDate else None,
            'DIM_NHours': self.DIM_NHours,
            'DIM_TotalAmount': self.DIM_TotalAmount,
            'DIM_Notes': self.DIM_Notes,
        }

    def __str__(self):
        """
        Devuelve una representación en cadena del objeto Reservation.

        Este método se utiliza para facilitar el debugging y el logging,
        proporcionando una vista rápida y legible de los valores clave del objeto.

        Returns:
            str: Una cadena de texto formateada que lista los atributos principales
                 y sus valores, separados por un ' | '.
        """
        return (f"ReservationID: {self.DIM_ReservationId} | "
                f"PeopleID: {self.DIM_PeopleId} | "
                f"StatusID: {self.DIM_StatusId} | "
                f"DateID: {self.DIM_DateId} | "
                f"ServiceOwnersID: {self.DIM_ServiceOwnersId} | "
                f"EventAddress: {self.DIM_EventAddress} | "
                f"StartDate: {self.DIM_StartDate} | "
                f"EndDate: {self.DIM_EndDate} | "
                f"NHours: {self.DIM_NHours} | "
                f"TotalAmount: {self.DIM_TotalAmount} | "
                f"Notes: {self.DIM_Notes} | "
                )
        
        