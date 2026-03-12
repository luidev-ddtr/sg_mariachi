import pytest
from src.dim_serviceowners.serviceowners_handler import ServiceownersHandler

@pytest.fixture
def sample_owner_data():
    """
    Genera datos de prueba para un nuevo administrador.
    """
    import random
    # Usamos un número aleatorio para asegurar que el username sea único en cada ejecución,
    # evitando conflictos de BD si la prueba se corre múltiples veces.
    user_id = random.randint(1000, 9999)
    return {
        "DIM_Username": f"test_user_{user_id}",
        "DIM_Password": "password123",
        "DIM_EmployeeId": "1234"
    }

def test_insert_owner_success(sample_owner_data):
    """
    Prueba de integración para insertar un administrador exitosamente.
    Esta prueba se conecta a la BD real y realiza una inserción.
    """
    service = ServiceownersHandler()
    status, msg, data = service.insertNewServiceowners(sample_owner_data)
    print(f"El estado es [{status}] y el mensaje es [{msg}]")
    assert status == 201
    assert "Credenciales creadas exitosamente" in msg
    print("Test éxito: Credenciales creadas sin errores")