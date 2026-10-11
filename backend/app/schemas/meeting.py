from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MeetingBase(BaseModel):
    subject: str
    meeting_date: datetime
    start_time: Optional[str] = "10:00 AM"
    end_time: Optional[str] = "11:00 AM"
    location: Optional[str] = None
    participants: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = "Scheduled"  # Scheduled, Completed, Cancelled, Rescheduled
    lead_id: Optional[int] = None
    opportunity_id: Optional[int] = None
    account_id: Optional[int] = None
    contact_id: Optional[int] = None
    assigned_to_id: Optional[int] = None

class MeetingCreate(MeetingBase):
    pass

class MeetingUpdate(BaseModel):
    subject: Optional[str] = None
    meeting_date: Optional[datetime] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    location: Optional[str] = None
    participants: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    assigned_to_id: Optional[int] = None

class MeetingResponse(MeetingBase):
    id: int
    created_by_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
