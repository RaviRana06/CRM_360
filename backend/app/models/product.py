from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime
from app.core.db.base import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    product_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(50), default="General", index=True) # Software, Hardware, Consulting, Subscription, Services
    unit_price = Column(Float, default=0.0, nullable=False)
    tax_rate = Column(Float, default=18.0) # Percentage (e.g., 18.0 for 18% GST/VAT)
    unit_of_measure = Column(String(30), default="Units") # Units, Hours, License, Month, Year
    is_active = Column(Boolean, default=True, index=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
