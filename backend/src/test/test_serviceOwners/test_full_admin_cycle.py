import pytest
import random
import string
from src.dim_people.people_handler import PeopleHandler
from src.dim_employ.employ_handler import EmployHandler
from src.dim_employ.employ_service import EmployService
from src.dim_serviceowners.serviceowners_handler import ServiceownersHandler

# --- Utilidades para generar datos aleatorios y evitar colisiones ---
def random_str(length=6):
    return ''.join(random.choices(string.ascii_letters, k=length))

def random_digits(length=10):
    return ''.join(random.choices(string.digits, k=length))

def test_full_admin_creation_and_update_flow():
    """
    Test de integración que verifica el ciclo completo de vida de un Administrador:
    1. Crear Persona (dim_people)
    2. Asignar Rol (dim_employ)
    3. Crear Credenciales (dim_serviceowners)
    4. Actualizar información (Update transaccional)
    5. Validar Login
    """
    print("\nINICIANDO TEST DE INTEGRACIÓN: FLUJO ADMINISTRADOR")

    # --- 1. Crear Persona ---
    people_handler = PeopleHandler()
    
    # Datos de persona (incluyendo campos que el Modelo requiere)
    person_payload = {
        "DIM_Name": f"TestUser_{random_str()}",
        "DIM_SecondName": "",
        "DIM_LastName": f"TestLast_{random_str()}",
        "DIM_SecondLastName": "",
        "DIM_Address": "Calle Prueba 123",
        "DIM_PhoneNumber": random_digits(),
        "DIM_SecondPhoneNumber": "",
        "DIM_Email": f"test_{random_str()}@mail.com" # Requerido por el modelo DIM_PEOPLE
    }

    print(f"1. Creando persona: {person_payload['DIM_Name']}")
    msg, status, people_id = people_handler.create_people(person_payload)
    
    assert status == 201, f"Fallo al crear persona: {msg}"
    assert people_id, "No se generó PeopleId"
    print(f"   -> Persona creada OK. ID: {people_id}")

    # --- 2. Asignar Rol de Empleado ---
    # Inicializamos servicio (conn=None es ok, el handler gestiona la conexión)
    employ_service = EmployService(None)
    employ_handler = EmployHandler(employ_service)
    
    employ_payload = {
        "DIM_PersonId": people_id,
        "DIM_Position": "Administrador de Prueba",
        # DIM_DateId es opcional, el handler usa la fecha actual
    }

    print("2. Asignando rol de empleado...")
    status, msg, employ_result = employ_handler.assing_position_employ(employ_payload)
    
    assert status == 201, f"Fallo al asignar rol: {msg}"
    # employ_result es un dict con los datos del modelo
    employee_id = employ_result.get('DIM_EmployeeId')
    assert employee_id, "No se generó EmployeeId"
    print(f"   -> Rol asignado OK. EmployeeId: {employee_id}")

    # --- 3. Crear Credenciales ---
    admin_handler = ServiceownersHandler()
    
    username = f"user_{random_str()}"
    password = "Password123!"
    
    creds_payload = {
        "DIM_EmployeeId": employee_id,
        "DIM_Username": username,
        "DIM_Password": password
    }

    print(f"3. Creando credenciales para usuario: {username}")
    status, msg, creds_result = admin_handler.insertNewServiceowners(creds_payload)
    
    assert status == 201, f"Fallo al crear credenciales: {msg}"
    print("   -> Credenciales creadas OK.")

    # --- 4. Actualizar Admin (Transacción completa) ---
    print("4. Probando actualización integral (Update)...")
    
    new_phone = random_digits()
    new_position = "Super Admin Actualizado"
    new_password = "NewPassword_999"
    
    update_payload = {
        "DIM_EmployeeId": employee_id,
        "people_data": {
            "DIM_PhoneNumber": new_phone
        },
        "employ_data": {
            "DIM_Position": new_position
        },
        "serviceowner_data": {
            "DIM_Password": new_password
        }
    }
    
    status, msg, _ = admin_handler.updateServiceowners(update_payload)
    assert status == 200, f"Fallo en updateServiceowners: {msg}"
    print("   -> Actualización reportada como exitosa.")

    # --- 5. Validar Login con nuevos datos ---
    print("5. Verificando login con la NUEVA contraseña...")
    
    login_payload = {
        "username": username,
        "password": new_password
    }
    
    status, msg, user_data = admin_handler.validation_login(login_payload)
    
    assert status == 200, f"Login falló con nueva contraseña: {msg}"
    assert user_data is not None
    print("   -> Login exitoso. Flujo verificado correctamente.")

if __name__ == "__main__":
    # Permite ejecutar el test directamente con python
    test_full_admin_creation_and_update_flow()