from src.dim_employ.employ_model import EmployModel
from src.utils.conexion import Conexion
from src.dim_employ.repository.assing_position_employ import create_employ
from src.dim_employ.repository.get_employ import get_employ_by_id_repo
from src.dim_employ.repository.update_employ import update_employ_repo


class EmployService:
    """
    Servicio proporcionado para aplicarlo a la lógica de negocio relacionada con empleados.

    """

    # El constructor de la clase recibe una conexión a la base de datos, 
    # que se almacenará como un atributo del servicio para su uso en los métodos.
    def __init__(self, conn: Conexion):
        self.conn = conn

    def assing_position_employ(self, assing_position: EmployModel) -> tuple[bool, str]:
        """
        Persiste un nuevo empleado en la base de datos a través del repositorio.

        Args:
            assing_position (EmployModel): Objeto con los datos del empleado.

        Returns:
            tuple[bool, str]: (Éxito, Mensaje).
        """
        try:
            # 1.
            success = create_employ(assing_position, self.conn)
            return success, "Empleado registrado correctamente" if success else "Fallo en la inserción del repositorio"

        except Exception as e:
            print(f"Error al registrar el empleado: {e}")
            return False, f"Error en servicio: {str(e)}"
    
    def get_employ_by_id(self, employee_id: str) -> EmployModel | None:
        """
        Obtiene la información de un empleado por su ID.

        Args:
            employee_id (str): ID del empleado a buscar.

        Returns:
            EmployModel | None: Un objeto EmployModel con la información del empleado si se encuentra, o None si no se encuentra.
        """
        try:
            employee_data = get_employ_by_id_repo(employee_id, self.conn)
            if employee_data:
                # El repositorio devuelve un diccionario, lo convertimos a nuestro modelo
                return EmployModel(**employee_data)
            return None
        except Exception as e:
            print(f"Error crítico en EmployService.get_employ_by_id: {e}")
            return None

    def update_employee(self, employee_id: str, data_to_update: dict) -> tuple[bool, str]:
        """
        Actualiza los datos de un empleado (ej. su puesto).
        """
        try:
            # Aquí se podrían agregar validaciones de negocio,
            # por ejemplo, si el puesto existe en una lista de puestos válidos.
            if not data_to_update:
                return False, "No se proporcionaron datos para actualizar."

            success = update_employ_repo(employee_id, data_to_update, self.conn)
            return success, "Empleado actualizado correctamente" if success else "Fallo en el repositorio al actualizar empleado"
        except Exception as e:
            print(f"Error en servicio al actualizar empleado: {e}")
            return False, f"Error en servicio: {str(e)}"
