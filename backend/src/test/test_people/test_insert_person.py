import random
from src.dim_people.people_service import PeopleService

def test_insert_person():
    people_options = PeopleService()
    # Add a random number to the name to ensure uniqueness
    random_int = random.randint(1, 100000)
    name = f"Angel_{random_int}"
    
    message, status = people_options.create_people({
        "DIM_Name": name,
        "DIM_SecondName": "perez",
        "DIM_LastName": "Garcia",
        "DIM_SecondLastName": "Cruz",
        "DIM_PhoneNumber": "123456789",
        "DIM_SecondPhoneNumber": "123456789",
        "DIM_Address": "123 Main St"
    })
    assert message == "Persona creada exitosamente"