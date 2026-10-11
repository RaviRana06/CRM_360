from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.db.session import get_db
from app.models.role import Role, Permission, RolePermission
from app.schemas.role import RoleResponse, RoleCreate, PermissionResponse
from app.api.deps import get_current_user, RequirePermission

router = APIRouter()

@router.get("", response_model=List[RoleResponse], summary="List All Roles")
def list_roles(
    db: Session = Depends(get_db),
    current_user: Any = Depends(RequirePermission("roles", "view"))
):
    """Retrieve all roles with their assigned permissions."""
    roles = db.query(Role).all()
    return roles


@router.post("", response_model=RoleResponse, status_code=status.HTTP_201_CREATED, summary="Create Role")
def create_role(
    role_in: RoleCreate,
    db: Session = Depends(get_db),
    current_user: Any = Depends(RequirePermission("roles", "create"))
):
    """Create a new role with specific permission codes and scopes."""
    existing = db.query(Role).filter(Role.name == role_in.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role with name '{role_in.name}' already exists."
        )

    db_role = Role(
        name=role_in.name,
        description=role_in.description,
        is_system_role=False
    )
    db.add(db_role)
    db.commit()
    db.refresh(db_role)

    # Attach permissions
    for perm_assign in role_in.permissions:
        role_perm = RolePermission(
            role_id=db_role.id,
            permission_id=perm_assign.permission_id,
            scope=perm_assign.scope
        )
        db.add(role_perm)
    
    db.commit()
    db.refresh(db_role)
    return db_role


@router.get("/permissions", response_model=List[PermissionResponse], summary="List System Permissions")
def list_permissions(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Retrieve all system permissions available in CRM 360."""
    return db.query(Permission).all()
