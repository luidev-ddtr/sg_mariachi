
class VIEWReservation():
    """
    Modelo de datos para representar una Reserva (VIEW).

    Este modelo se utiliza para estructurar y transferir información 
    detallada de una reserva hacia la capa de presentación (front-end).
    Contiene todos los campos necesarios para mostrar una lista o un detalle 
    de reservaciones en la interfaz de usuario. 
    
    Típicamente, los usuarios con acceso a la vista de reservaciones (ej. 
    administradores, personal de atención al cliente) utilizarán datos 
    estructurados bajo este modelo.
    """
    
    def __init__(self,
                    fullname: str,
                    phone_number: str,
                    full_date: str,  # Se usa 'str' ya que se espera el formato 'YYYY-MM-DD'
                    start_date: str, # Se usa 'str' ya que se espera el formato 'YYYY-MM-DD:HH'
                    end_date: str,   # Se usa 'str' ya que se espera el formato 'YYYY-MM-DD:HH'
                    total_amount: int,
                    status_name: str,
                    date_id: str,
                    dim_reservation_id: str
                    ) -> None:
        """
            Inicializa una nueva instancia de VIEWReservation.
            
            Este constructor asigna los valores de los parámetros de entrada 
            a los atributos internos de la instancia (self.ATRIBUTO = parametro).
            
            Parámetros:
                fullname (str): Nombre completo del cliente (DIM_fullname).
                phone_number (str): Número de teléfono del cliente (DIM_PhoneNumber).
                full_date (str): Fecha de la reserva en formato 'YYYY-MM-DD' (FullDate).
                start_date (str): Fecha y hora de inicio en formato 'YYYY-MM-DD:HH' (DIM_StartDate).
                end_date (str): Fecha y hora de fin en formato 'YYYY-MM-DD:HH' (DIM_EndDate).
                total_amount (int): Cantidad total de la reserva (DIM_TotalAmount).
                status_name (str): Nombre del estado actual de la reserva (DIM_StatusName).
                date_id (str): Identificador único de la fecha/periodo de la reserva (DIM_DateId).
                
            Nota: Todos los valores de fecha/hora son almacenados como strings.
        """
        self.DIM_fullname = fullname
        self.DIM_PhoneNumber = phone_number
        self.DIM_StatusName = status_name
        self.DIM_DateId = date_id
        self.FullDate = full_date 
        self.DIM_StartDate = start_date
        self.DIM_EndDate = end_date
        self.DIM_TotalAmount = total_amount
        self.DIM_ReservationId = dim_reservation_id

        
    def __str__(self):
        """
        Devuelve una representación en cadena del objeto Reservation.

        Este método se utiliza para facilitar el debugging y el logging,
        proporcionando una vista rápida y legible de los valores clave del objeto.

        Returns:
            str: Una cadena de texto formateada que lista los atributos principales
                 y sus valores, separados por un ' | '.
        """
        return (f"FullName: {self.DIM_fullname} | "
                f"PhoneNumber: {self.DIM_PhoneNumber} | "
                f"StatusName: {self.DIM_StatusName} | "
                f"DateID: {self.DIM_DateId} | "
                f"FullDate: {self.FullDate} | "
                f"StartDate: {self.DIM_StartDate} | "
                f"EndDate: {self.DIM_EndDate} | "
                f"TotalAmount: {self.DIM_TotalAmount} | "
                f"ReservationId: {self.DIM_ReservationId} | "
                )
    
    def to_dict(self):
        """
        Convierte la instancia de VIEWReservation en un diccionario.

        Esta función es crucial para la serialización de datos, permitiendo que 
        la información sea fácilmente enviada como respuesta JSON al front-end 
        (por ejemplo, a través de una API REST).

        Retorna:
            dict: Un diccionario donde las claves son los nombres de los atributos 
                y los valores son sus respectivos datos.
        """
        return {
            'DIM_fullname': self.DIM_fullname,
            'DIM_PhoneNumber': self.DIM_PhoneNumber,
            'DIM_StatusName': self.DIM_StatusName,
            'DIM_DateId': self.DIM_DateId,
            'FullDate': self.FullDate,
            'DIM_StartDate': self.DIM_StartDate,
            'DIM_EndDate': self.DIM_EndDate,
            'DIM_TotalAmount': self.DIM_TotalAmount,
            'DIM_ReservationId': self.DIM_ReservationId
        }