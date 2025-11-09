# Blueprint del usuario, se hace para separar el codigo y dejar app.py limpio
from typing import Literal
from flask import Blueprint, request
from flask.wrappers import Response
from typing import Any
from src.dim_people.people_handler import PeopleHandler

from src.routes.handle_message import send_error, send_success

#Importaciones para crear cuenta

people_options = PeopleHandler()
people_route = Blueprint('people_route', __name__, url_prefix='/api/people/')

from flask_jwt_extended import jwt_required,  get_jwt, get_jwt_identity

@people_route.route('/create', methods=['POST'])
def create_people():
    """
    Crea una nueva persona en la tabla dim_people
    """
    try:
        data_people = request.get_json()
        people_options.create_people(data_people)
        return send_success("Persona creada exitosamente", None, 201)
    except Exception as e:
        return send_error(str(e), 500)
