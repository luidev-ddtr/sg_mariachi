from typing import Dict, Any
class DIM_PEOPLE:
    """
    Funcion la cual modela toda la infromacion de la BD para poder 
    modelar a una persona.
    """
    def __init__(
        self, DIM_PeopleId: str, DIM_Name: str,
        DIM_SecondName: str, DIM_LastName: str,
        DIM_SecondLastName: str, DIM_Address: str,
        DIM_PhoneNumber: str, DIM_SecondPhoneNumber: str, 
        DIM_DateId: str ) -> None:
        """
        Constructor de la clase DIM_PEOPLE
        Inicaliza la clase con todos sun valores 
        No se agrega el timestamp puesto que este se genera automaticamente
        """
        self.DIM_PeopleId = DIM_PeopleId
        self.DIM_Name = DIM_Name
        self.DIM_SecondName = DIM_SecondName
        self.DIM_LastName = DIM_LastName
        self.DIM_SecondLastName = DIM_SecondLastName
        self.DIM_Address = DIM_Address
        self.DIM_PhoneNumber = DIM_PhoneNumber
        self.DIM_SecondPhoneNumber = DIM_SecondPhoneNumber
        self.DIM_DateId = DIM_DateId
        
    
    def __str__(self) -> str:
        return (f"PeopleID: {self.DIM_PeopleId} | "
                f"Name: {self.DIM_Name} | "
                f"SecondName: {self.DIM_SecondName} | "
                f"LastName: {self.DIM_LastName} | "
                f"SecondLastName: {self.DIM_SecondLastName} | "
                f"Address: {self.DIM_Address} | "
                f"PhoneNumber: {self.DIM_PhoneNumber} | "
                f"SecondPhoneNumber: {self.DIM_SecondPhoneNumber} | "
                f"DateId: {self.DIM_DateId}")
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "DIM_PeopleId": self.DIM_PeopleId,
            "DIM_Name": self.DIM_Name,
            "DIM_SecondName": self.DIM_SecondName,
            "DIM_LastName": self.DIM_LastName,
            "DIM_SecondLastName": self.DIM_SecondLastName,
            "DIM_Address": self.DIM_Address,
            "DIM_PhoneNumber": self.DIM_PhoneNumber,
            "DIM_SecondPhoneNumber": self.DIM_SecondPhoneNumber,
            "DIM_DateId": self.DIM_DateId
        }