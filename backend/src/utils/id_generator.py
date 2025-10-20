import uuid

def create_id(data: list) -> str:
    """
    Genera un identificador único de 18 caracteres basado en datos de entrada.
    Su funcionamiento es el siguiente, se desempaquetan los 3 datos del array y se pasan a string
    despues se capitalizan y se toman solo 3 letras como maximo, por ultimo se hashean y se genera un
    id determinista, que quiere decir, si le das la misma entrada te generara el mismo uuid
    
    Args:
        data (list): Lista con campos para construir el ID (3 elementos máximo)
        
    Returns:
        str: Identificador único de 18 caracteres
    """
    fields = [str(field).capitalize()[:3] if field is not None else "" for field in data[:3]]
    
    part1 = fields[0] if len(fields) > 0 else ""
    part2 = fields[1] if len(fields) > 1 else ""
    part3 = fields[2] if len(fields) > 2 else ""
    
    # Construir el ID base
    uuid_base_string = f"{part1}-{part2}-{part3}"
    
    namespace = uuid.NAMESPACE_URL
    uuid_obj = uuid.uuid5(namespace, uuid_base_string)
    uuid_string = str(uuid_obj)
    
    return uuid_string[:18]  # SE retornan caracteres totalmente aleatorios
