from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.db.session import get_db
from app.core.security import verify_password, create_access_token
from app.models.employee import Employee
from app.models.role import RolePermission, Permission
from app.schemas.employee import LoginRequest, EmployeeResponse
from app.schemas.token import Token
from app.api.deps import get_current_user

router = APIRouter()

def _get_user_permissions(db: Session, role_id: int):
    """Utility to retrieve permission codes and scopes for a given role."""
    results = db.query(Permission.code, RolePermission.scope)\
        .join(RolePermission, Permission.id == RolePermission.permission_id)\
        .filter(RolePermission.role_id == role_id).all()
    
    return [{"code": r[0], "scope": r[1]} for r in results]

@router.post("/login", response_model=Token, summary="Employee Login Endpoint")
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
) -> Any:
    """
    Authenticate employee via email or employee code and password.
    Returns JWT access token with role and permission details.
    """
    # Query employee by email or employee code
    clean_identifier = login_data.email_or_code.strip()
    employee = db.query(Employee).filter(
        (Employee.email == clean_identifier) | 
        (Employee.employee_code == clean_identifier)
    ).first()


    if not employee or not verify_password(login_data.password, employee.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/employee code or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not employee.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive employee account. Contact administrator."
        )

    # Generate JWT token
    access_token = create_access_token(subject=employee.id)
    
    # Retrieve employee role and permissions
    permissions = _get_user_permissions(db, employee.role_id)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": employee.id,
            "employee_code": employee.employee_code,
            "first_name": employee.first_name,
            "last_name": employee.last_name,
            "email": employee.email,
            "role": employee.role.name if employee.role else "User",
            "role_id": employee.role_id,
            "department": employee.department,
            "designation": employee.designation,
            "permissions": permissions
        }
    }


@router.get("/me", summary="Get Current Logged-in Employee Profile")
def get_me(
    current_user: Employee = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Returns profile information and permissions for the currently authenticated employee."""
    permissions = _get_user_permissions(db, current_user.role_id)
    
    return {
        "id": current_user.id,
        "employee_code": current_user.employee_code,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "department": current_user.department,
        "designation": current_user.designation,
        "role": {
            "id": current_user.role.id,
            "name": current_user.role.name,
            "description": current_user.role.description
        },
        "permissions": permissions
    }
