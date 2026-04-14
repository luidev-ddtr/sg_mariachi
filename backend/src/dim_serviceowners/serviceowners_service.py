from src.utils.conexion import Conexion
from src.dim_serviceowners.repositorio.validate_owners import validate_email, get_owner_by_username, validateowner
from src.dim_serviceowners.repositorio.insert_owners import insert_serviceowners
from src.dim_serviceowners.serviceowners_model import ServiceOwnerModel
from src.dim_serviceowners.repositorio.update_owner import update_owner_credentials
from src.dim_serviceowners.repositorio.get_admins import get_all_admins_repo, get_admin_by_id_repo
from src.dim_serviceowners.repositorio.delete_owner import delete_owner_repo
from src.dim_employ.repository.delete_employ import delete_employ_repo
from src.utils.encryptPass import verify_password, hash_password

class ServiceownersService:
    """
    Servicio de negocio para la gestión de propietarios/administradores (ServiceOwners).
    Encapsula la lógica de verificación de credenciales, roles y operaciones CRUD
    para la tabla de administradores.
    """
    def __init__(self, conn: Conexion):
        """
        Inicializa el servicio con una conexión a la base de datos.
        
        :param conn: Instancia de la conexión a la base de datos.
        """
        self.conn = conn

    def verify_credentials(self, username: str, password: str) -> dict | None:
        """
        Verifica las credenciales de un administrador de forma segura.
        
        1. Obtiene el usuario por su username.
        2. Compara el hash de la contraseña almacenada con la contraseña proporcionada.
        
        :param username: Nombre de usuario del administrador.
        :param password: Contraseña en texto plano a verificar.
        :return: Diccionario con los datos del usuario si las credenciales son válidas, None en caso contrario.
        """
        try:
            # 1. Obtener el usuario y su hash de la BD
            user_data = get_owner_by_username(username, self.conn)
            if not user_data:
                return None # Usuario no encontrado

            # 2. Extraer la contraseña hasheada y verificarla
            hashed_password_from_db = user_data.get('DIM_Password')

            # El hash en la BD puede ser bytes o una cadena
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
            print(f"Error al verificar credenciales en el servicio: {e}")
            return None

    def verify_email(self, email: str) -> dict | None:
        """
        Verifica si existe un email registrado en la tabla de personas (dim_people).
        
        :param email: Correo electrónico a verificar.
        :return: Diccionario con los datos de la persona si existe, None en caso contrario.
        """
        try:
            user_data = validate_email(email, self.conn)
            return user_data
        except Exception as e:
            print(f"Error al verificar el email en el servicio: {e}")
            return None
        
    def verify_role(self, peopleId: str) -> dict | None:
        """
        Verifica si el usuario identificado por peopleId tiene el rol de administrador 
        (existe en la tabla dim_serviceowners).
        
        :param peopleId: ID de la persona a verificar.
        :return: Diccionario con los datos del administrador si tiene el rol, None en caso contrario.
        """
        try:
            user_data = validateowner(peopleId, self.conn)
            return user_data
        except Exception as e:
            print(f"Error al verificar el rol en el servicio: {e}")
            return None

    def createOwner(self, newOwner: ServiceOwnerModel) -> tuple[bool, str]:
        """
        Registra un nuevo administrador en el sistema.
        
        :param newOwner: Instancia del modelo ServiceOwnerModel con los datos del nuevo administrador.
        :return: Tupla (éxito, mensaje) indicando el resultado de la operación.
        """
        try:
            # Hashear la contraseña antes de insertar para garantizar seguridad en la capa de negocio
            if newOwner.DIM_Password:
                newOwner.DIM_Password = hash_password(newOwner.DIM_Password)

            # 1. Insertamos los datos del admin
            success = insert_serviceowners(newOwner, self.conn)
            return success, "Administrador registrado" if success else "Fallo en la inserción del repositorio"
        
        except ValueError as ve:
            return False, str(ve)

    def update_owner(self, employee_id: str, data_to_update: dict) -> tuple[bool, str]:
        """
        Actualiza las credenciales (username, password) de un administrador.
        La contraseña se hashea automáticamente si está presente en los datos.
        
        :param employee_id: ID del empleado (administrador) a actualizar.
        :param data_to_update: Diccionario con los campos a actualizar (ej. {'DIM_Password': '...', 'DIM_Username': '...'}).
        :return: Tupla (éxito, mensaje) indicando el resultado de la operación.
        """
        try:
            # Mapeo de posibles nombres de campo para la contraseña que envía el frontend
            pass_keys = ['DIM_Password', 'cp_nueva', 'password']
            found_key = next((k for k in pass_keys if k in data_to_update), None)

            if found_key:
                new_password = data_to_update.get(found_key)
                # Validar que la nueva contraseña no esté vacía
                if not new_password or not new_password.strip():
                    return False, "La nueva contraseña no puede estar vacía."
                
                # Hasheamos la contraseña y normalizamos el nombre de la llave para el repositorio
                data_to_update['DIM_Password'] = hash_password(new_password)
                
                # Limpieza: si la llave era diferente (ej. 'cp_nueva'), la quitamos para no ensuciar el query
                if found_key != 'DIM_Password':
                    del data_to_update[found_key]

            # Si no hay nada que actualizar en esta tabla, evitamos llamar al repositorio
            if not data_to_update:
                return True, "No se detectaron cambios en las credenciales."

            # Llamar al repositorio para ejecutar la actualización
            success = update_owner_credentials(employee_id, data_to_update, self.conn)
            
            return success, "Credenciales actualizadas correctamente" if success else "Fallo en el repositorio al actualizar credenciales"

        except Exception as e:
            print(f"Error en servicio al actualizar owner: {e}")
            return False, f"Error en servicio: {str(e)}"

    def change_password(self, employee_id: str, old_password: str, new_password: str) -> tuple[bool, str]:
        """
        Lógica de negocio para cambiar la contraseña con validación previa.
        """
        try:
            # 1. Obtener el hash actual de la base de datos para este ID
            # Usamos una consulta directa para asegurar que obtenemos el campo DIM_Password
            query = "SELECT DIM_Password FROM dim_serviceowners WHERE DIM_EmployeeId = %s"
            self.conn.cursor.execute(query, (employee_id,))
            result = self.conn.cursor.fetchone()

            if not result:
                return False, "Administrador no encontrado."

            current_hash = result.get('DIM_Password')
            if not current_hash:
                return False, "No se encontró una contraseña registrada para este usuario."

            # Asegurar que el hash esté en formato bytes para bcrypt
            if isinstance(current_hash, str):
                current_hash = current_hash.encode('utf-8')

            # 2. Verificar que la contraseña 'actual' coincida
            if not verify_password(old_password, current_hash):
                return False, "La contraseña actual es incorrecta."

            # 3. Hashear la nueva contraseña
            hashed_new = hash_password(new_password)

            # 4. Actualizar en el repositorio
            success = update_owner_credentials(employee_id, {'DIM_Password': hashed_new}, self.conn)
            
            return success, "Contraseña actualizada" if success else "Error al guardar en base de datos"

        except Exception as e:
            print(f"Error en servicio change_password: {e}")
            return False, f"Error interno: {str(e)}"

    def get_all_admins(self) -> list[dict]:
        """
        Obtiene una lista de todos los administradores con datos básicos.
        
        :return: Lista de diccionarios con la información de los administradores.
        """
        try:
            return get_all_admins_repo(self.conn)
        except Exception as e:
            print(f"Error en servicio al listar administradores: {e}")
            return []

    def get_admin_details(self, employee_id: str) -> dict | None:
        """
        Obtiene los detalles completos de un administrador por su ID de empleado.
        
        :param employee_id: ID del empleado a consultar.
        :return: Diccionario con los detalles del administrador o None si no se encuentra.
        """
        try:
            return get_admin_by_id_repo(employee_id, self.conn)
        except Exception as e:
            print(f"Error en servicio al obtener detalles de admin: {e}")
            return None

    def delete_admin(self, employee_id: str) -> tuple[bool, str]:
        """
        Elimina un administrador de forma transaccional, borrando sus credenciales
        y su rol de empleado.
        
        Nota: No elimina el registro base de la persona en dim_people.
        
        :param employee_id: ID del empleado a eliminar.
        :return: Tupla (éxito, mensaje) indicando el resultado de la operación.
        """
        try:
            # La transacción se maneja en el handler, aquí solo ejecutamos las operaciones.
            # El orden es importante por las claves foráneas.
            # 1. Eliminar de serviceowners (tabla hija)
            owner_deleted = delete_owner_repo(employee_id, self.conn)
            if not owner_deleted:
                # Puede que no existiera en serviceowners pero sí como empleado,
                # lo cual es un estado inconsistente, pero permitimos la continuación.
                print(f"Advertencia: No se encontró registro en dim_serviceowners para EmployeeId {employee_id}")

            # 2. Eliminar de employ (tabla padre respecto a serviceowners)
            employ_deleted = delete_employ_repo(employee_id, self.conn)
            if not employ_deleted:
                return False, f"No se encontró un registro de empleado para el ID {employee_id}."

            return True, "Administrador eliminado correctamente."
        except Exception as e:
            print(f"Error en servicio al eliminar administrador: {e}")
            return False, f"Error en servicio: {str(e)}"
