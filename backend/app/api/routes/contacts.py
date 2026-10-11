from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.db.session import get_db
from app.api.deps import get_current_user
from app.models.employee import Employee
from app.models.contact import Contact
from app.schemas.contact import ContactCreate, ContactUpdate, ContactResponse
from app.core.audit import log_audit

router = APIRouter()

@router.get("", response_model=List[ContactResponse], summary="List Contacts")
def get_contacts(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
    account_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None)
) -> Any:
    """Retrieve contacts list."""
    query = db.query(Contact)

    if account_id:
        query = query.filter(Contact.account_id == account_id)

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Contact.contact_name.ilike(search_fmt),
                Contact.email.ilike(search_fmt),
                Contact.phone.ilike(search_fmt),
                Contact.designation.ilike(search_fmt)
            )
        )

    return query.order_by(Contact.created_at.desc()).all()


@router.post("", response_model=ContactResponse, status_code=status.HTTP_201_CREATED, summary="Create Contact")
def create_contact(
    contact_in: ContactCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """Create contact record."""
    contact = Contact(**contact_in.model_dump())
    db.add(contact)
    db.commit()
    db.refresh(contact)

    log_audit(
        db=db,
        action="Create",
        module="Contacts",
        user_id=current_user.id,
        user_name=f"{current_user.first_name} {current_user.last_name}",
        record_id=str(contact.id),
        new_value=contact.contact_name
    )

    return contact


@router.get("/{contact_id}", response_model=ContactResponse, summary="Get Contact Details")
def get_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found.")
    return contact


@router.put("/{contact_id}", response_model=ContactResponse, summary="Update Contact")
def update_contact(
    contact_id: int,
    contact_in: ContactUpdate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found.")

    update_data = contact_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(contact, field, val)

    db.commit()
    db.refresh(contact)

    log_audit(
        db=db,
        action="Update",
        module="Contacts",
        user_id=current_user.id,
        user_name=f"{current_user.first_name} {current_user.last_name}",
        record_id=str(contact.id),
        new_value=contact.contact_name
    )

    return contact


@router.delete("/{contact_id}", summary="Delete Contact")
def delete_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found.")

    db.delete(contact)
    db.commit()

    log_audit(
        db=db,
        action="Delete",
        module="Contacts",
        user_id=current_user.id,
        user_name=f"{current_user.first_name} {current_user.last_name}",
        record_id=str(contact_id)
    )

    return {"message": f"Contact #{contact_id} deleted successfully."}
