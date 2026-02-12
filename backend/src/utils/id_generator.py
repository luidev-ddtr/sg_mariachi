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


# Esta función de id aun esta en prueba por lo que posiblmente se elimine, se creo para generar un id unico para las tablas de fact_revenue y dim_reservation, ya que estas tablas tienen una gran cantidad de datos y es necesario un id unico para cada registro, ademas de que el id debe ser determinista, es decir, si se le da la misma entrada debe generar el mismo id, esto es importante para evitar duplicados en la base de datos.
def create_id_fact_reservation(data: list) -> str:
    """
    Genera un identificador único de 18 caracteres basado en datos de entrada.
    
    Usa uuid5 para generar un hash determinista basado en la concatenación completa
    de los datos proporcionados, unicamente para las ID de fact_revenue y dim_reservation.
    
    Args:
        data (list): Lista con campos para construir el ID.
        
    Returns:
        str: Identificador único de 18 caracteres
    """
    # Usamos los datos completos convertidos a string, sin recortarlos.
    # Esto asegura que "Juan" y "Juana" o fechas con segundos de diferencia generen IDs distintos.
    fields = [str(field).strip() for field in data if field is not None]
    
    # Unimos todos los campos disponibles con un separador
    uuid_base_string = "-".join(fields)
    
    namespace = uuid.NAMESPACE_URL
    uuid_obj = uuid.uuid5(namespace, uuid_base_string)
    uuid_string = str(uuid_obj)
    
    # Retornamos los primeros 18 caracteres.
    # Al usar uuid5 con datos completos, el hash cambia radicalmente ante cualquier cambio en la entrada,
    # por lo que los primeros 18 caracteres tienen altísima entropía (unicidad).
    return uuid_string[:18]