from typing import Any, List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.db.session import get_db
from app.api.deps import get_current_user
from app.models.employee import Employee
from app.models.invoice import Invoice, InvoiceItem
from app.schemas.invoice import InvoiceCreate, InvoiceUpdate, InvoiceResponse

router = APIRouter()

class PayInvoiceRequest(BaseModel):
    amount: float

def _recalculate_invoice(invoice: Invoice, items_in):
    """Calculates subtotal, tax, and totals for an invoice."""
    subtotal = 0.0
    invoice_items = []
    
    for item in items_in:
        item_qty = float(item.quantity)
        unit_price = float(item.unit_price)
        disc_pct = float(item.discount_percent or 0.0)
        
        raw_total = item_qty * unit_price
        disc_val = raw_total * (disc_pct / 100.0)
        final_total = raw_total - disc_val
        
        subtotal += final_total
        
        inv_item = InvoiceItem(
            product_id=item.product_id,
            product_name=item.product_name,
            description=item.description,
            quantity=item_qty,
            unit_price=unit_price,
            discount_percent=disc_pct,
            total_price=final_total
        )
        invoice_items.append(inv_item)

    tax_amount = subtotal * 0.18
    discount_amount = invoice.discount_amount or 0.0
    total_amount = (subtotal + tax_amount) - discount_amount

    invoice.subtotal = subtotal
    invoice.tax_amount = tax_amount
    invoice.total_amount = max(total_amount, 0.0)
    return invoice_items


@router.get("", response_model=List[InvoiceResponse], summary="List Invoices")
def get_invoices(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500)
) -> Any:
    """Retrieve invoices list with pagination and search."""
    query = db.query(Invoice)

    if status_filter:
        query = query.filter(Invoice.status == status_filter)

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(Invoice.invoice_number.ilike(search_fmt))

    return query.order_by(Invoice.created_at.desc()).offset(skip).limit(limit).all()


@router.post("", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED, summary="Create Invoice")
def create_invoice(
    invoice_in: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """Create a new invoice with line items."""
    existing = db.query(Invoice).filter(Invoice.invoice_number == invoice_in.invoice_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Invoice number already exists.")

    inv_data = invoice_in.model_dump(exclude={"items"})
    invoice = Invoice(**inv_data, created_by_id=current_user.id)
    
    if not invoice.due_date:
        invoice.due_date = datetime.utcnow() + timedelta(days=15)

    inv_items = _recalculate_invoice(invoice, invoice_in.items)
    invoice.items = inv_items

    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice


@router.get("/{invoice_id}", response_model=InvoiceResponse, summary="Get Invoice Details")
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """Retrieve invoice details and items."""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found.")
    return invoice


@router.put("/{invoice_id}", response_model=InvoiceResponse, summary="Update Invoice")
def update_invoice(
    invoice_id: int,
    invoice_in: InvoiceUpdate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """Update invoice metadata and status."""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    update_data = invoice_in.model_dump(exclude_unset=True, exclude={"items"})
    for field, val in update_data.items():
        setattr(invoice, field, val)

    if invoice_in.items is not None:
        db.query(InvoiceItem).filter(InvoiceItem.invoice_id == invoice.id).delete()
        invoice.items = _recalculate_invoice(invoice, invoice_in.items)

    db.commit()
    db.refresh(invoice)
    return invoice


@router.post("/{invoice_id}/pay", response_model=InvoiceResponse, summary="Record Payment on Invoice")
def pay_invoice(
    invoice_id: int,
    payment_in: PayInvoiceRequest,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """Record a payment against an invoice and update status."""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    invoice.paid_amount = (invoice.paid_amount or 0.0) + payment_in.amount
    
    if invoice.paid_amount >= invoice.total_amount:
        invoice.status = "Paid"
    elif invoice.paid_amount > 0:
        invoice.status = "Partially Paid"

    db.commit()
    db.refresh(invoice)
    return invoice


@router.delete("/{invoice_id}", summary="Delete Invoice")
def delete_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """Delete an invoice record."""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    db.delete(invoice)
    db.commit()
    return {"message": f"Invoice #{invoice_id} deleted."}
