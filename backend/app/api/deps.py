from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.db.session import get_db
from app.models.employee import Employee
from app.models.role import Role, RolePermission, Permission

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> Employee:
    """
    Extracts and validates JWT bearer token from Authorization header.
    Returns current authenticated Employee database model.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    employee = db.query(Employee).filter(Employee.id == int(user_id)).first()
    if not employee:
        raise credentials_exception
    if not employee.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Employee user account is inactive"
        )
    return employee


class RequirePermission:
    """
    Dynamic RBAC Backend Authorization Dependency.
    Checks whether the logged-in employee's assigned role possesses 
    the required permission (module:action, e.g., leads:create) in SQL Server.
    Admin users bypass individual permission checks.
    """
    def __init__(self, module: str, action: str):
        self.module = module
        self.action = action
        self.permission_code = f"{module}:{action}"

    def __call__(
        self,
        current_user: Employee = Depends(get_current_user),
        db: Session = Depends(get_db)
    ) -> Employee:
        # System Admin bypass
        if current_user.role and current_user.role.name == "Admin":
            return current_user

        # Query database for matching role permission
        permission_exists = db.query(RolePermission)\
            .join(Permission)\
            .filter(
                RolePermission.role_id == current_user.role_id,
                Permission.code == self.permission_code
            ).first()

        if not permission_exists:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required permission '{self.permission_code}' is missing."
            )
        return current_user
