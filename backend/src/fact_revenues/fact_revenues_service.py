from src.utils.conexion import Conexion
from src.fact_revenues.fact_revenues_model import FactRevenues
from src.fact_revenues.repositorio.insert_payAmount import insert_payAmount
from src.fact_revenues.repositorio.get_fact_revenues_by_id import get_fact_revenues_by_id


class FactRevenuesService:
    def __init__(self, conn : Conexion):
        self.conn = conn
    
    def validate_revenue(self, revenue: FactRevenues) -> bool:
        """
        Valida los datos del ingreso facturado.

        Args:
            revenue (FactRevenues): Objeto FactRevenues a validar.

        Returns:
            bool: True si los datos son válidos, False en caso contrario.
        """
        if revenue.FACT_PaymentAmount < 0:
            print("El monto del pago no puede ser negativo.")
            return False
        # Agregar más validaciones según sea necesario
        return True
    
    def create_revenue(self, revenue: FactRevenues) -> bool:
        """
        Crea un nuevo registro de ingresos facturados.

        Args:
            revenue (FactRevenues): Objeto FactRevenues a crear.

        Returns:
            bool: True si la creación fue exitosa, False en caso contrario.
        """
        if not self.validate_revenue(revenue):
            return False
        
        return insert_payAmount(revenue, self.conn)

    def get_fact_revenues_by_id(self, reservation_id: str) -> list:
        """
        Obtiene la información de la reserva que se le aplicará el pago.

        Args:
            revenue_id (str): ID del ingreso facturado.

        Returns:
            list: Lista de diccionarios con la información del ingreso facturado.
        """
        try:
            return get_fact_revenues_by_id(reservation_id, self.conn)
        except Exception as e:
            print(f"Error al obtener los ingresos facturados: {e}")
            return []
