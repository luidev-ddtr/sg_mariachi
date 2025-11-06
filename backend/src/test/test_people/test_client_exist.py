from src.dim_people.repository.validations import get_id_if_person_exists
from src.utils.conexion import Conexion

from src.dim_people.people_services import PeopleService

service = PeopleService()
conexion = Conexion()


def test_get_id_if_person_exists_test() -> None:
    """
    TEST  para comprobar si la funcion que busca clientes existententes 
    funciona, ya se probo para todos los casos y es completmaente funcional
    """
    datos = [
        'Angel_45397',        # DIM_Name
        'perez',              # DIM_SecondName
        'garcia',             # DIM_LastName
        'Cruz',               # DIM_SecondLastName
        '123 Main St',        # DIM_Address
        '123456789',          # DIM_PhoneNumber
        '123456789'           # DIM_SecondPhoneNumber
    ]
    id = get_id_if_person_exists(*datos, conexion)
    print("ESTE ES EL RESULTADO 2")
    print(id)
    print("\n\n\n")
    assert len(id) == 18
#Angel_45397


def test_service_people_exist() -> None:
    """
    test de la api publica
    """
    diccionario_persona = {
        "DIM_Name": "Angel_45397",
        "DIM_SecondName": "perez",
        "DIM_LastName": "garcia",
        "DIM_SecondLastName": "Cruz",
        "DIM_Address": "123 Main St",
        "DIM_Phone": "123456789",
        "DIM_SecondPhone": "123456789"
    }
    
    code, message, data = service.is_person_exist(diccionario_persona, conexion)
    print("ESTE ES EL RESULTADO 2")
    print(code)
    print(message)
    print(data)
    
    assert code == 200
    assert message == "Persona encontrada"
    assert len(data) == 18