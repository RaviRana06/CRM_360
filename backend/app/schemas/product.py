from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class ProductBase(BaseModel):
    product_code: str
    name: str
    description: Optional[str] = None
    category: Optional[str] = "General"
    unit_price: float = 0.0
    tax_rate: Optional[float] = 18.0
    unit_of_measure: Optional[str] = "Units"
    is_active: Optional[bool] = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    product_code: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    unit_price: Optional[float] = None
    tax_rate: Optional[float] = None
    unit_of_measure: Optional[str] = None
    is_active: Optional[bool] = None

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
