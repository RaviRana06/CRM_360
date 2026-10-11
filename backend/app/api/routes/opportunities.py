from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.db.session import get_db
from app.api.deps import get_current_user
from app.models.employee import Employee
from app.models.opportunity import Opportunity
from app.models.account import Account
from app.schemas.opportunity import (
    OpportunityCreate,
    OpportunityUpdate,
    OpportunityStageUpdate,
    OpportunityResponse
)

router = APIRouter()

VALID_STAGES = ["Opportunity", "Proposal", "Negotiation", "Won", "Lost"]

@router.get("", response_model=List[OpportunityResponse], summary="List Sales Opportunities")
def get_opportunities(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
    stage_filter: Optional[str] = Query(None, alias="stage"),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500)
) -> Any:
    """Retrieve sales deals with optional pipeline stage filtering, search, and pagination."""
    query = db.query(Opportunity)

    if stage_filter:
        query = query.filter(Opportunity.stage == stage_filter)

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Opportunity.opportunity_name.ilike(search_fmt),
                Opportunity.customer_name.ilike(search_fmt),
                Opportunity.contact_name.ilike(search_fmt)
            )
        )

    return query.order_by(Opportunity.created_at.desc()).offset(skip).limit(limit).all()


@router.post("", response_model=OpportunityResponse, status_code=status.HTTP_201_CREATED, summary="Create Opportunity")
def create_opportunity(
    opp_in: OpportunityCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """Create a new sales opportunity deal."""
    opp_data = opp_in.model_dump()
    for key in ["contact_name", "contact_email", "contact_phone", "description", "lost_reason"]:
        if opp_data.get(key) == "":
            opp_data[key] = None

    opp = Opportunity(
        **opp_data,
        created_by_id=current_user.id
    )
    db.add(opp)
    db.commit()
    db.refresh(opp)
    return opp


@router.get("/{opp_id}", response_model=OpportunityResponse, summary="Get Opportunity Details")
def get_opportunity(
    opp_id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """Retrieve specific opportunity record by ID."""
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity deal not found.")
    return opp


@router.put("/{opp_id}", response_model=OpportunityResponse, summary="Update Opportunity")
def update_opportunity(
    opp_id: int,
    opp_in: OpportunityUpdate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """Update opportunity details."""
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity deal not found.")

    update_data = opp_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(opp, field, val)

    db.commit()
    db.refresh(opp)
    return opp


@router.patch("/{opp_id}/stage", summary="Change Opportunity Pipeline Stage")
def update_opportunity_stage(
    opp_id: int,
    stage_in: OpportunityStageUpdate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """
    Pipeline Stage Transition Engine:
    Validates stage (Opportunity -> Proposal -> Negotiation -> Won / Lost).
    - If Lost: Requires lost_reason.
    - If Won: Automatically creates/updates Account/Customer record in database.
    """
    if stage_in.stage not in VALID_STAGES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid stage '{stage_in.stage}'. Valid stages are: {', '.join(VALID_STAGES)}"
        )

    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity deal not found.")

    # Rule: If Lost, lost_reason is required
    if stage_in.stage == "Lost":
        if not stage_in.lost_reason or not stage_in.lost_reason.strip():
            raise HTTPException(
                status_code=400,
                detail="A Lost Reason is required when marking an opportunity as Lost."
            )
        opp.lost_reason = stage_in.lost_reason.strip()
        opp.probability = 0
    elif stage_in.stage == "Won":
        opp.probability = 100
        # Automatically create Customer Account on Won deal
        existing_acc = db.query(Account).filter(Account.company_name == opp.customer_name).first()
        if not existing_acc:
            new_acc = Account(
                company_name=opp.customer_name,
                email=opp.contact_email,
                phone=opp.contact_phone,
                assigned_to_id=opp.assigned_to_id or current_user.id
            )
            db.add(new_acc)
            db.flush()
    elif stage_in.stage == "Proposal":
        opp.probability = 75
    elif stage_in.stage == "Negotiation":
        opp.probability = 90
    elif stage_in.stage == "Opportunity":
        opp.probability = 50

    opp.stage = stage_in.stage
    db.commit()
    db.refresh(opp)

    return {
        "message": f"Opportunity #{opp.id} stage updated to '{opp.stage}' successfully!",
        "id": opp.id,
        "opportunity_name": opp.opportunity_name,
        "stage": opp.stage,
        "probability": opp.probability,
        "lost_reason": opp.lost_reason
    }


@router.delete("/{opp_id}", summary="Delete Opportunity")
def delete_opportunity(
    opp_id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """Delete an opportunity deal."""
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity deal not found.")

    db.delete(opp)
    db.commit()
    return {"message": f"Opportunity #{opp_id} deleted successfully."}
