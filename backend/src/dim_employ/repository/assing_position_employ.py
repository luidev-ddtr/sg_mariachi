from src.utils.conexion import Conexion
from src.dim_employ.employ_model import EmployModel
import uuid

def create_employ(employee_data: EmployModel, object_conn: Conexion) -> bool:
    """
    Crea un nuevo empleado en la base de datos.

    :param cursor: Objeto de conexión a la base de datos.
    :param employee_data: Objeto EmployModel con los datos del nuevo empleado.
    :return: True si la creación fue exitosa, False en caso contrario.
    """
    query = """
        INSERT INTO dim_employe (DIM_EmployeeId, DIM_PersonId, DIM_Position, DIM_DateId)
        VALUES (%s, %s, %s, %s)
    """
    try:
        values = (
            employee_data.DIM_EmployeeId,
            employee_data.DIM_PersonId,
            employee_data.DIM_Position,
            employee_data.DIM_DateId
        )

        object_conn.cursor.execute(query, values)

        object_conn.save_changes()
        return True
    
    except Exception as err:
        print(f'Erro al registrar al nuevo empleado: {err}')
        object_conn.conn.rollback()
        return False

