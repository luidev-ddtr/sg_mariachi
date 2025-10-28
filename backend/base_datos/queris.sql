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
