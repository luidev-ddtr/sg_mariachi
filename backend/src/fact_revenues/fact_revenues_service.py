from src.utils.conexion import Conexion
from src.fact_revenues.fact_revenues_model import FactRevenues
from src.fact_revenues.repositorio.insert_payAmount import insert_payAmount
from src.fact_revenues.repositorio.get_fact_revenues_by_id import get_fact_revenues_by_id
from src.fact_revenues.repositorio.get_revenue_stats import get_revenue_stats


class FactRevenuesService:
    def __init__(self, conn : Conexion):
        self.conn = conn
    
    def validate_revenue(self, revenue: FactRevenues) -> bool:
        """
        Valida las reglas de negocio para un objeto de ingreso facturado.
        
        :param revenue: Instancia de FactRevenues a validar.
        :return: True si los datos son válidos, False en caso contrario.
        """
        if revenue.FACT_PaymentAmount < 0:
            print("El monto del pago no puede ser negativo.")
            return False
        # Agregar más validaciones según sea necesario
        return True
    
    def create_revenue(self, revenue: FactRevenues) -> bool:
        """
        Persiste un nuevo registro de ingreso facturado en la base de datos.
        
        :param revenue: Instancia de FactRevenues a crear.
        :return: True si la creación fue exitosa, False en caso contrario.
        """
        if not self.validate_revenue(revenue):
            return False
        
        return insert_payAmount(revenue, self.conn)

    def get_fact_revenues_by_id(self, reservation_id: str) -> list:
        """
        Obtiene el historial de ingresos/pagos asociados a una reserva específica.
        
        :param reservation_id: ID de la reserva a consultar.
        :return: Lista de diccionarios con la información de los pagos.
        """
        try:
            return get_fact_revenues_by_id(reservation_id, self.conn)
        except Exception as e:
            print(f"Error al obtener los ingresos facturados: {e}")
            return []

    def get_revenue_statistics(self, filter_type: str, year: int) -> list:
        """
        Obtiene las estadísticas de ingresos agrupadas según el filtro.
        
        :param filter_type: Tipo de agrupación ('month', 'week', 'year').
        :param year: Año del cual obtener las estadísticas.
        :return: Lista con los datos estadísticos formateados para gráficas.
        """
        return get_revenue_stats(self.conn, filter_type, year)