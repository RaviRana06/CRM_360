from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db.base import Base

class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)
    opportunity_name = Column(String(150), nullable=False, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True)
    
    customer_name = Column(String(150), nullable=False)
    contact_name = Column(String(100), nullable=True)
    contact_email = Column(String(150), nullable=True)
    contact_phone = Column(String(50), nullable=True)

    expected_value = Column(Float, default=0.0)
    probability = Column(Integer, default=50)  # Percentage 0-100
    expected_close_date = Column(DateTime, nullable=True)

    # Stages: Opportunity -> Proposal -> Negotiation -> Won / Lost
    stage = Column(String(50), default="Opportunity", index=True)
    lost_reason = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)

    assigned_to_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    created_by_id = Column(Integer, ForeignKey("employees.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    lead = relationship("Lead", back_populates="opportunity")
    assigned_to = relationship("Employee", foreign_keys=[assigned_to_id])
    created_by = relationship("Employee", foreign_keys=[created_by_id])
