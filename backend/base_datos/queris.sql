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