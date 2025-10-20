#Este archivo envia mensajes de error, y limpia el codigo solo se manda a llamar
from typing import Any
from flask import jsonify


def send_error( message, status_code) -> tuple[ Any]:
    """Funcion la cual envia un mensaje de error con el codigo de estado correspondiente
    Args:
        message (str): Mensaje de error
        status_code (int): Codigo de estado de la peticion. Defaults to 500"""
    return jsonify({"status": "error", "message": message}), status_code

def send_success(message,data, status_code) -> tuple[ Any]:# -> tuple:# -> tuple[Response, Any]:
    """funcion la cual maneja los mensajes de exito
    Pero solo son los que retornaran algo al frontend, ya que recibe de parametro datos 
    en caso de ser informativo data tiene que ser none
    Args:
        message (str): Mensaje de exito
        data (any, optional): Datos a enviar al frontend. Defaults to None.
        status_code (int): Codigo de estado de la peticion. Defaults to 200.
    """
    return jsonify({"status": "success", "body": data, "message": message}), status_code