from src.dim_dates.dim_date import DIM_DATE
from src.utils.conexion import Conexion
from src.utils.id_generator import create_id


class ReservationService:
    """
    Clase que representa el servicio de la tabla People
    manejara todo el crud y la logica principald e la informacion sobre las 
    perosnas que son agregaras a la tabla dim_people
    """
    
    def create_reservation(self, _reservation: dict) -> tuple[str, int]:
        """
        Puedes agregar la documentaciond e tu funcion pidiendole a gemeni que te docuemnte tu codigo aqui. Puede tuilizar este propmt
        <codigo></codigo><mensaje>Generame la documentacion (Como lo harias con comentarios) SOLO DOCUMENTACION de este codigo. haza muy explicativa con el codigo que hay en la funcion. por ejemplo pequenios detalles como el que tipo de usuario tiene acces etc.. Solo genera el nombre de la funcion y el docstring
        </mensaje> 
        """
        conexion = Conexion()
        try:
            """
            Aqui se agrega toda la logica y validaciones ademas aqui es donde se debe instanciar el modelo 
            """
            
            if result:
                return "Reserva creada exitosamente", 201
            else:
                return "Error al crear la reserva", 500
        except Exception as e:
            print(f"Error al crear la reserva: {e}")
            return "Error al crear la reserva", 500
        finally:
            conexion.close_conexion()