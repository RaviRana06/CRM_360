from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db.base import Base

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    lead_name = Column(String(150), nullable=False, index=True)
    company_name = Column(String(150), nullable=True, index=True)
    contact_name = Column(String(100), nullable=True)
    email = Column(String(150), nullable=True)
    phone = Column(String(50), nullable=True)
    lead_source = Column(String(50), default="Website")  # Website, Referral, Cold Call, Exhibition, Social Media
    
    status = Column(String(50), default="New", index=True)  # New, Contacted, Qualified, Disqualified, Closed
    estimated_budget = Column(Float, default=0.0)
    requirement = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    disqualification_reason = Column(String(255), nullable=True)

    assigned_to_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    created_by_id = Column(Integer, ForeignKey("employees.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    assigned_to = relationship("Employee", foreign_keys=[assigned_to_id])
    created_by = relationship("Employee", foreign_keys=[created_by_id])
    opportunity = relationship("Opportunity", back_populates="lead", uselist=False)
