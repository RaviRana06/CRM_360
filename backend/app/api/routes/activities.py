from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.db.session import get_db
from app.api.deps import get_current_user
from app.models.employee import Employee
from app.models.activity import Activity
from app.schemas.activity import ActivityCreate, ActivityResponse
from app.core.audit import log_audit

router = APIRouter()

@router.get("", response_model=List[ActivityResponse], summary="List Activities")
def get_activities(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
    lead_id: Optional[int] = Query(None),
    opportunity_id: Optional[int] = Query(None),
    account_id: Optional[int] = Query(None)
) -> Any:
    query = db.query(Activity)
    if lead_id:
        query = query.filter(Activity.lead_id == lead_id)
    if opportunity_id:
        query = query.filter(Activity.opportunity_id == opportunity_id)
    if account_id:
        query = query.filter(Activity.account_id == account_id)

    return query.order_by(Activity.created_at.desc()).all()


@router.post("", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED, summary="Create Activity Log")
def create_activity(
    act_in: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    act = Activity(
        **act_in.model_dump(),
        performed_by_id=current_user.id
    )
    db.add(act)
    db.commit()
    db.refresh(act)

    log_audit(
        db=db,
        action="Log Activity",
        module="Activities",
        user_id=current_user.id,
        user_name=f"{current_user.first_name} {current_user.last_name}",
        record_id=str(act.id),
        new_value=f"{act.activity_type}: {act.subject}"
    )

    return act
