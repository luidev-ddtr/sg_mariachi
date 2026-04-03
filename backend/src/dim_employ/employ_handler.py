from src.dim_employ.employ_service import EmployService
from src.dim_employ.employ_model import EmployModel
from src.utils.id_generator import create_id_fact_reservation
from src.dim_dates.dim_date import DIM_DATE
from src.utils.conexion import Conexion
from datetime import datetime

class EmployHandler:
    """
    Handler proporcionado para manejar las solicitudes relacionadas con empleados.
    """
    # El constructor del handler recibe una instancia del servicio de empleados, 
    # que se almacenará como un atributo para su uso en los métodos del handler.
    def __init__(self, service: EmployService):
        self.service = service

    def assing_position_employ(self, _employee: dict, conn: Conexion = None) -> tuple:
        """
        Asigna un puesto a un empleado específico.

        Args:
            _employee (dict): Diccionario con datos del empleado (PersonId, Position, DateString).
            conn (Conexion): Objeto de conexión opcional para transacciones compartidas.

        Returns:
            tuple: (Código HTTP, Mensaje, Datos del empleado creado).
        """

        # Usamos la conexión recibida (para transacción global) o creamos una nueva
        conexion = conn or Conexion()
        
        # Actualizamos la conexión del servicio para asegurar consistencia
        self.service.conn = conexion
        dim_date = DIM_DATE(conexion)

        # _employee['DIM_DateId'] viene como string de fecha "YYYY-MM-DD" desde el front
        # O usamos la fecha actual si no viene
        date_str = _employee.get('DIM_DateId', datetime.now().isoformat())
        employ_date = datetime.fromisoformat(date_str)

        dim_dateId = dim_date.get_id_by_object_date(employ_date.year, employ_date.month, employ_date.day)

        try:
            # 1. Validar que los campos necesarios estén presentes (EmployeeId NO se pide, se genera)
            required_fields = ['DIM_PersonId', 'DIM_Position']
            for field in required_fields:
                if field not in _employee:
                    return 400, f"Falta el campo requerido: {field}", []
            
            # Generar ID único para el empleado
            employId = create_id_fact_reservation([_employee['DIM_PersonId'], _employee['DIM_Position'], str(dim_dateId)])

            employ = EmployModel (
                DIM_EmployeeId = employId,
                DIM_PersonId = _employee['DIM_PersonId'],
                DIM_Position = _employee['DIM_Position'],
                DIM_DateId = dim_dateId
            )

            # 2. Llamada correcta a la instancia del servicio (self.service), no a la clase estática
            created, message = self.service.assing_position_employ(employ)
            
            if not created:
                return 500, message or "Error al registrar el empleado", []

            return 201, "Empleado registrado", employ.to_dict()
        except Exception as err:
            print(f"Error al intentar registrar el empleado: {err}")
            return 500, f"Error interno del servidor: {str(err)}", []
        finally:
            # Solo cerramos la conexión si fue creada dentro de este método (no si vino de fuera)
            if not conn:
                conexion.close_conexion()