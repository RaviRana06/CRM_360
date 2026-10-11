from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class QuoteItemBase(BaseModel):
    product_id: Optional[int] = None
    product_name: str
    description: Optional[str] = None
    quantity: float = 1.0
    unit_price: float = 0.0
    discount_percent: Optional[float] = 0.0
    total_price: float = 0.0

class QuoteItemCreate(QuoteItemBase):
    pass

class QuoteItemResponse(QuoteItemBase):
    id: int
    quote_id: int

    class Config:
        from_attributes = True

class QuoteBase(BaseModel):
    quote_number: str
    opportunity_id: Optional[int] = None
    account_id: Optional[int] = None
    status: Optional[str] = "Draft"
    subtotal: Optional[float] = 0.0
    discount_amount: Optional[float] = 0.0
    tax_amount: Optional[float] = 0.0
    total_amount: Optional[float] = 0.0
    valid_until: Optional[datetime] = None
    notes: Optional[str] = None
    terms_and_conditions: Optional[str] = None

class QuoteCreate(QuoteBase):
    items: List[QuoteItemCreate] = []

class QuoteUpdate(BaseModel):
    opportunity_id: Optional[int] = None
    account_id: Optional[int] = None
    status: Optional[str] = None
    subtotal: Optional[float] = None
    discount_amount: Optional[float] = None
    tax_amount: Optional[float] = None
    total_amount: Optional[float] = None
    valid_until: Optional[datetime] = None
    notes: Optional[str] = None
    terms_and_conditions: Optional[str] = None
    items: Optional[List[QuoteItemCreate]] = None

class QuoteResponse(QuoteBase):
    id: int
    created_by_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    items: List[QuoteItemResponse] = []

    class Config:
        from_attributes = True
