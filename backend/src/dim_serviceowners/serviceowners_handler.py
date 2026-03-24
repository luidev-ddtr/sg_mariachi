from src.utils.conexion import Conexion
from .serviceowners_service import ServiceownersService
from src.dim_serviceowners.serviceowners_model import ServiceOwnerModel
from .repositorio.insert_owners import upsert_google_user
from src.utils.id_generator import create_id_fact_reservation
from src.dim_employ.employ_service import EmployService
from src.dim_people.people_services import PeopleService
# ----------------------------------------------------
import urllib.request as request
import json                                                                                                                                                             

class ServiceownersHandler:
    """
    Manejador (Handler) para la gestión de administradores (ServiceOwners).
    Coordina la lógica de negocio, validaciones y llamadas a los servicios
    para autenticación, registro y gestión de usuarios.
    """
    def validation_login (self, _owner: dict, conn: Conexion = None) -> tuple:
        """
        Valida las credenciales de inicio de sesión de un administrador.
        
        :param _owner: Diccionario que contiene las credenciales ('username' y 'password').
        :param conn: (Opcional) Instancia de conexión a la base de datos.
        :return: Una tupla (código_http, mensaje, datos_usuario|None).
                 Retorna 200 si las credenciales son válidas, 401 si no lo son.
        """

        conexion = conn or Conexion()
        # Debemos instanciar la clase pasando la conexión
        serviceowner_service = ServiceownersService(conexion)

        try:
            # 1. Validar que los campos ingresados desde el login existan
            if 'username' not in _owner or 'password' not in _owner:
                return 400, "Faltan credenciales (username o password)", None
            
            username = _owner['username']
            password = _owner['password']

            # 2. Llamar al servicio para verificar en BD
            # El servicio 'verify_credentials' ahora contiene toda la lógica de
            # verificación segura: obtiene el usuario, extrae el hash y lo compara
            # usando bcrypt.
            user_data = serviceowner_service.verify_credentials(username, password)

            if user_data:
                # El servicio verifica la contraseña de forma segura.
                # Por seguridad, el servicio elimina la contraseña del diccionario.
                return 200, "Login exitoso", user_data
            else:
                # El servicio retornó None, lo que significa que el usuario no existe
                # o la contraseña es incorrecta.
                return 401, "Credenciales incorrectas", None

        except Exception as e:
            print(f"Error en el handler de login: {e}")
            return 500, f"Error interno del servidor: {e}", None
        finally:
            if not conn:
                conexion.close_conexion()
    
    def loginWithGoogle(self, _owner:dict, conn: Conexion = None) -> tuple:
        """
        Gestiona el inicio de sesión mediante Google OAuth.
        
        Verifica el token JWT proporcionado por Google, extrae el correo electrónico
        y valida que dicho correo exista en el sistema y pertenezca a un administrador activo.

        Flujo:
        1. Verifica la validez del token con la API de Google.
        2. Extrae el email y busca si existe en `dim_people`.
        3. Si existe, verifica si tiene rol de administrador en `dim_serviceowners`.
        4. Si es válido, actualiza/inserta los datos de auditoría de Google y permite el acceso.

        :param _owner: Diccionario que contiene el token de Google ({'token': '...'}).
        :param conn: (Opcional) Instancia de conexión a la base de datos.
        :return: Tupla (código_http, mensaje, datos_usuario|None).
        """

        # Usar una única conexión para todo el proceso y asegurar su cierre.
        conexion = conn or Conexion()
        try:
            # 1. Obtener el token enviado desde el frontend
            if 'token' not in _owner:
                return 400, "Falta el token de Google", None
            token = _owner['token']

            # 2. Verificar el token con Google de forma segura
            # NOTA: Para producción, se recomienda usar la librería `google-auth`
            # que verifica la firma del token, no solo su existencia.
            try:
                url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' + token
                with request.urlopen(url) as response:
                    if response.status != 200:
                        return 401, "Token de Google inválido o expirado", None
                    google_data = json.loads(response.read())
            except Exception as e:
                print(f" Error al verificar el token con Google: {e}")
                return 500, "Error al contactar los servicios de Google", None

            # 3. Obtener el email de la respuesta de Google
            email = google_data.get('email')
            if not email:
                return 400, "No se pudo obtener el email del token de Google", None

            # 4. Usar una sola instancia del servicio para todas las validaciones
            service = ServiceownersService(conexion)

            # 5. Primera validación: Verificar que el email exista en la tabla dim_people
            people_data = service.verify_email(email)
            if not people_data:
                return 401, "El correo electrónico no está registrado en el sistema.", None
            
            # 6. Segunda validación: Verificar que la persona tenga rol de administrador
            people_id = people_data.get('DIM_PeopleId')
            admin_data = service.verify_role(people_id)
            if not admin_data:
                return 403, "El usuario no tiene permisos de administrador.", None

            # 7. Auditoría: Guardar/Actualizar datos de Google si la validación fue exitosa.
            google_audit_data = {
                'google_id': google_data.get('sub'),  # 'sub' es el ID único de Google
                'name': google_data.get('name'),
                'email': email,
                'picture': google_data.get('picture'),
                'people_id': people_id
            }
            if not upsert_google_user(google_audit_data, conexion):
                # Si la auditoría falla, no detenemos el login, pero sí revertimos
                # para no dejar un registro a medias y lo notificamos en consola.
                print("ADVERTENCIA: El login fue exitoso pero falló el registro de auditoría de Google.")
                conexion.conn.rollback()
            else:
                # Si todo, incluida la auditoría, fue exitoso, guardamos los cambios.
                conexion.save_changes()

            # 8. Éxito
            return 200, "Login exitoso con Google", admin_data
        except Exception as e:
            print(f"Error en el handler de login con Google: {e}")
            conexion.conn.rollback()
            return 500, f"Error interno del servidor: {e}", None
        finally:
            # Asegurarse de que la conexión se cierre si se creó en este método
            if not conn:
                conexion.close_conexion()

    def insertNewServiceowners(self, _owner: dict, conn: Conexion = None) -> tuple:
        """
        Crea las credenciales de acceso (ServiceOwner) para un empleado existente.
        
        Nota: Este método es el paso final del registro de un administrador. Asume que
        la persona y el empleado (rol) ya han sido creados previamente.

        :param _owner: Diccionario con los datos: 'DIM_Username', 'DIM_Password' y 'DIM_EmployeeId'.
        :param conn: (Opcional) Instancia de conexión a la base de datos.
        :return: Tupla (código_http, mensaje, datos_creados|None).
        """

        conexion =  conn or Conexion()
        ServiceOwners = ServiceownersService(conexion)

        try:
            # 1. Validar que todos los campos necesarios estén presentes
            required_fields = ['DIM_Username', 'DIM_Password', 'DIM_EmployeeId']
            for field in required_fields:
                if field not in _owner:
                    return 400, f"Falta el campo requerido: {field}", []

            serviceOwner = ServiceOwnerModel (
                DIM_ServiceOwnersId= "",
                DIM_Username= _owner['DIM_Username'],
                DIM_Password= _owner['DIM_Password'],
                DIM_EmployeeId= _owner['DIM_EmployeeId']
            )

            serviceOwner_id = create_id_fact_reservation([_owner['DIM_Username'], _owner['DIM_Password'], _owner['DIM_EmployeeId']])
            serviceOwner.DIM_ServiceOwnersId = serviceOwner_id

             # 3. Usar el servicio para crear el ingreso facturado
            created, message = ServiceOwners.createOwner(serviceOwner)
            if not created:
                # Propagar el mensaje de error desde el servicio
                return 500, message or "Error al crear las credenciales", None

            # Construimos el diccionario manualmente para evitar errores si to_dict() falla
            return 201, "Credenciales creadas exitosamente", {
                "DIM_ServiceOwnersId": serviceOwner.DIM_ServiceOwnersId,
                "DIM_Username": serviceOwner.DIM_Username,
                "DIM_EmployeeId": serviceOwner.DIM_EmployeeId
            }
        except Exception as err:
            print(f"Error en insertNewServiceowners: {err}")
            return 500, f"Error interno del servidor: {str(err)}", None

    
    def updateServiceowners(self, update_data: dict, conn: Conexion = None) -> tuple:
        """
        Actualiza los datos de un administrador de forma transaccional,
        permitiendo modificar datos personales, rol y credenciales en una sola petición.

        :param update_data: Diccionario con la estructura:
                            {
                                "DIM_EmployeeId": "...",
                                "people_data": {...},
                                "employ_data": {...},
                                "serviceowner_data": {...}
                            }
        :param conn: (Opcional) Conexión a BD para mantener la atomicidad.
        :return: Tupla (código_http, mensaje, None).
        """
        conexion = conn or Conexion()
        
        # Instanciar todos los servicios necesarios con la conexión compartida
        owner_service = ServiceownersService(conexion)
        employ_service = EmployService(conexion)
        # NOTA: Se asume que PeopleService se ha modificado para aceptar 'conn'
        people_service = PeopleService(conexion) 

        try:
            # 1. Validar que el input tenga el ID del empleado
            employee_id = update_data.get('DIM_EmployeeId')
            if not employee_id:
                return 400, "Falta el campo 'DIM_EmployeeId' para identificar al administrador.", None

            # 2. Obtener IDs relacionados (PeopleId) a partir del EmployeeId
            employee_info = employ_service.get_employ_by_id(employee_id)
            if not employee_info:
                # FALLBACK INTELIGENTE:
                # Si no encontramos al empleado, es probable que el frontend haya enviado
                # el DIM_ServiceOwnersId (desde la sesión) en lugar del DIM_EmployeeId.
                # Intentamos buscar los detalles usando el ID como si fuera de ServiceOwner.
                admin_details = owner_service.get_admin_details(employee_id)
                
                if admin_details and admin_details.get('DIM_EmployeeId'):
                    # ¡Encontrado! Corregimos el ID para usar el de empleado real
                    employee_id = admin_details['DIM_EmployeeId']
                    employee_info = employ_service.get_employ_by_id(employee_id)
                
                # Si aún así no existe, entonces sí es un error 404 real
                if not employee_info:
                    return 404, f"No se encontró un empleado con el ID {employee_id}", None
            
            people_id = employee_info.DIM_PersonId

            # 3. Procesar actualizaciones para cada módulo si se proporcionan datos
            
            if 'people_data' in update_data:
                success, msg = people_service.update_person(people_id, update_data['people_data'])
                if not success:
                    raise Exception(f"Error al actualizar datos personales: {msg}")

            if 'employ_data' in update_data:
                success, msg = employ_service.update_employee(employee_id, update_data['employ_data'])
                if not success:
                    raise Exception(f"Error al actualizar el rol: {msg}")

            if 'serviceowner_data' in update_data:
                success, msg = owner_service.update_owner(employee_id, update_data['serviceowner_data'])
                if not success:
                    raise Exception(f"Error al actualizar las credenciales: {msg}")

            conexion.save_changes()
            return 200, "Administrador actualizado exitosamente.", None

        except Exception as e:
            print(f"Error al actualizar administrador: {e}")
            conexion.conn.rollback()
            return 500, f"Error interno del servidor: {str(e)}", None
        finally:
            if not conn:
                conexion.close_conexion()

    def get_all_admins(self, conn: Conexion = None) -> tuple:
        """
        Obtiene una lista de todos los administradores registrados en el sistema.
        
        :param conn: (Opcional) Instancia de conexión a la base de datos.
        :return: Tupla (código_http, mensaje, lista_de_admins).
        """
        conexion = conn or Conexion()
        service = ServiceownersService(conexion)
        try:
            admins_list = service.get_all_admins()
            return 200, "Administradores listados exitosamente.", admins_list
        except Exception as e:
            print(f"Error en handler al listar administradores: {e}")
            return 500, f"Error interno del servidor: {str(e)}", None
        finally:
            if not conn:
                conexion.close_conexion()

    def get_admin_details(self, employee_id: str, conn: Conexion = None) -> tuple:
        """
        Obtiene los detalles completos de un administrador específico por su ID de empleado.
        
        :param employee_id: ID del empleado (GUID) a consultar.
        :param conn: (Opcional) Instancia de conexión a la base de datos.
        :return: Tupla (código_http, mensaje, detalles_admin|None).
        """
        conexion = conn or Conexion()
        service = ServiceownersService(conexion)
        try:
            admin_details = service.get_admin_details(employee_id)
            if not admin_details:
                return 404, f"No se encontraron detalles para el administrador con ID {employee_id}", None
            
            return 200, "Perfil obtenido exitosamente.", admin_details
        except Exception as e:
            print(f"Error en handler al obtener detalles de admin: {e}")
            return 500, f"Error interno del servidor: {str(e)}", None
        finally:
            if not conn:
                conexion.close_conexion()

    def delete_admin(self, employee_id: str, conn: Conexion = None) -> tuple:
        """
        Ejecuta la eliminación lógica o física de un administrador de forma transaccional.
        Elimina las credenciales y el registro de empleado.
        
        :param employee_id: ID del empleado a eliminar.
        :param conn: (Opcional) Instancia de conexión a la base de datos.
        :return: Tupla (código_http, mensaje, None).
        """
        conexion = conn or Conexion()
        service = ServiceownersService(conexion)
        try:
            success, message = service.delete_admin(employee_id)
            if not success:
                # Si el servicio falla, no hay cambios que guardar, pero hacemos rollback por si acaso.
                conexion.conn.rollback()
                # El servicio puede devolver 404 implícito, lo mapeamos aquí.
                if "No se encontró" in message:
                    return 404, message, None
                return 500, message, None
            
            # Si el servicio tuvo éxito, confirmamos la transacción.
            conexion.save_changes()
            return 200, message, None
        except Exception as e:
            print(f"Error en handler al eliminar administrador: {e}")
            conexion.conn.rollback()
            return 500, f"Error interno del servidor: {str(e)}", None
        finally:
            if not conn:
                conexion.close_conexion()