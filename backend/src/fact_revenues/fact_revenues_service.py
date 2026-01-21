from src.utils.conexion import Conexion



class FactRevenuesService:
    def __init__(self, conn : Conexion):
        self.conn = conn
        