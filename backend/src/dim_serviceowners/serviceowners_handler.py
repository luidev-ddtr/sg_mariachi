from src.utils.conexion import Conexion
from .serviceowners_service import ServiceownersService
from src.dim_serviceowners.serviceowners_model import ServiceOwnerModel
from .repositorio.insert_owners import upsert_google_user
from src.utils.id_generator import create_id_fact_reservation
from src.utils.encryptPass import hash_password, verify_password
# --- Imports para la funcionalidad de actualización ---
from src.dim_employ.employ_service import EmployService
from src.dim_people.people_services import PeopleService
# ----------------------------------------------------
import urllib.request as request
import json                                                                                                                                                             

class ServiceownersHandler:
    """
    Docstring for ServiceownersHandler
    Aqui se crea la lógica de negocio para validaciones
    entre otra cosas

    """
    def validation_login (self, _owner: dict, conn: Conexion = None) -> tuple:
        """
        Docstring for validation_login
        
        :param self: Description
        :param _owner: Description
        :type _owner: dict
        :param conn: Description
        :type conn: Conexion
        :return: Description
        :rtype: tuple
        """

        conexion = conn or Conexion()
        # IMPORTANTE: Debemos instanciar la clase pasando la conexión
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
                # ¡Éxito! El servicio ya verificó la contraseña de forma segura.
                # Por seguridad, el servicio ya ha eliminado la contraseña del diccionario.
                return 200, "Login exitoso", user_data
            else:
                # El servicio retornó None, lo que significa que el usuario no existe
                # o la contraseña es incorrecta.
                return 401, "Credenciales incorrectas", None

        except Exception as e:
            print(f"❌ Error en el handler de login: {e}")
            return 500, f"Error interno del servidor: {e}", None
        finally:
            if not conn:
                conexion.close_conexion()
    
    def loginWithGoogle(self, _owner:dict, conn: Conexion = None) -> tuple:
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
                print(f"❌ Error al verificar el token con Google: {e}")
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
                print("⚠️ ADVERTENCIA: El login fue exitoso pero falló el registro de auditoría de Google.")
                conexion.conn.rollback()
            else:
                # Si todo, incluida la auditoría, fue exitoso, guardamos los cambios.
                conexion.save_changes()

            # 8. Éxito
            return 200, "Login exitoso con Google", admin_data
        except Exception as e:
            print(f"❌ Error en el handler de login con Google: {e}")
            conexion.conn.rollback()
            return 500, f"Error interno del servidor: {e}", None
        finally:
            # Asegurarse de que la conexión se cierre si se creó en este método
            if not conn:
                conexion.close_conexion()

    def insertNewServiceowners(self, _owner: dict, conn: Conexion = None) -> tuple:

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
                DIM_Password= "",
                DIM_EmployeeId= _owner['DIM_EmployeeId']
            )

            serviceOwner_id = create_id_fact_reservation([_owner['DIM_Username'], _owner['DIM_Password'], _owner['DIM_EmployeeId']])
            serviceOwner.DIM_ServiceOwnersId = serviceOwner_id

            # Hashear la contraseña usando la función segura de bcrypt
            hashed_pwd = hash_password(_owner['DIM_Password'])
            serviceOwner.DIM_Password = hashed_pwd

             # 3. Usar el servicio para crear el ingreso facturado
            created, message = ServiceOwners.createOwner(serviceOwner)
            if not created:
                # Propagar el mensaje de error desde el servicio
                return 500, message or "Error al crear las credenciales", None

            return 201, "Credenciales creadas exitosamente", serviceOwner.to_dict()
        except Exception as err:
            print(f"❌ Error en insertNewServiceowners: {err}")
            return 500, f"Error interno del servidor: {str(err)}", None

    
    def updateServiceowners(self, update_data: dict, conn: Conexion = None) -> tuple:
        """
        Actualiza los datos de un administrador de forma transaccional,
        abarcando datos personales (dim_people), rol (dim_employ) y
        credenciales (dim_serviceowners).

        Args:
            update_data (dict): Diccionario con los datos a actualizar. Debe contener
                                'DIM_EmployeeId' para identificar al usuario y luego
                                las claves correspondientes a los datos que se desean
                                cambiar.
                                Ejemplo:
                                {
                                    "DIM_EmployeeId": "some-uuid",
                                    "people_data": { "DIM_PhoneNumber": "1234567890" },
                                    "employ_data": { "DIM_Position": "Super Admin" },
                                    "serviceowner_data": { "DIM_Password": "new_secure_password" }
                                }
            conn (Conexion, optional): Conexión a la base de datos para transacciones.

        Returns:
            tuple: (status_code, message, data)
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
            print(f"❌ Error al actualizar administrador: {e}")
            conexion.conn.rollback()
            return 500, f"Error interno del servidor: {str(e)}", None
        finally:
            if not conn:
                conexion.close_conexion()