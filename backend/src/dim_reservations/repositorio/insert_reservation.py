from src.utils.conexion import Conexion
from src.dim_reservations.reservation_model import Reservation


def insert_reservation(data_reservation: Reservation, object_coon: Conexion) -> bool:
    query = """
INSERT INTO `dim_reservation` (
    `DIM_ReservationId`,
    `DIM_PeopleId`,
    `DIM_StatusId`,
    `DIM_DateId`,
    `DIM_ServiceOwnersId`,
    `DIM_EventAddress`,
    `DIM_StartDate`,
    `DIM_EndDate`,
    `DIM_NHours`,
    `DIM_TotalAmount`,
    `DIM_Notes`
    )
    VALUES (
        %s,
        %s,
        %s,
        %s,
        %s,
        %s,
        %s,
        %s,
        %s,
        %s,
        %s  -- Este era el que faltaba
    );
    """
    try:
        values = (
            data_reservation.DIM_ReservationId,
            data_reservation.DIM_PeopleId,
            data_reservation.DIM_StatusId,
            data_reservation.DIM_DateId,
            data_reservation.DIM_ServiceOwnersId,
            data_reservation.DIM_EventAddress,
            data_reservation.DIM_StartDate,
            data_reservation.DIM_EndDate,
            data_reservation.DIM_NHours,
            data_reservation.DIM_TotalAmount,
            data_reservation.DIM_Notes
        )
        print(f"Estos son los valores: {values}")
        print(f"Esto es la query: {query}")
        object_coon.cursor.execute(query, values)
        
        print("✅ Cambios guardados correctamente")
        object_coon.save_changes()
        
        return True
    except Exception as err:
        print(f"Error al insertar la persona: {err}")
        return False