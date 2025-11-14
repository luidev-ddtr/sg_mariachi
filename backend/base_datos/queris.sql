CREATE VIEW SecurityUsers AS 
SELECT
    CONCAT(people.DIM_Name, ' ', people.DIM_secondName, ' ', people.DIM_LastName, ' ', people.DIM_secondLastName) AS fullname,
    svo.DIM_Username,
    svo.DIM_Password,
    employe.DIM_Position,
    people.DIM_PeopleId,
    svo.DIM_ServiceOwnersId
FROM
    DIM_serviceOwners AS svo
JOIN dim_employe AS employe
    ON employe.DIM_EmployeeId = svo.DIM_EmployeeId
JOIN dim_people AS people
    ON people.DIM_PeopleId = employe.DIM_PersonId;



--Vista para poder ver los eventos y filtrar por fechas

SELECT
    vista_reservaciones.*
FROM
    vista_reservaciones
JOIN DIM_Date AS dates
ON
    dates.DIM_DateId = vista_reservaciones.DIM_DateId
WHERE
    dates.Year = ? AND dates.Month = ? AND dates.WEEK = ? 


--Vista para poder ver todos los eventos de manera facil
CREATE VIEW vista_reservaciones AS
SELECT
    -- Corregido: Uso de comas para separar los argumentos en CONCAT()
    CONCAT(
        cliente.DIM_Name, ' ', 
        cliente.DIM_SecondName, ' ', 
        cliente.DIM_LastName, ' ', 
        cliente.DIM_SecondLastName
    ) AS DIM_fullname,
    cliente.DIM_PhoneNumber,
    dates.FullDate,
    rsv.DIM_StartDate,
    rsv.DIM_EndDate,
    rsv.DIM_TotalAmount,
    estado.DIM_StatusName,
    dates.DIM_DateId
FROM 
    DIM_Reservation AS rsv
JOIN 
    DIM_People AS cliente ON cliente.DIM_PeopleId = rsv.DIM_PeopleId
JOIN 
    DIM_Date as dates on 
dates.DIM_DateId = rsv.DIM_DateId
JOIN 
    DIM_Status AS estado ON rsv.DIM_StatusId = estado.DIM_StatusId;


--Query para editar datos 
--Solo que hubo un conflicto, el conflicto es que: si se cambia la fecha, entonces se perdera el registro de cuando se modifico esta reservacion.
UPDATE
    `dim_reservation`
SET
	`dim_dateId` = %s,
    `DIM_StartDate` = %s,
    `DIM_EndDate` = %s,
    `DIM_NHours` = %s,
    `DIM_TotalAmount` = %s,
    `DIM_Notes` = 
WHERE
    `DIM_ReservationId` = %s



--Coinsulta para archivar un starus, como es pura informacion estatica se utiliza un valor por defecto 

UPDATE
    `dim_reservation`
SET
    `DIM_StatusId` = 'cw42055f-3ecb-9099'
WHERE
    DIM_ReservationId = %s;



--Consulta para obtener el id del status de una reservacion
SELECT
    st.DIM_StatusName
FROM
    DIM_Reservation AS rsv
JOIN DIM_Status AS st
ON
    st.DIM_StatusId = rsv.DIM_StatusId
WHERE DIM_ReservationId = %s;


--Funcion para a

    UPDATE
        dim_people
    SET
        DIM_SecondPhoneNumber = %s
    WHERE
        DIM_PeopleId = %s;

//Data para crear la vista de pagos:
data = Claro, aquí tienes la lista de todos los id de tu HTML:
* contratante_nombre --listo
* evento_lugar --FALTA --listo
* evento_dia --listo
* evento_mes --listo
* evento_anio --listo
* evento_horas --Falta --listo
* evento_hora_inicio --listo
* evento_hora_fin  --listo
* pago_total --listo
* pago_anticipo --falta
* pago_restante --Falta 
* contratante_domicilio --falta --listo
* contratante_telefono  --listo
* contrato_dia --listo
* contrato_mes  --se obtiene del frontend xd
* contrato_anio --listo

--Vista para poder ver todos los eventos de manera facil
CREATE VIEW vista_reservaciones AS
SELECT
    -- Corregido: Uso de comas para separar los argumentos en CONCAT()
    CONCAT(
        cliente.DIM_Name, ' ', 
        cliente.DIM_SecondName, ' ', 
        cliente.DIM_LastName, ' ', 
        cliente.DIM_SecondLastName
    ) AS DIM_fullname,  contratante_nombre
    cliente.DIM_PhoneNumber, contratante_telefono
    dates.FullDate, evento_dia evento_mes evento_anio
    rsv.DIM_StartDate, evento_hora_inicio
    rsv.DIM_EndDate, evento_hora_fin
    rsv.DIM_TotalAmount, pago_total
    estado.DIM_StatusName,
    dates.DIM_DateId
FROM 
    DIM_Reservation AS rsv
JOIN 
    DIM_People AS cliente ON cliente.DIM_PeopleId = rsv.DIM_PeopleId
JOIN 
    DIM_Date as dates on 
dates.DIM_DateId = rsv.DIM_DateId
JOIN 
    DIM_Status AS estado ON rsv.DIM_StatusId = estado.DIM_StatusId;


--CODIGO DE LA VISTA ACTUALIZADO

-- ======================================================================
-- Nombre: obtener_informacion_completa_reservaciones
-- Descripción:
--   Esta consulta obtiene toda la información relevante de una reservación,
--   combinando datos provenientes de:
--     - vista_reservaciones (información calculada y consolidada)
--     - dim_reservation (datos generales de la reservación)
--     - dim_people (información del cliente)
--
--   Incluye: nombre completo, dirección del evento, fechas, horas contratadas,
--   montos totales y dirección del cliente.  
--   *Pendiente:* agregar datos de pagos anticipados cuando la estructura esté definida.
-- ======================================================================
--id de la reservacion DE PRUEBA: 4e4dad3d-e0ce-5a29
SELECT 
    Vrsv.DIM_fullname,
    rsv.DIM_EventAddress,
    Vrsv.FullDate,
    rsv.DIM_NHours,	
    Vrsv.DIM_StartDate,
    Vrsv.DIM_EndDate,
    Vrsv.DIM_TotalAmount,
    people.DIM_Address
FROM vista_reservaciones AS Vrsv
JOIN dim_reservation AS rsv 
    ON rsv.DIM_ReservationId = Vrsv.DIM_ReservationId
JOIN dim_people AS people 
    ON rsv.DIM_PeopleId = people.DIM_PeopleId
WHERE DIM_ReservationId = '4e4dad3d-e0ce-5a29'

--Consulta con los nombres neserarios, para front
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
WHERE Vrsv.DIM_ReservationId = '4e4dad3d-e0ce-5a29';


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