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

    def validate_overlaps(
        self,
        service_owners_id: str,  # administrador
        start_str: str = "",  # ISO: "2025-11-05T10:00:00"
        end_str: str = "",
    ) -> None:
        """
        Valida si una nueva reserva se solapa con alguna existente para un mariachi en una fecha específica.
        Si encuentra un solapamiento, lanza una excepción ValueError.

        Args:
            service_owners_id (str): El ID del proveedor de servicio (mariachi).
            start_str (str): La fecha y hora de inicio de la nueva reserva en formato ISO.
            end_str (str): La fecha y hora de fin de la nueva reserva en formato ISO.

        Raises:
            ValueError: Si existe un choque de horario con otra reserva.
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
        Valida el solapamiento y, si no hay ninguno, inserta la reserva.
        Este método asegura que la validación ocurra dentro de la misma transacción
        justo antes de la inserción.

        Args:
            new_reservation (Reservation): El objeto de la nueva reserva a crear.

        Returns:
            tuple[bool, str]: (True, "Éxito") si se insertó, o (False, "Mensaje de error") si falló.
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