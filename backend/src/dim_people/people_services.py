from src.utils.conexion import Conexion
from src.dim_people.repository.validations import *


class PeopleService:
    """Clase que manejara los servicios, validaciones y API pulbica de personas con otras entidades del programa:"""

    def is_person_exist(self, data_people: dict, conexion: Conexion) -> tuple[int, str, str]:
        """
        Valida si una persona (cliente) existe en la base de datos a partir de un diccionario de datos.

        Este método sirve como una API pública dentro de la capa de servicio,
        facilitando la integración con otras entidades del programa que necesiten
        validar la existencia de un registro de persona antes de crear una transacción
        o completar un proceso.

        Args:
            self: Referencia a la instancia de la clase PeopleService.
            data_people (dict): Un diccionario que contiene los datos de la persona
                                necesarios para la búsqueda, con las siguientes
                                claves esperadas:
                                - "DIM_Name"
                                - "DIM_SecondName"
                                - "DIM_LastName"
                                - "DIM_SecondLastName"
                                - "DIM_Address"
                                - "DIM_Phone"
                                - "DIM_SecondPhone"
            conexion (Conexion): Objeto de conexión a la base de datos.

        Returns:
            tuple[int, str, str]: Una tupla conteniendo:
                                  1.  Código de estado HTTP simulado (int):
                                      - 200 si la persona es encontrada.
                                      - 404 si la persona no es encontrada.
                                  2.  Mensaje descriptivo (str):
                                      - "Persona encontrada" o "No se encontro la persona".
                                  3.  ID de la persona (str):
                                      - El `DIM_PeopleId` si la persona existe (o cadena vacía "").

        Lógica:
            - Llama a la función de utilidad `get_id_if_person_exists` (que contiene la
              lógica SQL detallada) y le pasa los valores extraídos del diccionario `data_people`.
            - El resultado de `get_id_if_person_exists` (que es el ID o None) se mapea
              a una respuesta HTTP estilo (código, mensaje, ID).

        Acceso/Uso:
            - Es un método interno de la capa de servicios. No está diseñado para
              ser llamado directamente por un usuario final.
            - Es utilizado por otros servicios (ej. `SaleService`, `OrderService`)
              para asegurar la integridad referencial y evitar duplicados.
        """
        result = get_id_if_person_exists(data_people["DIM_Name"], data_people["DIM_SecondName"],
                data_people["DIM_LastName"], data_people["DIM_SecondLastName"],
                data_people["DIM_Address"], data_people["DIM_Phone"],
               data_people["DIM_SecondPhone"], conexion)
        if result is None:
            return  404, "No se encontro la persona", ""
        else:
            return 200, "Persona encontrada", result #resul representa el ID en caso de que la persona exista