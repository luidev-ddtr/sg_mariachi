from src.utils.conexion import Conexion
from datetime import datetime, date
from typing import Optional
import logging
from src.dim_reservations.repositorio.get_dates_reservations import get_dates_reservations

logger = logging.getLogger(__name__)

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
        target_date = new_start.date()

        # 1. Obtener las reservas existentes para esa fecha y mariachi
        existing = get_dates_reservations(self.conn, service_owners_id, target_date)

        # 2. Validar si hay solapamiento (overlap)
        for res_dict in existing:
            existing_start = datetime.fromisoformat(res_dict['DIM_StartDate'])
            existing_end = datetime.fromisoformat(res_dict['DIM_EndDate'])

            if (new_start < existing_end) and (new_end > existing_start):
                res_id = res_dict['DIM_ReservationId']
                raise ValueError(f"Choque de horario con reserva {res_id}: {existing_start.time()} - {existing_end.time()}")