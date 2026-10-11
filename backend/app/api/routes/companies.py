from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.db.session import get_db
from app.api.deps import get_current_user
from app.models.employee import Employee
from app.models.company import Company
from app.schemas.company import CompanyCreate, CompanyUpdate, CompanyResponse
from app.core.audit import log_audit

router = APIRouter()

@router.get("", response_model=List[CompanyResponse], summary="List Companies")
def get_companies(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
    search: Optional[str] = Query(None)
) -> Any:
    query = db.query(Company)
    if search:
        fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(Company.company_name.ilike(fmt), Company.email.ilike(fmt), Company.phone.ilike(fmt))
        )
    return query.order_by(Company.created_at.desc()).all()


@router.post("", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED, summary="Create Company")
def create_company(
    company_in: CompanyCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    company = Company(**company_in.model_dump())
    db.add(company)
    db.commit()
    db.refresh(company)

    log_audit(
        db=db,
        action="Create",
        module="Company Master",
        user_id=current_user.id,
        user_name=f"{current_user.first_name} {current_user.last_name}",
        record_id=str(company.id),
        new_value=company.company_name
    )

    return company


@router.put("/{company_id}", response_model=CompanyResponse, summary="Update Company")
def update_company(
    company_id: int,
    company_in: CompanyUpdate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found.")

    update_data = company_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(company, field, val)

    db.commit()
    db.refresh(company)

    log_audit(
        db=db,
        action="Update",
        module="Company Master",
        user_id=current_user.id,
        user_name=f"{current_user.first_name} {current_user.last_name}",
        record_id=str(company.id),
        new_value=company.company_name
    )

    return company
