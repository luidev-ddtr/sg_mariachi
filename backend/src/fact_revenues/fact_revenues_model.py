
class FactRevenues():
    """
    Modelo de ingresos facturados.
    """

    def __init__(self, FACT_RevenueId: str, FACT_PaymentAmount: float, DIM_DateId: str, DIM_ReservationId: str) -> None:
        """
        Constructor de la clase FactRevenues.

        Args:
            FACT_RevenueId (str): ID único del ingreso facturado.
            FACT_PaymentAmount (float): Monto del ingreso.
            DIM_DateId (str): ID de la fecha asociada al ingreso.
            DIM_ReservationId (str): ID de la reserva asociada al ingreso.

        """
        self.FACT_RevenueId = FACT_RevenueId
        self.DIM_ReservationId = DIM_ReservationId
        self.DIM_DateId = DIM_DateId
        self.FACT_PaymentAmount = FACT_PaymentAmount

    def to_dict(self) -> dict:
        """
        Convierte el objeto FactRevenues en un diccionario.

        Returns:
            dict: Diccionario con los atributos del objeto.
        """
        return {
            "FACT_RevenueId": self.FACT_RevenueId,
            "DIM_ReservationId": self.DIM_ReservationId,
            "DIM_DateId": self.DIM_DateId,
            "FACT_PaymentAmount": self.FACT_PaymentAmount
        }
    
    def __str__(self):
        """
        Representación en cadena para debugging.
        """
        return (f"RevenueID: {self.FACT_RevenueId} | "
                f"Amount: {self.FACT_PaymentAmount} | "
                f"DateID: {self.DIM_DateId} | "
                f"ReservationID: {self.DIM_ReservationId}")
    