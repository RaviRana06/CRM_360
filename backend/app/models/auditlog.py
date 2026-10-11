from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db.base import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    user_name = Column(String(150), nullable=True)
    action = Column(String(100), nullable=False)  # Login, Create, Update, Delete, Qualify, Stage Change
    module = Column(String(100), nullable=False)  # Leads, Opportunities, Accounts, Roles, Geo, etc.
    record_id = Column(String(50), nullable=True)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("Employee", foreign_keys=[user_id])
