# Blueprint del usuario, se hace para separar el codigo y dejar app.py limpio
from typing import Literal
from flask import Blueprint, request
from flask.wrappers import Response
from typing import Any
from src.dim_reservations.reservation_handler import ReservationService

from src.routes.handle_message import send_error, send_success

#Importaciones para crear cuenta

reservation_options = ReservationService()
reservation_route = Blueprint('reservation_route', __name__, url_prefix='/api/reservation/')

from flask_jwt_extended import jwt_required,  get_jwt, get_jwt_identity

@reservation_route.route('/create', methods=['POST'])
def create_reservation():
    """
    Crea una nueva reserva en la tabla dim_people
    """
    try:
        data_reservation = request.get_json()
        reservation_options.create_reservation(data_reservation)
        return send_success("Reserva creada exitosamente", None, 201)
    except Exception as e:
        return send_error(str(e), 500)
