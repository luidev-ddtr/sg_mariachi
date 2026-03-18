from src.fact_revenues.fact_revenues_model import FactRevenues
from src.utils.conexion import Conexion

def insert_payAmount(data_fact_revenues: FactRevenues, object_coon: Conexion) -> bool:
    """
    Inserta un registro de pago (FactRevenue) en la base de datos.
    
    :param data_fact_revenues: Objeto del modelo FactRevenues con los datos a insertar.
    :param object_coon: Instancia de conexión a la base de datos.
    :return: True si la inserción fue exitosa y se confirmaron cambios, False si hubo error.
    """

    query ="""
    INSERT INTO `fact_revenue` (
        `FACT_RevenueId`,  
        `DIM_ReservationId`, 
        `DIM_DateId`, 
        `FACT_PaymentAmount`
        ) 
        
        VALUES (
            %s,
            %s,
            %s,
            %s
        );
    """

    try:
        values = (
            data_fact_revenues.FACT_RevenueId,
            data_fact_revenues.DIM_ReservationId,
            data_fact_revenues.DIM_DateId,
            data_fact_revenues.FACT_PaymentAmount
        )
        print(f"Estos son los valores que se ingresaran: {values}")
        print(f"Esta es la query: {query}")
        object_coon.cursor.execute(query, values)

        print("Cambios guardados correctamente. Reserva creada")
        object_coon.save_changes()

        return True
    except Exception as err:
        print(f"Error al registrar la reserva: {err}")
        object_coon.conn.rollback()
        return False
