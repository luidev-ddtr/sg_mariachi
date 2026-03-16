from src.utils.conexion import Conexion
from src.dim_serviceowners.repositorio.validate_owners import validate_email, get_owner_by_username, validateowner
from src.dim_serviceowners.repositorio.insert_owners import insert_serviceowners
from src.dim_serviceowners.serviceowners_model import ServiceOwnerModel
from src.dim_serviceowners.repositorio.update_owner import update_owner_credentials
from src.utils.encryptPass import verify_password, hash_password

class ServiceownersService:
    """
    Docstring for Serviceowners
    Servicio proporcionado para aplicarlo a la lógica de negocio
    """
    def __init__(self, conn: Conexion):
        self.conn = conn

    def verify_credentials(self, username: str, password: str) -> dict | None:
        """
        Verifica las credenciales de un administrador de forma segura.
        1. Obtiene el usuario por su username.
        2. Compara el hash de la contraseña almacenada con la contraseña proporcionada.
        Retorna el diccionario del usuario si las credenciales son válidas, o None si no.
        """
        try:
            # 1. Obtener el usuario y su hash de la BD
            user_data = get_owner_by_username(username, self.conn)
            if not user_data:
                return None # Usuario no encontrado

            # 2. Extraer la contraseña hasheada y verificarla
            hashed_password_from_db = user_data.get('DIM_Password')

            # El hash en la BD puede ser bytes o una cadena, bcrypt necesita bytes.
            if isinstance(hashed_password_from_db, str):
                hashed_password_from_db = hashed_password_from_db.encode('utf-8')
            
            # Si no hay contraseña o es un buffer vacío, no se puede verificar.
            if not hashed_password_from_db:
                return None

            # 3. Usar bcrypt para la comparación segura
            if verify_password(password, hashed_password_from_db):
                # La contraseña es correcta. Por seguridad, eliminamos el hash
                # del diccionario que devolveremos.
                del user_data['DIM_Password']
                return user_data
            else:
                # La contraseña es incorrecta
                return None

        except Exception as e:
            print(f"❌ Error al verificar credenciales en el servicio: {e}")
            return None

    def verify_email(self, email: str) -> dict | None:
        """
        Verifica si existe un email en la tabla dim_people.
        Retorna el diccionario del usuario si existe, o None si no.
        """
        try:
            user_data = validate_email(email, self.conn)
            return user_data
        except Exception as e:
            print(f"❌ Error al verificar el email en el servicio: {e}")
            return None
        
    def verify_role(self, peopleId: str) -> dict | None:
        """
        Verifica si el usuario con el peopleId tiene el rol de administrador en la tabla dim_serviceowners.
        Retorna el diccionario del usuario si tiene el rol, o None si no.
        """
        try:
            user_data = validateowner(peopleId, self.conn)
            return user_data
        except Exception as e:
            print(f"❌ Error al verificar el rol en el servicio: {e}")
            return None

    def createOwner(self, newOwner: ServiceOwnerModel) -> tuple[bool, str]:
        try:
            # 1. Insertamos los datos del admin
            success = insert_serviceowners(newOwner, self.conn)
            return success, "Administrador registrado" if success else "Fallo en la inserción del repositorio"
        
        except ValueError as ve:
            return False, str(ve)

    def update_owner(self, employee_id: str, data_to_update: dict) -> tuple[bool, str]:
        """
        Actualiza las credenciales (username, password) de un administrador.
        La contraseña se hashea antes de guardarse.
        """
        try:
            # Si se está actualizando la contraseña, hay que hashearla.
            if 'DIM_Password' in data_to_update:
                new_password = data_to_update.get('DIM_Password')
                # Validar que la nueva contraseña no esté vacía
                if not new_password or not new_password.strip():
                    return False, "La nueva contraseña no puede estar vacía."
                data_to_update['DIM_Password'] = hash_password(new_password)

            # Llamar al repositorio para ejecutar la actualización
            success = update_owner_credentials(employee_id, data_to_update, self.conn)
            
            return success, "Credenciales actualizadas correctamente" if success else "Fallo en el repositorio al actualizar credenciales"

        except Exception as e:
            print(f"Error en servicio al actualizar owner: {e}")
            return False, f"Error en servicio: {str(e)}"
