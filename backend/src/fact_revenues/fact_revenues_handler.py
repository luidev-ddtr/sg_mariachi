from src.fact_revenues.fact_revenues_service import FactRevenuesService
from src.fact_revenues.fact_revenues_model import FactRevenues
from src.utils.conexion import Conexion
from src.utils.id_generator import create_id

class FactRevenuesHandler:
    def __init__(self):
        pass

    def create_revenue(self, _revenue: dict, conn: Conexion = None) -> tuple:
        """
        Crea un nuevo registro de ingresos facturados.

        Args:
            revenue_data (dict): Diccionario con los datos del ingreso facturado.

        Returns:
            FactRevenues: Objeto FactRevenues creado.
        """
        conexion = conn or Conexion()
        fact_revenue_service = FactRevenuesService(conexion)
        
        try:

            # 1. Validar que todos los campos necesarios estén presentes
            # FACT_RevenueId se genera aquí, no debe venir del request
            required_fields = ['FACT_PaymentAmount', 'DIM_DateId', 'DIM_ReservationId']
            for field in required_fields:
                if field not in _revenue:
                    return 400, f"Falta el campo requerido: {field}", []

            # 2. Crear el objeto FactRevenues
            revenue = FactRevenues(
                FACT_RevenueId="", # Se genera abajo
                FACT_PaymentAmount=_revenue['FACT_PaymentAmount'],
                DIM_DateId=_revenue['DIM_DateId'],
                DIM_ReservationId=_revenue['DIM_ReservationId']
            )

            # 3. Validar que la factura no sea negativa
            # Si es mayor a 0 pero menor a 4000, es un error (asumiendo anticipo mínimo)
            if 0 < revenue.FACT_PaymentAmount < 4000:
                return 400, "El monto del pago debe ser mayor a 4000 o 0.", []
            
            #4. Generar el ID de la factura ya que no se proporciona
            fact_id =create_id([_revenue['DIM_DateId'], _revenue['DIM_ReservationId']])
            revenue.FACT_RevenueId = fact_id
            print(revenue.FACT_RevenueId)

            # 3. Usar el servicio para crear el ingreso facturado
            created = fact_revenue_service.create_revenue(revenue)
            if not created:
                return 500, "Error al crear el ingreso facturado", []

            return 201, "Ingreso facturado creado correctamente", revenue
        except Exception as e:
            return 500, f"Error interno del servidor: {e}", []
        finally:
            if not conn:
                conexion.close_conexion()


    def get_revenue_info(self, _revenue: dict, conn: Conexion = None) -> tuple:
        """
        Obtiene la información de un ingreso facturado por su ID.

        Args:
            revenue_id (str): ID del ingreso facturado.

        Returns:
            dict: Diccionario con la información del ingreso facturado.
        """
        # Aquí se podría agregar lógica para obtener el objeto desde la base de datos usando el servicio.
        # Por ahora, devolvemos un diccionario vacío como marcador de posición.
        
        conexion = conn or Conexion()
        fact_revenue_service = FactRevenuesService(conexion)
        try:

            #1. Validar que el campo necesario esté presente
            required_fields = ['FACT_PaymentAmount', 'DIM_DateId', 'DIM_ReservationId']

            for field in required_fields:
                if field not in _revenue:
                    return 400, f"Falta el campo requerido: {field}", []
                
            # Reserva a la que se le aplicara el pago
            reservation_id = _revenue['DIM_ReservationId']

            #2. Obtener la información del ingreso facturado
            existing_revenue = fact_revenue_service.get_fact_revenues_by_id(
                reservation_id
            ) 

            return 200, "Información obtenida correctamente", existing_revenue
        except Exception as e:
            return 500, f"Error interno del servidor: {e}", []