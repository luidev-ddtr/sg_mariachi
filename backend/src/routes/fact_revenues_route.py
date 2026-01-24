from flask import Blueprint, request
from typing import Any
from src.fact_revenues.fact_revenues_handler import FactRevenuesHandler
from src.routes.handle_message import send_error, send_success

# 1. Instanciamos el Handler (El Cocinero)
# Este objeto contiene la lógica para crear y consultar ingresos.
revenue_handler = FactRevenuesHandler()

# 2. Definimos el Blueprint (La Carpeta Virtual)
# url_prefix define que todas las rutas aquí empezarán con /api/revenues/
fact_revenues_route = Blueprint('fact_revenues_route', __name__, url_prefix='/api/revenues/')

@fact_revenues_route.route('/create', methods=['POST'])
def create_revenue() -> tuple[Any]:
    """
    Endpoint para registrar un nuevo pago/ingreso.
    """
    try:
        # 3. Obtener los datos del Request (El Pedido)
        data = request.get_json()
        
        # 4. Llamar a la lógica de negocio
        # El handler nos devuelve: status (int), message (str), y data (obj/dict)
        status, message, result = revenue_handler.create_revenue(data)
        
        # 5. Manejar la Respuesta (El Platillo)
        if status != 201:
            return send_error(message, status)
        
        # Convertimos el objeto resultado a diccionario si es necesario para enviarlo como JSON
        response_data = result.__dict__ if hasattr(result, '__dict__') else result
        
        return send_success(message, response_data, status)
    except Exception as e:
        return send_error(str(e), 500)

@fact_revenues_route.route('/info', methods=['POST'])
def get_revenue_info() -> tuple[Any]:
    """
    Endpoint para obtener información de los pagos de una reserva.
    """
    try:
        data = request.get_json()
        
        status, message, result = revenue_handler.get_revenue_info(data)
        
        if status != 200:
            return send_error(message, status)
            
        return send_success(message, result, status)
    except Exception as e:
        return send_error(str(e), 500)