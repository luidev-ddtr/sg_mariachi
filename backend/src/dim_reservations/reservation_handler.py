from src.dim_dates.dim_date import DIM_DATE
from src.utils.conexion import Conexion
from src.utils.id_generator import create_id
from src.dim_reservations.reservation_model import Reservation
from src.dim_people.people_services import PeopleService
from src.dim_people.people_handler import PeopleHandler
from src.dim_reservations.reservation_service import ReservaService
from datetime import datetime
from src.dim_people.people_handler import PeopleHandler
from src.dim_status.status import get_status_pending

from src.dim_reservations.repositorio.read_reservations import read_reservations_with_date_filter
from src.dim_reservations.repositorio.get_reservation_by_id import get_reservation_by_id




people_services = PeopleService()
handler_people = PeopleHandler()

class ReservationService:
    """
    Clase que representa el Handler de Reservaciones.
    Orquesta la lógica para crear, leer, actualizar y eliminar reservaciones,
    utilizando servicios de negocio y repositorios.
    """
    
    def create_reservation(self, _reservation: dict, conn: Conexion = None) -> tuple[str, int]:
        """
        Orquesta la creación de una nueva reserva, manejando la lógica de negocio,
        la validación de datos, la gestión de clientes y la persistencia en la base de datos.

        Este método actúa como el punto de entrada principal en la capa de handler para
        registrar una nueva reservación. Coordina múltiples servicios y repositorios
        para asegurar la integridad de los datos y la correcta ejecución de la transacción.

        **Flujo de Proceso:**
        1.  **Gestión de Conexión:**
            - Si se proporciona un objeto `conn` (conexión), se utiliza para la operación.
            Esto es crucial para las pruebas unitarias o para procesos que necesitan
            agrupar varias operaciones en una única transacción.
            - Si no se proporciona, se crea una nueva conexión a la base de datos.

        2.  **Obtención de Fecha:**
            - Se instancia `DIM_DATE` para obtener el `dateId` correspondiente a la fecha actual,
            que se usará como la fecha de registro de la reserva.

        3.  **Validación de Datos de Entrada:**
            - Se verifica que los campos esenciales para una reserva (`DIM_ServiceOwnersId`,
            `DIM_StartDate`, `DIM_EndDate`, `DIM_EventAddress`) estén presentes en el
            diccionario de entrada `_reservation`.

        4.  **Gestión del Cliente (Persona):**
            - Se extraen los datos del cliente del diccionario `_reservation`.
            - Se invoca a `people_services.is_person_exist` para comprobar si el cliente
            ya existe en la base de datos.
            - **Si el cliente no existe:** Se llama a `handler_people.create_people` para
            crear un nuevo registro de persona y se obtiene su nuevo ID.
            - **Si el cliente ya existe:** Se utiliza su ID (`people_id`) existente.

        5.  **Validación de Lógica de Negocio:**
            - Se parsean las fechas de inicio y fin.
            - Se valida que la fecha de inicio sea estrictamente anterior a la fecha de fin.
            - Se invoca a `ReservaService.create_and_validate_reservation`, que a su vez
            realiza la validación de solapamiento de horarios. Este servicio busca
            reservas existentes para el mismo `DIM_ServiceOwnersId` y lanza un error
            si hay un choque de horarios.

        6.  **Preparación del Modelo de Reserva:**
            - Se genera un ID único para la reserva (`res_id`) usando una combinación
            del ID del cliente, el día actual y la dirección del evento.
            - Se calculan métricas como el número de horas (`n_hours`).
            - Se instancia el objeto `Reservation` con todos los datos validados y generados,
            incluyendo el estatus por defecto "pendiente" obtenido de `get_status_pending()`.

        7.  **Persistencia en Base de Datos:**
            - El objeto `Reservation` se pasa al método `create_and_validate_reservation`
            del servicio, que finalmente llama a la función de repositorio `insert_reservation`
            para ejecutar el `INSERT` en la base de datos.
            - Si la inserción y la validación de solapamiento son exitosas, la transacción
            se confirma (commit).

        8.  **Manejo de Errores y Transacciones:**
            - Si ocurre un `ValueError` (ej. por choque de horarios), se retorna un código 400.
            - Si ocurre cualquier otra excepción, la transacción se revierte (`rollback`)
            para evitar datos inconsistentes y se retorna un código 500.

        9.  **Cierre de Conexión:**
            - En el bloque `finally`, se asegura que la conexión se cierre solo si fue
            creada dentro de este método, evitando cerrar conexiones gestionadas externamente.

        **Permisos/Acceso:**
        - Este servicio está diseñado para ser llamado por un endpoint de API (ej. un POST a `/reservations`).
        - El usuario de la base de datos asociado debe tener permisos de:
            - **SELECT** en `dim_people`, `dim_date`, `dim_reservation`.
            - **INSERT** en `dim_people` y `dim_reservation`.

        :param _reservation: Diccionario con los datos de la reserva y del cliente.
        :type _reservation: dict
        :param conn: (Opcional) Objeto de conexión a la base de datos para control transaccional.
        :type conn: Conexion, optional
        :raises ValueError: Si hay un error de validación, como un solapamiento de horarios.
        :raises Exception: Para errores generales de base de datos o de lógica interna.
        :return: Una tupla con el código de estado HTTP y un mensaje descriptivo.
                Ej: (201, "Reserva creada exitosamente...") o (400, "Choque de horario...").
        :rtype: tuple[int, str]
        """
        # Usa la conexión existente si se proporciona, de lo contrario crea una nueva.
        # Esto es clave para que las pruebas puedan compartir una transacción.
        conexion = conn or Conexion()
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
            # Ahora, la validación de solapamiento y la inserción ocurren dentro del servicio.
            reserva_service = ReservaService(conexion)
            success, message = reserva_service.create_and_validate_reservation(new_reservation)
            if not success:
                raise ValueError(message) # Lanzamos el error para que el handler lo atrape

            if success:
                # Este es el único lugar donde debemos confirmar la transacción.
                #conexion.save_changes()
                return  201, f"Reserva creada exitosamente (ID: {res_id})"
            else:
                return 500, "No se pudo insertar la reserva en la base de datos."


        except ValueError as ve:
            print(f"⚠️ Validación fallida: {ve}")
            return  400, str(ve)  # Para overlaps o campos faltantes
        except Exception as e:
            print(f"❌ Error al crear la reserva: {e}")
            conexion.conn.rollback()
            return  500, f"Error al crear la reserva: {e}"
        finally:
            # Solo cierra la conexión si fue creada dentro de este método.
            if not conn:
                conexion.close_conexion()
    
    def read_reservations_by_date(self, date, conn: Conexion = None) -> tuple[int, list]:
        """
        Obtiene todas las reservaciones de la semana correspondiente a una fecha dada.

        Este método calcula a qué semana del mes pertenece un día específico y luego
        utiliza esa información para consultar todas las reservaciones programadas
        dentro de esa semana.

        **Flujo de Proceso:**
        1.  **Gestión de Conexión:** Utiliza una conexión existente o crea una nueva.
        2.  **Cálculo de la Semana:** Determina el número de la semana dentro del mes
            basado en el día proporcionado. La lógica es que los días 1-7 son la semana 1,
            8-14 la semana 2, y así sucesivamente.
        3.  **Consulta al Repositorio:** Llama a la función `read_reservations_with_date_filter`
            pasando el año, mes y la semana calculada para obtener los datos.
        4.  **Formateo de Respuesta:** Convierte la lista de objetos `VIEWReservation`
            en una lista de diccionarios, que es un formato ideal para una respuesta JSON.
        5.  **Manejo de Errores:** Captura cualquier excepción durante el proceso y
            devuelve una tupla de error.
        6.  **Cierre de Conexión:** Se asegura de cerrar la conexión si fue creada
            localmente.

        :param year: El año de la fecha a consultar.
        :type year: int
        :param month: El mes de la fecha a consultar.
        :type month: int
        :param day: El día de la fecha a consultar.
        :type day: int
        :param conn: (Opcional) Objeto de conexión a la base de datos.
        :type conn: Conexion, optional
        :return: Una tupla con el código de estado HTTP y una lista de reservaciones
                 (o un mensaje de error).
        :rtype: tuple[int, list]
        """
        conexion = conn or Conexion()
        date = datetime.fromisoformat(date)
        year, month, day = date.year, date.month, date.day
        
        try:
            # Calcula la semana del mes. (Días 1-7 -> Semana 1, 8-14 -> Semana 2, etc.)
            week_of_month = (day - 1) // 7 + 1

            reservations_result = read_reservations_with_date_filter(year, month, week_of_month, conexion)
            
            # Convierte los objetos a diccionarios para la respuesta JSON
            #reservations_dict = [res.to_dict() for res in reservations_result]
            print(reservations_result)
            
            return 200, reservations_result
        except Exception as e:
            print(f"❌ Error al leer las reservaciones por fecha: {e}")
            return 500, f"Error al leer las reservaciones: {e}"
        finally:
            if not conn:
                conexion.close_conexion()
                
