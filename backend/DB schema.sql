CREATE TABLE `DIM_ServiceOwners` (
  `DIM_ServiceOwnersId` varchar(255) PRIMARY KEY,
  `DIM_Username` varchar(255) NOT NULL UNIQUE,
  `DIM_Password` varchar(255) NOT NULL,
  `DIM_EmployeeId` varchar(255),
  `DIM_Timestamp` timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `DIM_Employee` (
  `DIM_EmployeeId` varchar(255) PRIMARY KEY,
  `DIM_PersonId` varchar(255),
  `DIM_Position` varchar(255) NOT NULL,
  `DIM_DateId` varchar(255),
  `DIM_Timestamp` timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `DIM_People` (
  `DIM_PeopleId` varchar(255) PRIMARY KEY,
  `DIM_Name` varchar(120) NOT NULL,
  `DIM_SecondName` varchar(50) NOT NULL, -- Nuevo campo
  `DIM_LastName` varchar(255) NOT NULL,
  `DIM_SecondLastName` varchar(50) NOT NULL, -- Nuevo campo
  `DIM_Address` varchar(255),
  `DIM_PhoneNumber` varchar(10) NOT NULL,
  `DIM_SecondPhoneNumber` varchar(10),
  `DIM_DateId` varchar(255),
  `DIM_Timestamp` timestamp DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE `DIM_Date` (
  `DIM_DateId` varchar(255) PRIMARY KEY,
  `FullDate` date NOT NULL,
  `Year` integer NOT NULL,
  `Month` integer NOT NULL,
  `Week` integer NOT NULL,
  `Day` integer NOT NULL,
  `DIM_Timestamp` timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `DIM_Status` (
  `DIM_StatusId` varchar(255) PRIMARY KEY,
  `DIM_StatusName` varchar(40) NOT NULL,
  `DIM_Timestamp` timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `DIM_Reservation` (
  `DIM_ReservationId` varchar(255) PRIMARY KEY,
  `DIM_PeopleId` varchar(255),
  `DIM_ServiceOwnersId` varchar(255),
  `DIM_Address` varchar(255),
  `DIM_StartDate` date,
  `DIM_EndDate` date,
  `DIM_NHours` integer NOT NULL,
  `DIM_TotalAmount` decimal(10,2) NOT NULL,
  `DIM_Notes` varchar(255),
  `DIM_StatusId` varchar(255),
  `DIM_DateId` varchar(255),
  `DIM_Timestamp` timestamp DEFAULT CURRENT_TIMESTAMP,
  CHECK (`DIM_NHours` > 0),
  CHECK (`DIM_TotalAmount` >= 0)
);

CREATE TABLE `FACT_Revenue` (
  `FACT_RevenueId` varchar(255) PRIMARY KEY,
  `DIM_ReservationId` varchar(255),
  `DIM_DateId` varchar(255),
  `FACT_PaymentAmount` decimal(10,2) NOT NULL,
  `FACT_Timestamp` timestamp DEFAULT CURRENT_TIMESTAMP,
  CHECK (`FACT_PaymentAmount` >= 0)
);

-- Foreign Keys
ALTER TABLE `DIM_ServiceOwners` ADD FOREIGN KEY (`DIM_EmployeeId`) REFERENCES `DIM_Employee` (`DIM_EmployeeId`);

ALTER TABLE `DIM_Employee` ADD FOREIGN KEY (`DIM_PersonId`) REFERENCES `DIM_People` (`DIM_PeopleId`);

ALTER TABLE `DIM_Employee` ADD FOREIGN KEY (`DIM_DateId`) REFERENCES `DIM_Date` (`DIM_DateId`);

ALTER TABLE `DIM_Reservation` ADD FOREIGN KEY (`DIM_PeopleId`) REFERENCES `DIM_People` (`DIM_PeopleId`);

ALTER TABLE `DIM_Reservation` ADD FOREIGN KEY (`DIM_StatusId`) REFERENCES `DIM_Status` (`DIM_StatusId`);

ALTER TABLE `DIM_Reservation` ADD FOREIGN KEY (`DIM_DateId`) REFERENCES `DIM_Date` (`DIM_DateId`);

ALTER TABLE `FACT_Revenue` ADD FOREIGN KEY (`DIM_ReservationId`) REFERENCES `DIM_Reservation` (`DIM_ReservationId`);

ALTER TABLE `FACT_Revenue` ADD FOREIGN KEY (`DIM_DateId`) REFERENCES `DIM_Date` (`DIM_DateId`);

ALTER TABLE `DIM_People` ADD FOREIGN KEY (`DIM_DateId`) REFERENCES `DIM_Date` (`DIM_DateId`);

ALTER TABLE `DIM_Reservation` ADD FOREIGN KEY (`DIM_ServiceOwnersId`) REFERENCES `DIM_ServiceOwners` (`DIM_ServiceOwnersId`);