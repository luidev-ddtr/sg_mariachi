--VALIDAR SI  UN CLIENTE EXISTE
    SELECT
        DIM_PeopleId
    FROM
        DIM_People
    WHERE
        LOWER(DIM_Name) = LOWER(%s)
        AND         (
            -- Caso A: el parámetro del segundo nombre viene vacío o NULL
            (%s IS NULL OR TRIM(%s) = '')
            AND (DIM_SecondName IS NULL OR TRIM(DIM_SecondName) = '')
        )
        OR
        (
            -- Caso B: el parámetro del segundo nombre tiene contenido
            ( %s IS NOT NULL AND TRIM(%s) <> '' )
            AND LOWER(TRIM(DIM_SecondName)) = LOWER(TRIM(%s))
        )
        AND LOWER(DIM_LastName) = LOWER(%s)
        AND LOWER(DIM_SecondLastName) = LOWER(%s)
        AND LOWER(DIM_Address) = LOWER(%s)
        AND DIM_PhoneNumber = %s
        AND DIM_SecondPhoneNumber = %s
    LIMIT 1;