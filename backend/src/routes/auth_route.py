from flask import Blueprint, request, session, jsonify
from src.dim_serviceowners.serviceowners_handler import ServiceownersHandler
from src.routes.handle_message import send_error, send_success

# Definimos el Blueprint
auth_route = Blueprint('auth_route', __name__, url_prefix='/api/auth')

# Instanciamos el handler que contiene la lógica de validación
auth_handler = ServiceownersHandler()

@auth_route.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        # 1. Llamamos al handler para validar credenciales contra la BD
        status, message, user_data = auth_handler.validation_login(data)
        
        if status == 200 and user_data:
            # 2. ¡AQUÍ ES DONDE SE CREA LA SESIÓN!
            # Guardamos datos mínimos necesarios en la cookie firmada del navegador
            session['user_id'] = user_data['DIM_ServiceOwnersId']
            session['username'] = user_data['DIM_Username']
            
            # Opcional: Quitamos la contraseña del objeto antes de enviarlo al frontend por seguridad
            if 'DIM_Password' in user_data:
                del user_data['DIM_Password']
                
            return send_success(message, user_data, 200)
        else:
            return send_error(message, status)
            
    except Exception as e:
        return send_error(str(e), 500)

@auth_route.route('/logout', methods=['POST'])
def logout():
    session.clear()  # Elimina todas las variables de sesión (rompe el acceso)
    return send_success("Sesión cerrada exitosamente", None, 200)

@auth_route.route('/check_session', methods=['GET'])
def check_session():
    """Endpoint para verificar si el usuario ya tiene sesión iniciada"""
    if 'user_id' in session:
        return send_success("Sesión activa", {
            "user_id": session.get('user_id'),
            "username": session.get('username')
        }, 200)
    return send_error("No hay sesión activa", 401)