from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class InvoiceItemBase(BaseModel):
    product_id: Optional[int] = None
    product_name: str
    description: Optional[str] = None
    quantity: float = 1.0
    unit_price: float = 0.0
    discount_percent: Optional[float] = 0.0
    total_price: float = 0.0

class InvoiceItemCreate(InvoiceItemBase):
    pass

class InvoiceItemResponse(InvoiceItemBase):
    id: int
    invoice_id: int

    class Config:
        from_attributes = True

class InvoiceBase(BaseModel):
    invoice_number: str
    quote_id: Optional[int] = None
    opportunity_id: Optional[int] = None
    account_id: Optional[int] = None
    status: Optional[str] = "Draft"
    issue_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    subtotal: Optional[float] = 0.0
    discount_amount: Optional[float] = 0.0
    tax_amount: Optional[float] = 0.0
    total_amount: Optional[float] = 0.0
    paid_amount: Optional[float] = 0.0
    notes: Optional[str] = None

class InvoiceCreate(InvoiceBase):
    items: List[InvoiceItemCreate] = []

class InvoiceUpdate(BaseModel):
    quote_id: Optional[int] = None
    opportunity_id: Optional[int] = None
    account_id: Optional[int] = None
    status: Optional[str] = None
    issue_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    subtotal: Optional[float] = None
    discount_amount: Optional[float] = None
    tax_amount: Optional[float] = None
    total_amount: Optional[float] = None
    paid_amount: Optional[float] = None
    notes: Optional[str] = None
    items: Optional[List[InvoiceItemCreate]] = None

class InvoiceResponse(InvoiceBase):
    id: int
    created_by_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    items: List[InvoiceItemResponse] = []

    class Config:
        from_attributes = True
