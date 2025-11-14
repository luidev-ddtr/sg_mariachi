from src.utils.conexion import Conexion

def get_contract_info(dim_reservation_id: str, conexion: Conexion) -> dict:
    """
    Obtiene la informacion de una reservacion, para mostrarla como contrato
    """
    query = """
    SELECT 
    Vrsv.DIM_fullname AS contratante_nombre,
    rsv.DIM_EventAddress  AS evento_locacion,
    Vrsv.FullDate AS evento_fecha,
    rsv.DIM_NHours AS evento_horas,	
    Vrsv.DIM_StartDate AS evento_hora_inicio,
    Vrsv.DIM_EndDate AS evento_hora_fin,
    Vrsv.DIM_TotalAmount AS pago_total,
    people.DIM_Address AS contratante_domicilio,
    people.DIM_PhoneNumber AS contratante_telefono,
    people.DIM_SecondPhoneNumber AS contratante_segundo_telefono
    FROM vista_reservaciones AS Vrsv
    JOIN dim_reservation AS rsv 
        ON rsv.DIM_ReservationId = Vrsv.DIM_ReservationId
    JOIN dim_people AS people 
        ON rsv.DIM_PeopleId = people.DIM_PeopleId
    -- 
    -- Aqui se tendran que agregar los datos de pago despues
    -- Todo lo de fact revenue.
    WHERE Vrsv.DIM_ReservationId = %s;
    """
    
    try:
        conexion.cursor.execute(query, (dim_reservation_id,))
        result = conexion.cursor.fetchone()
        print(result)
        return result
    except Exception as e:
        print(f"Error al obtener la informacion de la reservacion: {e}")
        return None