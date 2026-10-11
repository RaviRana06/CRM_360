from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.db.session import get_db
from app.api.deps import get_current_user
from app.models.employee import Employee
from app.models.lead import Lead
from app.models.opportunity import Opportunity
from app.schemas.lead import LeadCreate, LeadUpdate, LeadQualify, LeadDisqualify, LeadResponse

router = APIRouter()

@router.get("", response_model=List[LeadResponse], summary="List Leads")
def get_leads(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None)
) -> Any:
    """Retrieve leads with optional status filtering and keyword search."""
    query = db.query(Lead)

    if status_filter:
        query = query.filter(Lead.status == status_filter)

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Lead.lead_name.ilike(search_fmt),
                Lead.company_name.ilike(search_fmt),
                Lead.contact_name.ilike(search_fmt),
                Lead.email.ilike(search_fmt)
            )
        )

    return query.order_by(Lead.created_at.desc()).all()


@router.post("", response_model=LeadResponse, status_code=status.HTTP_201_CREATED, summary="Create New Lead")
def create_lead(
    lead_in: LeadCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """Create a new lead enquiry."""
    lead_data = lead_in.model_dump()
    # Sanitize empty string inputs to None for clean DB storage
    for key in ["email", "phone", "company_name", "contact_name", "requirement", "notes"]:
        if lead_data.get(key) == "":
            lead_data[key] = None

    lead = Lead(
        **lead_data,
        created_by_id=current_user.id
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead



@router.get("/{lead_id}", response_model=LeadResponse, summary="Get Lead Details")
def get_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """Retrieve specific lead record by ID."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead record not found.")
    return lead


@router.put("/{lead_id}", response_model=LeadResponse, summary="Update Lead Record")
def update_lead(
    lead_id: int,
    lead_in: LeadUpdate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """Update lead details."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead record not found.")

    update_data = lead_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(lead, field, val)

    db.commit()
    db.refresh(lead)
    return lead


@router.post("/{lead_id}/qualify", summary="Qualify Lead & Convert to Opportunity")
def qualify_lead(
    lead_id: int,
    qualify_in: LeadQualify,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """
    Qualify Lead Workflow:
    Marks lead status as 'Qualified' and automatically creates a linked Opportunity record.
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead record not found.")

    if lead.status == "Qualified":
        raise HTTPException(status_code=400, detail="Lead is already qualified.")

    # 1. Update Lead Status
    lead.status = "Qualified"
    if qualify_in.notes:
        lead.notes = f"{lead.notes or ''}\n[Qualification Note]: {qualify_in.notes}".strip()

    # 2. Check if Opportunity already exists for this lead
    opp = db.query(Opportunity).filter(Opportunity.lead_id == lead.id).first()
    if not opp:
        opp_value = qualify_in.expected_value if qualify_in.expected_value is not None else (lead.estimated_budget or 0.0)
        opp = Opportunity(
            opportunity_name=f"{lead.company_name or lead.lead_name} - Deal",
            lead_id=lead.id,
            customer_name=lead.company_name or lead.lead_name,
            contact_name=lead.contact_name or lead.lead_name,
            contact_email=lead.email,
            contact_phone=lead.phone,
            expected_value=opp_value,
            probability=qualify_in.probability or 60,
            stage="Opportunity",
            description=lead.requirement,
            assigned_to_id=lead.assigned_to_id or current_user.id,
            created_by_id=current_user.id
        )
        db.add(opp)

    db.commit()
    db.refresh(lead)

    return {
        "message": "Lead qualified successfully and converted to Opportunity!",
        "lead_id": lead.id,
        "opportunity_id": opp.id if opp else None,
        "status": lead.status
    }


@router.post("/{lead_id}/disqualify", summary="Disqualify Lead with Reason")
def disqualify_lead(
    lead_id: int,
    disqualify_in: LeadDisqualify,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """
    Disqualify Lead Workflow:
    Marks lead status as 'Disqualified' and records reason.
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead record not found.")

    lead.status = "Disqualified"
    lead.disqualification_reason = disqualify_in.disqualification_reason
    
    db.commit()
    db.refresh(lead)

    return {
        "message": "Lead disqualified successfully.",
        "lead_id": lead.id,
        "status": lead.status,
        "disqualification_reason": lead.disqualification_reason
    }


@router.delete("/{lead_id}", summary="Delete Lead Record")
def delete_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """Delete a lead record."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead record not found.")

    db.delete(lead)
    db.commit()
    return {"message": f"Lead #{lead_id} deleted successfully."}
