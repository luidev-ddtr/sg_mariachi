from flask import Blueprint, request
from typing import Any
from src.dim_serviceowners.serviceowners_handler import ServiceownersHandler
from src.routes.handle_message import send_error, send_success
from src.utils.decorators import login_required

admin_route = Blueprint('admin_route', __name__, url_prefix='/api/admin')

# El handler de ServiceOwners contiene la lógica de actualización transaccional
admin_handler = ServiceownersHandler()

@admin_route.route('/update', methods=['PUT'])
@login_required
def update_admin() -> tuple[Any]:
    """
    Actualiza la información de un administrador.
    Puede actualizar datos personales, de empleado y credenciales simultáneamente.
    
    Espera un JSON con la estructura:
    {
        "DIM_EmployeeId": "...",
        "people_data": { ... },      # Opcional
        "employ_data": { ... },      # Opcional
        "serviceowner_data": { ... } # Opcional
    }
    """
    try:
        data = request.get_json()
        
        status, message, result = admin_handler.updateServiceowners(data)
        
        if status != 200:
            return send_error(message, status)
            
        return send_success(message, result, status)
    except Exception as e:
        return send_error(str(e), 500)

@admin_route.route('/register_credentials', methods=['POST'])
@login_required
def register_credentials() -> tuple[Any]:
    """
    Crea las credenciales de acceso (usuario y contraseña) para un administrador.
    Este es el paso final después de crear la persona y asignar su rol.
    """
    try:
        data = request.get_json()
        # insertNewServiceowners espera: DIM_Username, DIM_Password, DIM_EmployeeId
        status, message, result = admin_handler.insertNewServiceowners(data)
        
        if status != 201:
            return send_error(message, status)
            
        return send_success(message, result, status)
    except Exception as e:
        return send_error(str(e), 500)
