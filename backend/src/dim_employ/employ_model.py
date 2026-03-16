class EmployModel:
    """
      Modelo para representar a un empleado del sistema
    """
    # Primero debemos definir el constructor de la clase, que es el método __init__. Este método se llama 
    # automáticamente cuando se crea una nueva instancia de la clase. En este caso, el constructor recibe 
    # cuatro parámetros: DIM_EmployeeId, DIM_PersonId, DIM_Position y DIM_DateId. Estos parámetros representan 
    # los atributos del empleado que queremos almacenar en nuestro modelo.
    def __init__(self, DIM_EmployeeId: str, DIM_PersonId: str, DIM_Position: str, DIM_DateId: str) -> None:
        """
        Constructor de la clase EmployModel

        Args:
            DIM_EmployeeId (str): ID único del empleado.
            DIM_PersonId (str): ID de la persona asociada al empleado.
            DIM_Position (str): Puesto o cargo del empleado.
            DIM_DateId (str): ID de la fecha de contratación del empleado.
        """
        # Se asignan los valores a los atributos del objeto (self representa la instancia actual de la clase)
        self.DIM_EmployeeId = DIM_EmployeeId
        self.DIM_PersonId = DIM_PersonId
        self.DIM_Position = DIM_Position
        self.DIM_DateId = DIM_DateId
    
    # Ahora definimos un método llamado to_dict, que convierte el objeto 
    # EmployModel en un diccionario. Esto es útil para facilitar la manipulación de 
    # los datos y su almacenamiento en formatos como JSON.
    def to_dict(self) -> dict:
        """
        Convierte el objeto EmployModel en un diccionario.

        Returns:
            dict: Diccionario con los atributos del objeto.
        """
        return {
            "DIM_EmployeeId": self.DIM_EmployeeId,
            "DIM_PersonId": self.DIM_PersonId,
            "DIM_Position": self.DIM_Position,
            "DIM_DateId": self.DIM_DateId
        }
    
    # Finalmente, definimos el método __str__, que proporciona una representación en cadena del objeto. 
    # Esto es útil para depuración y para mostrar la información del empleado de manera legible.
    def __str__(self):
        """
        Representación en cadena para debugging.
        """
        return (f"EmployeeID: {self.DIM_EmployeeId} | "
                f"PersonID: {self.DIM_PersonId} | "
                f"Position: {self.DIM_Position} | "
                f"DateID: {self.DIM_DateId}")
