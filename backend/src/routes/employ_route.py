from flask import Blueprint, request
from typing import Any
from src.dim_employ.employ_handler import EmployHandler
from src.dim_employ.employ_service import EmployService
from src.routes.handle_message import send_error, send_success
from src.utils.decorators import login_required

# Instanciamos el servicio y el handler. 
# Pasamos None al servicio inicialmente; el handler asignará una conexión fresca en cada petición.
employ_service = EmployService(None)
employ_handler = EmployHandler(employ_service)

employ_route = Blueprint('employ_route', __name__, url_prefix='/api/employ')

@employ_route.route('/assign_role', methods=['POST'])
@login_required
def assign_role() -> tuple[Any]:
    """
    Asigna un puesto (rol) a una persona existente en el sistema.
    Es el paso intermedio entre crear una persona y crear sus credenciales de acceso.
    """
    try:
        data = request.get_json()
        
        # Llamamos al handler para asignar el puesto
        # data debe contener: DIM_PersonId, DIM_Position, DIM_DateId (opcional)
        status, message, result = employ_handler.assing_position_employ(data)
        
        if status != 201:
            print(f"Error en assign_role: {message}")
            return send_error(message, status)
        
        return send_success(message, result, status)
        
    except Exception as e:
        print(f"Excepción en ruta employ: {e}")
        return send_error(str(e), 500)