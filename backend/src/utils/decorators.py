from functools import wraps
from flask import session, jsonify, g

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
        
        # 3. Inyectar datos del usuario en 'g' para que las rutas (como /profile) puedan usarlos.
        # Intentamos recuperar el objeto 'user' completo de la sesión.
        # Si no existe, creamos un diccionario básico usando 'user_id' mapeado a 'DIM_EmployeeId'
        # (Asumiendo que user_id en sesión es el ID del empleado/admin).
        user_data = session.get('user')
        if not user_data:
            user_data = {'DIM_EmployeeId': session.get('user_id')}
        
        g.user = user_data

        # 3. Si existe, ejecuta la función original de la ruta (ej. create_reservation)
        return f(*args, **kwargs)
    
    return decorated_function