# Para editar una reservacion nos llega la informacion de la reservacion en una diccionario, nos llegan estos campos

# diccionario= {
#     'DIM_StartDate': ,
#     'DIM_EndDate': ,
#     'DIM_NHours' ,
#     'DIM_TotalAmount': ,
#     'DIM_Notes': ,
#     'DIM_ReservationId': ,
#     'DIM_SecondPhoneNumber': 
# }


# se debe validar en primer lugar, si la nueva fecha de reservacion esta disponible, 
# tambien se tiene que actualizar el telefo del cliente, por lo que se tiene que hacer una peticion a dim_people y actualizar el telefono
# se debe de validar que los datos que se envien no esten vacios, para que la informacion sea segura.

    def update_reservation(self, _reservation: dict, conn: Conexion = None) -> tuple[str, int]:
        """
        Orquesta la actualización de una reserva existente.

        Flujo:
        1. Valida que los campos requeridos del frontend estén presentes.
        2. Obtiene los datos completos de la reserva existente desde la BD.
        3. Actualiza el número de teléfono secundario del cliente.
        4. Construye un objeto `Reservation` con los datos actualizados.
        5. Llama al servicio de reservas para validar la lógica de negocio (solapamiento) y persistir los cambios.
        """
        conexion = conn or Conexion()
        reserva_service = ReservaService(conexion)
        try:
            # 1. Validar campos de entrada del frontend
            required_fields = ['DIM_ReservationId', 'DIM_StartDate', 'DIM_EndDate', 'DIM_NHours', 'DIM_TotalAmount', 'DIM_Notes', 'DIM_SecondPhoneNumber']
            if not all(field in _reservation for field in required_fields):
                return 400, "Faltan campos requeridos para la actualización."

            reservation_id = _reservation['DIM_ReservationId']

            # 2. Obtener datos completos de la reserva existente
            existing_reservation_data = reserva_service.get_reservation_by_id(reservation_id)
            if not existing_reservation_data:
                return 404, f"No se encontró una reserva con el ID {reservation_id}"

            # 3. Actualizar el teléfono secundario de la persona
            people_id = existing_reservation_data['DIM_PeopleId']
            new_second_phone = _reservation['DIM_SecondPhoneNumber']
            
            if not people_services.update_second_phone(people_id, new_second_phone, conexion):
                # Podríamos decidir si fallar o solo advertir. Por ahora, fallamos.
                return 500, "Error al actualizar el número de teléfono secundario."

            # 4. Construir el objeto Reservation con datos actualizados y existentes
            dim_date_service = DIM_DATE(conexion) # Para obtener la fecha de modificación

            new_reservation = Reservation(
                DIM_ReservationId=reservation_id, # ID Original
                DIM_PeopleId=people_id, # Obtenido de la reserva existente
                DIM_StatusId=existing_reservation_data['DIM_StatusId'], # Obtenido de la reserva existente
                DIM_DateId=dim_date_service.dateId, # Fecha de la modificación
                DIM_ServiceOwnersId=existing_reservation_data['DIM_ServiceOwnersId'], # Obtenido de la reserva existente
                DIM_EventAddress=existing_reservation_data['DIM_EventAddress'], # Obtenido de la reserva existente
                DIM_StartDate=_reservation['DIM_StartDate'], # Dato nuevo del frontend
                DIM_EndDate=_reservation['DIM_EndDate'], # Dato nuevo del frontend
                DIM_NHours=_reservation['DIM_NHours'], # Dato nuevo del frontend
                DIM_TotalAmount=_reservation['DIM_TotalAmount'], # Dato nuevo del frontend
                DIM_Notes=_reservation['DIM_Notes'] # Dato nuevo del frontend
            )

            # 5. Validar y actualizar en la capa de servicio
            success, message = reserva_service.update_and_validate_reservation(new_reservation)
            if not success:
                return 400, message # Error de negocio (ej. solapamiento)
            
            conexion.save_changes()
            return 200, "Reserva actualizada exitosamente"

        except ValueError as ve:
            return 400, str(ve)
        except Exception as e:
            print(f"❌ Error al actualizar la reserva: {e}")
            conexion.conn.rollback()
            return  500, f"Error al actualizar la reserva: {e}"
        finally:
            if not conn:
                conexion.close_conexion()

# Para archivar una reservacion se obtendra el id en un diccionario en este formato

# diccionio = {
#     'DIM_ReservationId': "hassifdmuchas-letras"
# }

# se debe de comprobar que el estatus de la reservacion sea completo o cancelado
# ya que por razones de seguridad 