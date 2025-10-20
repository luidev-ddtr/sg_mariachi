from re import fullmatch
from typing import  Dict, Any


class DIM_DATE_MODEL:
    """
    Modelo puro que representa la estructura de la tabla DIM_Date.
    Solo contiene datos y métodos básicos de transformación.
    """
    def __init__(self, DIM_DateId: str , FullDate: str , 
        Year: int, Month: int, Week: int, Day:int) -> None:
        """
        Constructor con todos los campos requeridos por el schema.
        
        Args:
            DIM_DateId: Identificador único en formato AAAAMMDD (20230815)
            FullDate: Formato '25/03/1990'
            Year: Año numérico 2023
            Month: Mes en formato 8
            Week: Semana en formato 3
            Day: Día en formato 15
            #SE checa si mejor cambiar a string para mantener los 0 aunque no sea lexicograficamente  correctos
        """
        self.DIM_DateId = DIM_DateId
        self.FullDate = FullDate
        self.Year = Year
        self.Month = Month
        self.Week = Week
        self.Day = Day
    
    def to_dict(self) -> Dict[str, Any]:
        """Convierte el modelo a diccionario para operaciones CRUD"""
        return {
            'DIM_DateId': self.DIM_DateId,
            'FiscalYear': self.FullDate,
            'Year': self.Year,
            'Month': self.Month,
            'Week': self.Week,
            'Day': self.Day
        }
    
    def __str__(self) -> str:
        """Representación legible del modelo"""
        return (f"DateID: {self.DIM_DateId} | "
                f"Fecha completa: {self.FullDate} "
                f"Calendar: {self.Year}-{self.Month}-{self.Day}-{self.Day}")
    
    def to_tuple(self) -> tuple:
        """
        Convierte el modelo a una tupla en el orden correcto para INSERT SQL.
        
        Returns:
            tuple: (DIM_DateId, FiscalYear, FiscalMonth, FiscalQuarter, FiscalWeek,
                   FiscalDay, Year, Month, Week, Day)
        """
        return (
            self.DIM_DateId,
            self.FullDate,
            self.Year,
            self.Month,
            self.Week,
            self.Day
        )