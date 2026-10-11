from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.db.session import get_db
from app.api.deps import get_current_user
from app.models.employee import Employee
from app.models.account import Account
from app.schemas.account import AccountCreate, AccountUpdate, AccountResponse
from app.core.audit import log_audit

router = APIRouter()

@router.get("", response_model=List[AccountResponse], summary="List Accounts")
def get_accounts(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None)
) -> Any:
    """Retrieve accounts/customers with filtering and search."""
    query = db.query(Account)

    if status_filter:
        query = query.filter(Account.status == status_filter)

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Account.company_name.ilike(search_fmt),
                Account.industry.ilike(search_fmt),
                Account.email.ilike(search_fmt),
                Account.phone.ilike(search_fmt)
            )
        )

    return query.order_by(Account.created_at.desc()).all()


@router.post("", response_model=AccountResponse, status_code=status.HTTP_201_CREATED, summary="Create New Account")
def create_account(
    account_in: AccountCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """Create a new account/customer record."""
    account = Account(**account_in.model_dump())
    db.add(account)
    db.commit()
    db.refresh(account)

    log_audit(
        db=db,
        action="Create",
        module="Accounts",
        user_id=current_user.id,
        user_name=f"{current_user.first_name} {current_user.last_name}",
        record_id=str(account.id),
        new_value=account.company_name
    )

    return account


@router.get("/{account_id}", response_model=AccountResponse, summary="Get Account Details")
def get_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """Get single account by ID."""
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found.")
    return account


@router.put("/{account_id}", response_model=AccountResponse, summary="Update Account Details")
def update_account(
    account_id: int,
    account_in: AccountUpdate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """Update account details."""
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found.")

    old_val = account.company_name
    update_data = account_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(account, field, val)

    db.commit()
    db.refresh(account)

    log_audit(
        db=db,
        action="Update",
        module="Accounts",
        user_id=current_user.id,
        user_name=f"{current_user.first_name} {current_user.last_name}",
        record_id=str(account.id),
        old_value=old_val,
        new_value=account.company_name
    )

    return account


@router.delete("/{account_id}", summary="Delete Account")
def delete_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """Delete an account record."""
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found.")

    db.delete(account)
    db.commit()

    log_audit(
        db=db,
        action="Delete",
        module="Accounts",
        user_id=current_user.id,
        user_name=f"{current_user.first_name} {current_user.last_name}",
        record_id=str(account_id)
    )

    return {"message": f"Account #{account_id} deleted successfully."}
