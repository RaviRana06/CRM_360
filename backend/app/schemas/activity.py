from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ActivityBase(BaseModel):
    activity_type: str  # Call, Email, Visit, Follow-up, Note
    subject: str
    notes: Optional[str] = None
    lead_id: Optional[int] = None
    opportunity_id: Optional[int] = None
    account_id: Optional[int] = None
    contact_id: Optional[int] = None

class ActivityCreate(ActivityBase):
    pass

class ActivityResponse(ActivityBase):
    id: int
    performed_by_id: int
    created_at: datetime

    class Config:
        from_attributes = True
