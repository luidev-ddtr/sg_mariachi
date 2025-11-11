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
def create_reservation() -> tuple[Any]:
    """
    Crea una nueva reserva en la tabla dim_people
    """
    try: 
        data_reservation = request.get_json()
        for name in data_reservation:
            print(f"'{name}': {data_reservation[name]}", end="\n")
        status, message = reservation_options.create_reservation(data_reservation)
        
        if status != 201:
            print(message)
            return send_error(message, status)
        
        return send_success("Reserva creada exitosamente", None, 201)
    except Exception as e:
        return send_error(str(e), 500)



@reservation_route.route('/read', methods=['GET'])
def read_reservation():
    """
    Obtiene reservas por fecha desde los parámetros de consulta
    """
    try:
        # Obtener la fecha del parámetro de consulta 'date'
        date = request.args.get('date')
        
        # Validar que la fecha fue proporcionada
        if not date:
            return send_error("El parámetro 'date' es requerido", 400)
        
        status, message, data_reservations = reservation_options.read_reservations_by_date(date)
        
        if status != 200:
            print(message)
            return send_error(message, status)
        
        return send_success("Reservas obtenidas exitosamente", data_reservations, 200)
    
    except Exception as e:
        return send_error(str(e), 500)
    

@reservation_route.route('/update', methods=['PUT'])
def update_reservation():
    """
    Crea una nueva reserva en la tabla dim_people
    """
    try:
        new_data = request.get_json()
        status, message = reservation_options.update_reservation(new_data) #TODO Cambiar al nombre verdadero que se pornga
        
        if status != 201:
            print(message)
            return send_error(message, status)
        
        return send_success("Reserva creada exitosamente", None, 200)
    except Exception as e:
        return send_error(str(e), 500)


@reservation_route.route('/delete', methods=['DELETE'])
def delete_reservation() -> tuple[Any]:
    """
    Crea una nueva reserva en la tabla dim_people
    """
    try:
        id_reservation = request.get_json()
        status, message = reservation_options.delete_reservation(id_reservation) #TODO Cambiar al nombre verdadero que se pornga
        
        if status != 201:
            print(message)
            return send_error(message, status)
        
        return send_success("Reserva creada exitosamente", None, 200)
    except Exception as e:
        return send_error(str(e), 500)

@reservation_route.route('/prueba1', methods=['GET'])
def prueba1() -> tuple[Any]:
    """
    Crea una nueva reserva en la tabla dim_people
    """
    try:
        return send_success("Prueba creada exitosamente", None, 200)
    except Exception as e:
        return send_error(str(e), 500)