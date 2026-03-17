from typing import Any
from flask import Blueprint, request, g
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

@admin_route.route('/list', methods=['GET'])
@login_required
def list_admins() -> tuple[Any]:
    """Lista todos los administradores del sistema."""
    try:
        status, message, result = admin_handler.get_all_admins()
        if status != 200:
            return send_error(message, status)
        return send_success(message, result, status)
    except Exception as e:
        return send_error(str(e), 500)

@admin_route.route('/profile', methods=['GET'])
@login_required
def get_admin_profile() -> tuple[Any]:
    """Obtiene los datos del perfil del administrador actualmente logueado."""
    try:
        # Extraer el ID del usuario desde el contexto 'g' que inyecta el decorador
        if not hasattr(g, 'user') or 'DIM_EmployeeId' not in g.user:
            return send_error("No hay sesión de usuario activa o está incompleta.", 401)
        
        employee_id = g.user['DIM_EmployeeId']
        
        # Pasar el ID al handler
        status, message, result = admin_handler.get_admin_details(employee_id)
        
        if status != 200:
            return send_error(message, status)
        return send_success(message, result, status)
    except Exception as e:
        return send_error(str(e), 500)

@admin_route.route('/delete/<string:employee_id>', methods=['DELETE'])
@login_required
def delete_admin(employee_id: str) -> tuple[Any]:
    """Elimina un administrador por su EmployeeId."""
    try:
        status, message, result = admin_handler.delete_admin(employee_id)
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
