from src.utils.conexion import Conexion
from .serviceowners_service import ServiceownersService
from .repositorio.insert_owners import upsert_google_user
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
            user_data = serviceowner_service.verify_credentials(username, password)

            if user_data:
                return 200, "Login exitoso", user_data
            else:
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
