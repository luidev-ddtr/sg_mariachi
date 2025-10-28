
class Reservation():
    
    def __init__(self,
                DIM_ReservationId: str,
                DIM_PeopleId: str,
                DIM_StatusId: str,
                DIM_DateId: str,
                DIM_ServiceOwnersId: str,
                DIM_EventAddress: str,
                DIM_StartDate: str,
                DIM_EndDate: str,
                DIM_NHours: float,
                DIM_TotalAmount: int,
                DIM_Notes: str):
        self.DIM_ReservationId = DIM_ReservationId
        self.DIM_PeopleId = DIM_PeopleId
        self.DIM_StatusId = DIM_StatusId
        self.DIM_DateId = DIM_DateId
        self.DIM_ServiceOwnersId = DIM_ServiceOwnersId
        self.DIM_EventAddress = DIM_EventAddress
        self.DIM_StartDate = DIM_StartDate
        self.DIM_EndDate = DIM_EndDate
        self.DIM_NHours = DIM_NHours
        self.DIM_TotalAmount = DIM_TotalAmount
        self.DIM_Notes = DIM_Notes
    def to_dict(self):
        return {
            'DIM_ReservationId': self.DIM_ReservationId,
            'DIM_PeopleId': self.DIM_PeopleId,
            'DIM_StatusId': self.DIM_StatusId,
            'DIM_DateId': self.DIM_DateId,
            'DIM_ServiceOwnersId': self.DIM_ServiceOwnersId,
            'DIM_EventAddress': self.DIM_EventAddress,
            'DIM_StartDate': str(self.DIM_StartDate) if self.DIM_StartDate else None,
            'DIM_EndDate': str(self.DIM_EndDate) if self.DIM_EndDate else None,
            'DIM_NHours': self.DIM_NHours,
            'DIM_TotalAmount': self.DIM_TotalAmount,
            'DIM_Notes': self.DIM_Notes,
        }

    def __str__(self):
        return (f"ReservationID: {self.DIM_ReservationId} | "
                f"PeopleID: {self.DIM_PeopleId} | "
                f"StatusID: {self.DIM_StatusId} | "
                f"DateID: {self.DIM_DateId} | "
                f"ServiceOwnersID: {self.DIM_ServiceOwnersId} | "
                f"EventAddress: {self.DIM_EventAddress} | "
                f"StartDate: {self.DIM_StartDate} | "
                f"EndDate: {self.DIM_EndDate} | "
                f"NHours: {self.DIM_NHours} | "
                f"TotalAmount: {self.DIM_TotalAmount} | "
                f"Notes: {self.DIM_Notes} | "
                )
        