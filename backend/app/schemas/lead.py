from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

class LeadBase(BaseModel):
    lead_name: str
    company_name: Optional[str] = None
    contact_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    lead_source: Optional[str] = "Website"
    status: Optional[str] = "New"
    estimated_budget: Optional[float] = 0.0
    requirement: Optional[str] = None
    notes: Optional[str] = None
    assigned_to_id: Optional[int] = None

class LeadCreate(LeadBase):
    pass

class LeadUpdate(BaseModel):
    lead_name: Optional[str] = None
    company_name: Optional[str] = None
    contact_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    lead_source: Optional[str] = None
    status: Optional[str] = None
    estimated_budget: Optional[float] = None
    requirement: Optional[str] = None
    notes: Optional[str] = None
    assigned_to_id: Optional[int] = None

class LeadQualify(BaseModel):
    expected_value: Optional[float] = None
    probability: Optional[int] = 60
    notes: Optional[str] = None

class LeadDisqualify(BaseModel):
    disqualification_reason: str

class LeadResponse(LeadBase):
    id: int
    disqualification_reason: Optional[str] = None
    created_by_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
