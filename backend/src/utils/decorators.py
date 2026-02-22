from functools import wraps
from flask import session, jsonify

def login_required(f):
    """
    Un decorador que comprueba si un usuario ha iniciado sesión.
    Si el 'user_id' no está en la sesión, devuelve un error 401 (No autorizado).
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # 1. Comprueba si la clave 'user_id' existe en la sesión
        if 'user_id' not in session:
            # 2. Si no existe, devuelve una respuesta de error JSON con el código 401
            return jsonify({"status": "error", "message": "Acceso no autorizado. Se requiere iniciar sesión."}), 401
        
        # 3. Si existe, ejecuta la función original de la ruta (ej. create_reservation)
        return f(*args, **kwargs)
    
    return decorated_function