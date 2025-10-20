def validate_data(data: dict, fields_required: list, type_fields: list, from_message: str) -> tuple:
    """Valida la información de un diccionario contra una lista de campos requeridos y sus tipos.

    Args:
        data (dict): Diccionario que contiene los datos a validar.
        fields_required (list): Lista de cadenas con los nombres de los campos que deben estar presentes en 'data'.
        type_fields (list): Lista de tipos de datos (como str, int, etc.) correspondientes a los campos en 'fields_required'.
        from_message (str): Cadena de texto que indica el origen de los datos, utilizada para mensajes de error.

    Returns:
        tuple[bool, str]: Una tupla que contiene un booleano y un string.
                         El booleano es True si la validación es exitosa, False en caso de error.
                         El string contiene un mensaje de éxito o una descripción del error.
    """
    if len(fields_required) != len(type_fields):
        return False, f"Error en el tamaño de los campos o los tipos de los campos desde {from_message} /n  campos requeridos {len(fields_required)} !=  tipos de campos {len(type_fields)}"
    
    claves_cuenta = set(data.keys())
    print(claves_cuenta)
    for clave in fields_required:
        
        if (not clave in claves_cuenta):
            return False, f"El campo {clave} es requerido en {from_message}"
        
        if (type(data[clave]) != type_fields[fields_required.index(clave)]):
            return False, f"El tipo de dato en el campo {clave} es incorrecto"
        
    return True, "Todo bien"


def is_field_empty(data: dict) -> tuple:
    """Valida que no haya campos vacíos en el diccionario.

    Args:
        data (dict): Diccionario que contiene los datos a validar.

    Returns:
        tuple[bool, str]: Una tupla que contiene un booleano y un string.
                         El booleano es True si la validación es exitosa, False en caso de error.
                         El string contiene un mensaje de éxito o una descripción del error.
    """
    if not isinstance(data, dict):
        return False, "El dato proporcionado debe ser un diccionario"
    
    for clave, valor in data.items():
        # Si el valor es None, está vacío
        if valor is None:
            return False, f"El campo {clave} no puede ser None"
        
        # Si es string, verificar si está vacío o solo tiene espacios
        if isinstance(valor, str):
            if not valor.strip():
                return False, f"El campo {clave} no puede estar vacío"
        # Para otros tipos, verificar si está "vacío" según su tipo
        elif isinstance(valor, (list, dict, set, tuple)):
            if not valor:  # Colección vacía
                return False, f"El campo {clave} no puede estar vacío"
        else:
            # Para números, booleanos y otros tipos, considerarlos siempre con valor
            # (un número 0 o booleano False no se consideran vacíos)
            pass
    
    return True, "Todo bien"