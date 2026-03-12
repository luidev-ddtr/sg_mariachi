import bcrypt

def hash_password(password: str) -> bytes:
    """
    Genera un hash seguro para una contraseña usando bcrypt.

    Args:
        password (str): La contraseña en texto plano.

    Returns:
        bytes: El hash de la contraseña, incluyendo el salt.
    """
    # bcrypt requiere que la contraseña esté en bytes.
    password_bytes = password.encode('utf-8')
    # bcrypt.gensalt() genera un salt aleatorio y seguro.
    salt = bcrypt.gensalt()
    # bcrypt.hashpw combina la contraseña y el salt para crear el hash.
    hashed_password = bcrypt.hashpw(password_bytes, salt)
    return hashed_password

def verify_password(plain_password: str, hashed_password: bytes) -> bool:
    """
    Verifica si una contraseña en texto plano coincide con un hash.

    Args:
        plain_password (str): La contraseña en texto plano a verificar.
        hashed_password (bytes): El hash contra el que se va a comparar.

    Returns:
        bool: True si la contraseña es correcta, False en caso contrario.
    """
    password_bytes = plain_password.encode('utf-8')
    # bcrypt.checkpw compara de forma segura la contraseña con el hash.
    return bcrypt.checkpw(password_bytes, hashed_password)