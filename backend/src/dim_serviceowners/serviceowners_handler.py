from src.utils.conexion import Conexion
from .serviceowners_service import ServiceownersService

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