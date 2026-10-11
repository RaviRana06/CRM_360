from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.db.session import get_db
from app.api.deps import get_current_user
from app.core.security import get_password_hash
from app.models.employee import Employee
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeResponse
from app.core.audit import log_audit

router = APIRouter()

@router.get("", response_model=List[EmployeeResponse], summary="List Employees")
def get_employees(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
    search: Optional[str] = Query(None)
) -> Any:
    query = db.query(Employee)
    if search:
        fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Employee.first_name.ilike(fmt),
                Employee.last_name.ilike(fmt),
                Employee.email.ilike(fmt),
                Employee.employee_code.ilike(fmt),
                Employee.department.ilike(fmt)
            )
        )
    return query.order_by(Employee.created_at.desc()).all()


@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED, summary="Create Employee")
def create_employee(
    emp_in: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    existing = db.query(Employee).filter(Employee.email == emp_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Employee with this email already exists.")

    emp_data = emp_in.model_dump()
    password = emp_data.pop("password", "Welcome@123")
    hashed_pwd = get_password_hash(password)

    emp = Employee(
        **emp_data,
        hashed_password=hashed_pwd
    )
    db.add(emp)
    db.commit()
    db.refresh(emp)

    log_audit(
        db=db,
        action="Create",
        module="Employee Master",
        user_id=current_user.id,
        user_name=f"{current_user.first_name} {current_user.last_name}",
        record_id=str(emp.id),
        new_value=f"{emp.first_name} {emp.last_name} ({emp.email})"
    )

    return emp


@router.put("/{employee_id}", response_model=EmployeeResponse, summary="Update Employee")
def update_employee(
    employee_id: int,
    emp_in: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found.")

    update_data = emp_in.model_dump(exclude_unset=True)
    if "password" in update_data and update_data["password"]:
        emp.hashed_password = get_password_hash(update_data.pop("password"))

    for field, val in update_data.items():
        setattr(emp, field, val)

    db.commit()
    db.refresh(emp)

    log_audit(
        db=db,
        action="Update",
        module="Employee Master",
        user_id=current_user.id,
        user_name=f"{current_user.first_name} {current_user.last_name}",
        record_id=str(emp.id),
        new_value=f"{emp.first_name} {emp.last_name}"
    )

    return emp
