from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.db.session import get_db
from app.api.deps import get_current_user
from app.models.employee import Employee
from app.models.meeting import Meeting
from app.schemas.meeting import MeetingCreate, MeetingUpdate, MeetingResponse
from app.core.audit import log_audit

router = APIRouter()

@router.get("", response_model=List[MeetingResponse], summary="List Meetings")
def get_meetings(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None)
) -> Any:
    query = db.query(Meeting)
    if status_filter:
        query = query.filter(Meeting.status == status_filter)
    if search:
        fmt = f"%{search.strip()}%"
        query = query.filter(or_(Meeting.subject.ilike(fmt), Meeting.location.ilike(fmt)))

    return query.order_by(Meeting.meeting_date.desc()).all()


@router.post("", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED, summary="Create Meeting")
def create_meeting(
    meeting_in: MeetingCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    meeting = Meeting(
        **meeting_in.model_dump(),
        created_by_id=current_user.id
    )
    if not meeting.assigned_to_id:
        meeting.assigned_to_id = current_user.id

    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    log_audit(
        db=db,
        action="Schedule Meeting",
        module="Meetings",
        user_id=current_user.id,
        user_name=f"{current_user.first_name} {current_user.last_name}",
        record_id=str(meeting.id),
        new_value=meeting.subject
    )

    return meeting


@router.put("/{meeting_id}", response_model=MeetingResponse, summary="Update Meeting")
def update_meeting(
    meeting_id: int,
    meeting_in: MeetingUpdate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found.")

    update_data = meeting_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(meeting, field, val)

    db.commit()
    db.refresh(meeting)

    log_audit(
        db=db,
        action="Update Meeting",
        module="Meetings",
        user_id=current_user.id,
        user_name=f"{current_user.first_name} {current_user.last_name}",
        record_id=str(meeting.id),
        new_value=f"{meeting.subject} ({meeting.status})"
    )

    return meeting
