from typing import Any, List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.db.session import get_db
from app.api.deps import get_current_user
from app.models.employee import Employee
from app.models.quote import Quote, QuoteItem
from app.models.invoice import Invoice, InvoiceItem
from app.schemas.quote import QuoteCreate, QuoteUpdate, QuoteResponse
from app.schemas.invoice import InvoiceResponse

router = APIRouter()

def _recalculate_quote(quote: Quote, items_in):
    """Calculates subtotal, tax, and totals for a quote."""
    subtotal = 0.0
    quote_items = []
    
    for item in items_in:
        item_qty = float(item.quantity)
        unit_price = float(item.unit_price)
        disc_pct = float(item.discount_percent or 0.0)
        
        raw_total = item_qty * unit_price
        disc_val = raw_total * (disc_pct / 100.0)
        final_total = raw_total - disc_val
        
        subtotal += final_total
        
        quote_item = QuoteItem(
            product_id=item.product_id,
            product_name=item.product_name,
            description=item.description,
            quantity=item_qty,
            unit_price=unit_price,
            discount_percent=disc_pct,
            total_price=final_total
        )
        quote_items.append(quote_item)

    tax_amount = subtotal * 0.18 # Standard 18% tax
    discount_amount = quote.discount_amount or 0.0
    total_amount = (subtotal + tax_amount) - discount_amount

    quote.subtotal = subtotal
    quote.tax_amount = tax_amount
    quote.total_amount = max(total_amount, 0.0)
    return quote_items


@router.get("", response_model=List[QuoteResponse], summary="List Quotations")
def get_quotes(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500)
) -> Any:
    """Retrieve quotes list with pagination and search."""
    query = db.query(Quote)

    if status_filter:
        query = query.filter(Quote.status == status_filter)

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(Quote.quote_number.ilike(search_fmt))

    return query.order_by(Quote.created_at.desc()).offset(skip).limit(limit).all()


@router.post("", response_model=QuoteResponse, status_code=status.HTTP_201_CREATED, summary="Create Quotation")
def create_quote(
    quote_in: QuoteCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """Create a new formal quote with line items."""
    existing = db.query(Quote).filter(Quote.quote_number == quote_in.quote_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Quote number already exists.")

    quote_data = quote_in.model_dump(exclude={"items"})
    quote = Quote(**quote_data, created_by_id=current_user.id)
    
    if not quote.valid_until:
        quote.valid_until = datetime.utcnow() + timedelta(days=30)

    quote_items = _recalculate_quote(quote, quote_in.items)
    quote.items = quote_items

    db.add(quote)
    db.commit()
    db.refresh(quote)
    return quote


@router.get("/{quote_id}", response_model=QuoteResponse, summary="Get Quote Details")
def get_quote(
    quote_id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """Retrieve quote details and line items."""
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found.")
    return quote


@router.put("/{quote_id}", response_model=QuoteResponse, summary="Update Quote")
def update_quote(
    quote_id: int,
    quote_in: QuoteUpdate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """Update quote details and status."""
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found.")

    update_data = quote_in.model_dump(exclude_unset=True, exclude={"items"})
    for field, val in update_data.items():
        setattr(quote, field, val)

    if quote_in.items is not None:
        db.query(QuoteItem).filter(QuoteItem.quote_id == quote.id).delete()
        quote.items = _recalculate_quote(quote, quote_in.items)
    else:
        # Recalculate totals with existing items
        tax_amount = quote.subtotal * 0.18
        total_amount = (quote.subtotal + tax_amount) - (quote.discount_amount or 0.0)
        quote.tax_amount = tax_amount
        quote.total_amount = max(total_amount, 0.0)

    db.commit()
    db.refresh(quote)
    return quote


@router.post("/{quote_id}/convert-to-invoice", response_model=InvoiceResponse, summary="Convert Quote to Invoice")
def convert_quote_to_invoice(
    quote_id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """Converts an accepted Quote into an Invoice automatically."""
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found.")

    # Update quote status
    quote.status = "Accepted"

    # Generate invoice number
    inv_number = f"INV-{quote.quote_number.replace('QT-', '')}"
    existing_inv = db.query(Invoice).filter(Invoice.invoice_number == inv_number).first()
    if existing_inv:
        inv_number = f"{inv_number}-REV"

    invoice = Invoice(
        invoice_number=inv_number,
        quote_id=quote.id,
        opportunity_id=quote.opportunity_id,
        account_id=quote.account_id,
        status="Issued",
        issue_date=datetime.utcnow(),
        due_date=datetime.utcnow() + timedelta(days=15),
        subtotal=quote.subtotal,
        discount_amount=quote.discount_amount,
        tax_amount=quote.tax_amount,
        total_amount=quote.total_amount,
        paid_amount=0.0,
        notes=f"Generated automatically from Quotation #{quote.quote_number}.",
        created_by_id=current_user.id
    )

    inv_items = []
    for item in quote.items:
        inv_items.append(InvoiceItem(
            product_id=item.product_id,
            product_name=item.product_name,
            description=item.description,
            quantity=item.quantity,
            unit_price=item.unit_price,
            discount_percent=item.discount_percent,
            total_price=item.total_price
        ))
    invoice.items = inv_items

    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice


@router.delete("/{quote_id}", summary="Delete Quote")
def delete_quote(
    quote_id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """Delete a quote record."""
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found.")

    db.delete(quote)
    db.commit()
    return {"message": f"Quote #{quote_id} deleted."}
