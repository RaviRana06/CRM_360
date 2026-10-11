from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr

from app.api.deps import get_current_user
from app.models.employee import Employee
from app.core.email import send_email, send_quote_email, send_invoice_email

router = APIRouter()

class EmailSendRequest(BaseModel):
    to_email: EmailStr
    subject: str
    message: str

class EntityEmailRequest(BaseModel):
    to_email: EmailStr
    customer_name: Optional[str] = "Valued Customer"
    entity_number: str
    total_amount: float

@router.post("/send", summary="Send Custom Notification Email")
def send_custom_email(
    req: EmailSendRequest,
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """Send arbitrary notification email."""
    html_content = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #0f172a;">
        <h3 style="color: #6366f1;">Notification from CRM 360</h3>
        <p>{req.message}</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <small style="color: #64748b;">Sent by {current_user.first_name} {current_user.last_name} ({current_user.email})</small>
    </div>
    """
    success = send_email(req.to_email, req.subject, html_content)
    return {"message": "Notification dispatched successfully!", "status": success}

@router.post("/send-quote", summary="Send Quote Email Notification")
def dispatch_quote_email(
    req: EntityEmailRequest,
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """Send formal Quotation email to client."""
    success = send_quote_email(req.to_email, req.entity_number, req.customer_name, req.total_amount)
    return {"message": f"Quotation #{req.entity_number} sent to {req.to_email}", "status": success}

@router.post("/send-invoice", summary="Send Invoice Email Notification")
def dispatch_invoice_email(
    req: EntityEmailRequest,
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """Send formal Invoice email to client."""
    success = send_invoice_email(req.to_email, req.entity_number, req.customer_name, req.total_amount)
    return {"message": f"Invoice #{req.entity_number} sent to {req.to_email}", "status": success}
