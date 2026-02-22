class ServiceOwnerModel:
    """
      Modelo para representar a un administrador del sistema
    """

    def __init__ (self, DIM_ServiceOwnersId: str, DIM_Username: str, DIM_Password: str, DIM_EmployeeId: str) -> None:
        """
        Constructor de la clase ServiceOwnerModel

        Args:
            DIM_ServiceOwnersId (str): ID único del administrador del sistema.
            DIM_Username (str): Nombre de usuario del administrador.
            DIM_Password (str): Contraseña del administrador.
            DIM_EmployeeId (str): ID del empleado asociado al administrador.
        """
        self.DIM_ServiceOwnersId = DIM_ServiceOwnersId
        self.DIM_Username = DIM_Username
        self.DIM_Password = DIM_Password
        self.DIM_EmployeeId = DIM_EmployeeId

    def to_dict(self) -> dict:
        """
        Convierte el objeto ServiceOwnerModel en un diccionario.

        Returns:
            dict: Diccionario con los atributos del objeto.
        """
        return{
            "DIM_ServiceOwnersId": self.DIM_ServiceOwnersId,
            "DIM_Username": self.DIM_Username,
            "DIM_Password": self.DIM_Password,
            "DIM_EmployeeId": self.DIM_EmployeeId
        }
    
    def __str__(self):
        """
        Representación en cadena para debugging.
        """
        return (f"ServiceOwnerID: {self.DIM_ServiceOwnersId} | "
                f"Username: {self.DIM_Username} | "
                f"Password: {self.DIM_Password} | "
                f"EmployeeID: {self.DIM_EmployeessId}")
    