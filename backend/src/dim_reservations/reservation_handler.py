from src.dim_dates.dim_date import DIM_DATE
from src.utils.conexion import Conexion
from src.utils.id_generator import create_id
from src.dim_reservations.reservation_model import Reservation
from src.dim_people.repository.validations import get_id_if_person_exists
from src.dim_reservations.repositorio.insert_reservation import insert_reservation
from src.dim_reservations.reservation_service import ReservaService
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class ReservationService:
    """
    Clase que representa el Handler de Reservaciones.
    Orquesta la lógica para crear, leer, actualizar y eliminar reservaciones,
    utilizando servicios de negocio y repositorios.
    """
    
    def create_reservation(self, _reservation: dict) -> tuple[str, int]:
        """
        Orquesta la creación de una nueva reserva.
        1. Valida datos de entrada.
        2. Llama al servicio de negocio para validar solapamientos.
        3. Genera IDs y prepara el objeto de reserva.
        4. Llama al repositorio para insertar en la base de datos.
        5. Maneja la transacción y la respuesta.
        """
        conexion = Conexion()
        try:
            # 1. Validación de campos requeridos
            required_fields = ['DIM_PeopleId', 'DIM_ServiceOwnersId', 'DIM_StartDate', 'DIM_EndDate', 'DIM_EventAddress']
            for field in required_fields:
                if field not in _reservation:
                    raise ValueError(f"Campo requerido faltante: {field}")

            # 2. Extracción y parseo de datos
            new_start_str = _reservation['DIM_StartDate']
            new_end_str = _reservation['DIM_EndDate']
            new_start = datetime.fromisoformat(new_start_str)
            new_end = datetime.fromisoformat(new_end_str)

            people_id = _reservation['DIM_PeopleId']
            service_owners_id = _reservation['DIM_ServiceOwnersId']

            # 3. Validación de lógica de negocio usando el SERVICIO
            # 3.1. La fecha de inicio debe ser anterior a la de fin
            if new_start >= new_end:
                raise ValueError("Error: La hora de inicio debe ser anterior a la hora de fin.")

            # 3.2. Validación de solapamiento de horarios (overlaps)
            reserva_service = ReservaService(conexion)
            reserva_service.validate_overlaps(service_owners_id, new_start_str, new_end_str)

            # 4. Generación de IDs y métricas
            res_id = create_id()
            
            dim_date_service = DIM_DATE(conexion)
            date_id = dim_date_service.get_id_by_object_date(new_start.year, new_start.month, new_start.day)
            if not date_id or "No se pudo" in date_id:
                 raise ValueError(f"La fecha {new_start.date()} no existe en DIM_Date. Ejecute el script de generación de fechas.")

            n_hours = (new_end - new_start).total_seconds() / 3600.0

            # 5. Instanciar el modelo de la reserva
            new_reservation = Reservation(
                DIM_ReservationId=res_id,
                DIM_PeopleId=people_id,
                DIM_StatusId=_reservation.get('DIM_StatusId', '1'),
                DIM_DateId=date_id,
                DIM_ServiceOwnersId=service_owners_id,
                DIM_EventAddress=_reservation['DIM_EventAddress'],
                DIM_StartDate=new_start.isoformat(),
                DIM_EndDate=new_end.isoformat(),
                DIM_NHours=n_hours,
                DIM_TotalAmount=_reservation.get('DIM_TotalAmount', 0),
                DIM_Notes=_reservation.get('DIM_Notes', '')
            )

            # 6. Inserción en la base de datos usando el REPOSITORIO
            success = insert_reservation(new_reservation, conexion)

            if success:
                conexion.save_changes()
                logger.info(f"✅ Reserva creada: ID {res_id} para mariachi {service_owners_id}")
                return f"Reserva creada exitosamente (ID: {res_id})", 201
            else:
                raise Exception("Fallo en la operación de inserción del evento.")

        except ValueError as ve:
            logger.warning(f"⚠️ Validación fallida: {ve}")
            return str(ve), 400  # Para overlaps o campos faltantes
        except Exception as e:
            logger.error(f"❌ Error al crear la reserva: {e}")
            conexion.conn.rollback()
            return "Error al crear la reserva", 500
        finally:
            conexion.close_conexion()