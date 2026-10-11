from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CheckInRequest(BaseModel):
    latitude: float
    longitude: float
    address: Optional[str] = None
    account_id: Optional[int] = None
    contact_id: Optional[int] = None
    purpose: Optional[str] = "Customer Visit"
    remarks: Optional[str] = None

class CheckOutRequest(BaseModel):
    visit_id: int
    latitude: float
    longitude: float
    address: Optional[str] = None
    remarks: Optional[str] = None

class GeoVisitResponse(BaseModel):
    id: int
    employee_id: int
    account_id: Optional[int] = None
    contact_id: Optional[int] = None
    check_in_time: datetime
    check_out_time: Optional[datetime] = None
    check_in_latitude: float
    check_in_longitude: float
    check_in_address: Optional[str] = None
    check_out_latitude: Optional[float] = None
    check_out_longitude: Optional[float] = None
    check_out_address: Optional[str] = None
    purpose: Optional[str] = None
    remarks: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
