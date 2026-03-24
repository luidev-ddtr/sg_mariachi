from src.utils.conexion import Conexion

def get_all_admins_repo(conn: Conexion) -> list[dict]:
    """
    Obtiene una lista de todos los administradores uniendo las tablas
    serviceowners, employe y people.
    """
    query = """
        SELECT
            so.DIM_ServiceOwnersId,
            so.DIM_EmployeeId,
            so.DIM_Username,
            dp.DIM_Name,
            dp.DIM_SecondName,
            dp.DIM_LastName,
            dp.DIM_SecondLastName,
            dp.DIM_Email,
            dp.DIM_PhoneNumber,
            dp.DIM_SecondPhoneNumber,
            dp.DIM_Address,
            de.DIM_Position,
            so.DIM_Timestamp
        FROM dim_serviceowners so
        JOIN dim_employe de ON so.DIM_EmployeeId = de.DIM_EmployeeId
        JOIN dim_people dp ON de.DIM_PersonId = dp.DIM_PeopleId;
    """
    try:
        conn.cursor.execute(query)
        admins = conn.cursor.fetchall()
        return admins if admins else []
    except Exception as e:
        print(f"Error en repositorio al listar administradores: {e}")
        return []

def get_admin_by_id_repo(employee_id: str, conn: Conexion) -> dict | None:
    """
    Obtiene los detalles completos de un administrador por su EmployeeId.
    """
    query = """
        SELECT
            so.DIM_ServiceOwnersId,
            so.DIM_EmployeeId,
            so.DIM_Username,
            dp.DIM_Name,
            dp.DIM_SecondName,
            dp.DIM_LastName,
            dp.DIM_SecondLastName,
            dp.DIM_Email,
            dp.DIM_PhoneNumber,
            dp.DIM_SecondPhoneNumber,
            dp.DIM_Address,
            de.DIM_Position
        FROM dim_serviceowners so
        JOIN dim_employe de ON so.DIM_EmployeeId = de.DIM_EmployeeId
        JOIN dim_people dp ON de.DIM_PersonId = dp.DIM_PeopleId
        WHERE so.DIM_ServiceOwnersId = %s;
    """
    try:
        conn.cursor.execute(query, (employee_id,))
        admin = conn.cursor.fetchone()
        return admin
    except Exception as e:
        print(f"Error en repositorio al obtener detalle de administrador: {e}")
        return None
