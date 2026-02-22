from src.utils.conexion import Conexion
from src.dim_serviceowners.repositorio.validate_owners import validate_serviceowners
from src.dim_serviceowners.serviceowners_model import ServiceOwnerModel

class ServiceownersService:
    """
    Docstring for Serviceowners
    Servicio proporcionado para aplicarlo a la lógica de negocio
    """
    def __init__(self, conn: Conexion):
        self.conn = conn

    def verify_credentials(self, username: str, password: str) -> dict | None:
        """
        Verifica si existe un usuario con el username y password proporcionados.
        Retorna el diccionario del usuario si existe, o None si no.
        """
        try:
            user_data = validate_serviceowners(username, self.conn, password)
            return user_data
        except Exception as e:
            print(f"❌ Error al verificar credenciales en el servicio: {e}")
            return None
