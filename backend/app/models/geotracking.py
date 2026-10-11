from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db.base import Base

class GeoVisit(Base):
    __tablename__ = "geo_visits"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=True)

    check_in_time = Column(DateTime, default=datetime.utcnow)
    check_out_time = Column(DateTime, nullable=True)

    check_in_latitude = Column(Float, nullable=False)
    check_in_longitude = Column(Float, nullable=False)
    check_in_address = Column(String(255), nullable=True)

    check_out_latitude = Column(Float, nullable=True)
    check_out_longitude = Column(Float, nullable=True)
    check_out_address = Column(String(255), nullable=True)

    purpose = Column(String(200), nullable=True)
    remarks = Column(Text, nullable=True)
    status = Column(String(50), default="Checked-In")  # Checked-In, Checked-Out

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    employee = relationship("Employee", foreign_keys=[employee_id])
    account = relationship("Account", foreign_keys=[account_id])
    contact = relationship("Contact", foreign_keys=[contact_id])
