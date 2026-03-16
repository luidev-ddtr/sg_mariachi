# Blueprint del usuario, se hace para separar el codigo y dejar app.py limpio
from typing import Literal
from flask import Blueprint, request
from flask.wrappers import Response
from typing import Any
from src.dim_people.people_handler import PeopleHandler

from src.routes.handle_message import send_error, send_success
#Importaciones para crear cuenta
from src.utils.decorators import login_required

people_options = PeopleHandler()
people_route = Blueprint('people_route', __name__, url_prefix='/api/people/')

@people_route.route('/create', methods=['POST'])
@login_required
def create_people():
    """
    Crea una nueva persona en la tabla dim_people
    """
    try:
        data_people = request.get_json()
        
        # Capturamos la respuesta del Handler (mensaje, status, id)
        message, status, new_id = people_options.create_people(data_people)
        
        if status != 201:
            return send_error(message, status)
            
        return send_success(message, {"DIM_PeopleId": new_id}, status)
    except Exception as e:
        return send_error(str(e), 500)
