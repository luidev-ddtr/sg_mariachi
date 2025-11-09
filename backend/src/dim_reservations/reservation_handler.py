from src.dim_dates.dim_date import DIM_DATE
from src.utils.conexion import Conexion
from src.utils.id_generator import create_id
from src.dim_reservations.reservation_model import Reservation
from src.dim_people.people_services import PeopleService
from src.dim_reservations.repositorio.insert_reservation import insert_reservation
from src.dim_reservations.reservation_service import ReservaService
from datetime import datetime
from src.dim_people.people_handler import PeopleHandler

from src.dim_status.status import get_status_pending

people_services = PeopleService()
handler_people = PeopleHandler()

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
        dim_date_service = DIM_DATE(conexion)
        date_id = dim_date_service.dateId
        try:
            # 1. Validación de campos requeridos
            required_fields = [ 'DIM_ServiceOwnersId', 'DIM_StartDate', 'DIM_EndDate', 'DIM_EventAddress']
            for field in required_fields:
                if field not in _reservation:
                    return 400, "falta un campo"
            
            #El cliente existe 
            data_people = {
                "DIM_Name": _reservation["DIM_Name"],
                "DIM_SecondName": _reservation["DIM_SecondName"],
                "DIM_LastName": _reservation["DIM_LastName"],
                "DIM_SecondLastName":_reservation["DIM_SecondLastName"],
                "DIM_Address": _reservation["DIM_Address"],
                "DIM_PhoneNumber": _reservation["DIM_PhoneNumber"],
                "DIM_SecondPhoneNumber": _reservation["DIM_SecondPhoneNumber"]
            }
 
            # for data in data_people:
            #     print(f"'{data}': {_reservation[data]}")
            estatus, message, data = people_services.is_person_exist(data_people, conexion)
            people_id = ""
            #La funcion no devolvio nada
            if not data:
                #Se inserta la persona puesto que no existe
                message, code, id = handler_people.create_people(data_people)
                if code != 201:
                    return 500, message
                
                people_id = id
            else:
                people_id = data



            # 2. Extracción y parseo de datos
            new_start_str = _reservation['DIM_StartDate']
            new_end_str = _reservation['DIM_EndDate']
            new_start = datetime.fromisoformat(new_start_str)
            new_end = datetime.fromisoformat(new_end_str)

            service_owners_id = _reservation['DIM_ServiceOwnersId']

            # 3. Validación de lógica de negocio usando el SERVICIO
            # 3.1. La fecha de inicio debe ser anterior a la de fin
            if new_start >= new_end:
                return 400, "La hora de inicio debe ser anterior a la hora de fin"


            # 3.2. Validación de solapamiento de horarios (overlaps)
            reserva_service = ReservaService(conexion)
            reserva_service.validate_overlaps(service_owners_id, new_start_str, new_end_str)

            # 4. Generación de IDs y métricas
            year, month, day = dim_date_service.full_date
            res_id = create_id([people_id, day, _reservation['DIM_EventAddress']])
            print(res_id)
            
            
            if not date_id or "No se pudo" in date_id:
                 return 500, "esta fecha no existe"

            n_hours = (new_end - new_start).total_seconds() / 3600.0

            # 5. Instanciar el modelo de la reserva
            new_reservation = Reservation(
                DIM_ReservationId=res_id,
                DIM_PeopleId=people_id,
                DIM_StatusId= get_status_pending(),
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
                print(f"✅ Reserva creada: ID {res_id} para mariachi {service_owners_id}")
                return  201, f"Reserva creada exitosamente (ID: {res_id})"


        except ValueError as ve:
            print(f"⚠️ Validación fallida: {ve}")
            return  400, str(ve)  # Para overlaps o campos faltantes
        except Exception as e:
            print(f"❌ Error al crear la reserva: {e}")
            conexion.conn.rollback()
            return  500, "Error al crear la reserva",
        finally:
            conexion.close_conexion()