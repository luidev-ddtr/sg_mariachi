from typing import Dict, Any
class DIM_PEOPLE:
    """
    Modelo de Objeto de Transferencia de Datos (DTO) para la Dimensión de Personas (DIM_PEOPLE).

    Esta clase modela la estructura de datos de una persona en un contexto de
    base de datos dimensional (Data Warehouse), representando la dimensión
    'dim_people'. Contiene todos los atributos necesarios para identificar
    y describir a una persona (como cliente, usuario o proveedor) en el sistema.

    Se utiliza principalmente para:
    1. **Transferencia de Datos**: Mover registros de persona entre las capas
       de la aplicación (ej. de la capa de acceso a datos a la capa de lógica
       de negocio).
    2. **Mapeo ORM/SQL**: Facilitar la inserción, actualización o recuperación
       de datos en la tabla `dim_people`.
    3. **Serialización**: Convertir el objeto a formato de diccionario (JSON)
       para su uso en APIs o procesos de logging/monitoreo.

    Atributos:
        DIM_PeopleId (str): Clave primaria/Subrogada única de la persona.
        DIM_Name (str): Primer nombre de la persona.
        DIM_SecondName (str): Segundo nombre de la persona (puede ser vacío o None).
        DIM_LastName (str): Primer apellido de la persona.
        DIM_SecondLastName (str): Segundo apellido de la persona (puede ser vacío o None).
        DIM_Address (str): Dirección de residencia de la persona.
        DIM_PhoneNumber (str): Número de teléfono principal.
        DIM_SecondPhoneNumber (str): Número de teléfono secundario (puede ser vacío o None).
        DIM_DateId (str): Clave foránea que referencia a la dimensión de Fecha
                          (usualmente la fecha de creación o registro del registro).
    """
    
    
    def __init__(
        self, DIM_PeopleId: str, DIM_Name: str,
        DIM_SecondName: str, DIM_LastName: str,
        DIM_SecondLastName: str, DIM_Address: str,
        DIM_PhoneNumber: str, DIM_SecondPhoneNumber: str, 
        DIM_DateId: str ) -> None:
        """
        Constructor de la clase DIM_PEOPLE. Inicializa un nuevo objeto de persona.

        Todos los campos son requeridos para la inicialización.
        El campo de 'timestamp' (fecha de modificación/registro en BD) no se
        incluye en este modelo ya que se asume que la base de datos lo maneja
        automáticamente (ej. un campo `CURRENT_TIMESTAMP` en MySQL/PostgreSQL).

        Args:
            DIM_PeopleId (str): ID único de la persona.
            DIM_Name (str): Primer nombre.
            DIM_SecondName (str): Segundo nombre.
            DIM_LastName (str): Primer apellido.
            DIM_SecondLastName (str): Segundo apellido.
            DIM_Address (str): Dirección completa.
            DIM_PhoneNumber (str): Teléfono principal.
            DIM_SecondPhoneNumber (str): Teléfono secundario.
            DIM_DateId (str): ID de la fecha de registro.
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
        """
        Devuelve una representación legible en cadena de texto del objeto.

        Es fundamental para el logging y la depuración (debugging), permitiendo
        una rápida visualización de los datos de la persona.

        Returns:
            str: Una cadena formateada que incluye los atributos clave del objeto.
        """
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
        """
        Convierte el objeto DIM_PEOPLE en un diccionario de Python.

        Es esencial para la serialización a formatos como JSON, lo que es
        común en la capa de API o al interactuar con frameworks web.

        Returns:
            Dict[str, Any]: Un diccionario donde las claves coinciden con
                            los nombres de los atributos. Los tipos de valor
                            (Any) reflejan la diversidad de datos almacenados.
        """
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