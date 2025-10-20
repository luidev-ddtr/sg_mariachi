
# Fichero el cual creara la instancia de flask # 
import os
from dotenv import load_dotenv
from flask import Flask, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta

# --- CORRECCIÓN 1: Cargar el .env PRIMERO ---
# Esta línea DEBE estar al principio, antes de acceder a cualquier variable de entorno.
#load_dotenv()
#Por el moemento no se utilizaran variables de entonro


app = Flask(__name__)

"""
secret_key = os.environ.get('SECRET_KEY')
if not secret_key:
    raise ValueError("No se encontró la SECRET_KEY en el entorno. La aplicación no puede iniciar de forma segura.")
app.config['JWT_SECRET_KEY'] = secret_key

Configuración de los tiempos de expiración
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=15)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=1)

jwt = JWTManager(app)


#Blueprints van aqui ...
"""


#frontend_urls = os.environ.get("URL_FRONTEND", "http://localhost:5173")
frontend_urls = ["http://localhost:5173", "http://localhost:5173"]
# Convertir a lista si hay múltiples URLs separadas por coma
origins_list = [url.strip() for url in frontend_urls]

CORS(app, resources={
    r"/*": {
        "origins": origins_list,  # Usar lista en lugar de string
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        "allow_headers": [
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ],
        "expose_headers": ["Content-Disposition"],
        "supports_credentials": True,
        "max_age": 86400,
        "send_wildcard": False,  # IMPORTANTE: Edge requiere esto en False
        "always_send": True  # Enviar headers CORS siempre, incluso en OPTIONS
    }
})


if __name__ == '__main__':
    app.run(debug=True)