from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class OpportunityBase(BaseModel):
    opportunity_name: str
    customer_name: str
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    expected_value: Optional[float] = 0.0
    probability: Optional[int] = 50
    expected_close_date: Optional[datetime] = None
    stage: Optional[str] = "Opportunity"  # Opportunity, Proposal, Negotiation, Won, Lost
    lost_reason: Optional[str] = None
    description: Optional[str] = None
    assigned_to_id: Optional[int] = None
    lead_id: Optional[int] = None

class OpportunityCreate(OpportunityBase):
    pass

class OpportunityUpdate(BaseModel):
    opportunity_name: Optional[str] = None
    customer_name: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    expected_value: Optional[float] = None
    probability: Optional[int] = None
    expected_close_date: Optional[datetime] = None
    stage: Optional[str] = None
    lost_reason: Optional[str] = None
    description: Optional[str] = None
    assigned_to_id: Optional[int] = None

class OpportunityStageUpdate(BaseModel):
    stage: str
    lost_reason: Optional[str] = None

class OpportunityResponse(OpportunityBase):
    id: int
    created_by_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
