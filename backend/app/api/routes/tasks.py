from typing import Any, List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.db.session import get_db
from app.api.deps import get_current_user
from app.models.employee import Employee
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.core.audit import log_audit

router = APIRouter()

@router.get("", response_model=List[TaskResponse], summary="List Tasks")
def get_tasks(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
    status_filter: Optional[str] = Query(None, alias="status"),
    priority_filter: Optional[str] = Query(None, alias="priority"),
    search: Optional[str] = Query(None)
) -> Any:
    query = db.query(Task)
    if status_filter:
        query = query.filter(Task.status == status_filter)
    if priority_filter:
        query = query.filter(Task.priority == priority_filter)
    if search:
        fmt = f"%{search.strip()}%"
        query = query.filter(or_(Task.title.ilike(fmt), Task.description.ilike(fmt)))

    return query.order_by(Task.created_at.desc()).all()


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED, summary="Create Task")
def create_task(
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    task = Task(
        **task_in.model_dump(),
        created_by_id=current_user.id
    )
    if not task.assigned_to_id:
        task.assigned_to_id = current_user.id

    db.add(task)
    db.commit()
    db.refresh(task)

    log_audit(
        db=db,
        action="Create Task",
        module="Tasks",
        user_id=current_user.id,
        user_name=f"{current_user.first_name} {current_user.last_name}",
        record_id=str(task.id),
        new_value=task.title
    )

    return task


@router.put("/{task_id}", response_model=TaskResponse, summary="Update Task")
def update_task(
    task_id: int,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    update_data = task_in.model_dump(exclude_unset=True)
    if update_data.get("status") == "Completed" and task.status != "Completed":
        task.completion_date = datetime.utcnow()

    for field, val in update_data.items():
        setattr(task, field, val)

    db.commit()
    db.refresh(task)

    log_audit(
        db=db,
        action="Update Task",
        module="Tasks",
        user_id=current_user.id,
        user_name=f"{current_user.first_name} {current_user.last_name}",
        record_id=str(task.id),
        new_value=f"{task.title} ({task.status})"
    )

    return task


@router.delete("/{task_id}", summary="Delete Task")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    db.delete(task)
    db.commit()

    log_audit(
        db=db,
        action="Delete Task",
        module="Tasks",
        user_id=current_user.id,
        user_name=f"{current_user.first_name} {current_user.last_name}",
        record_id=str(task_id)
    )

    return {"message": f"Task #{task_id} deleted."}
