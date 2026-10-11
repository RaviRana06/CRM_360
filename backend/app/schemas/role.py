from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class PermissionBase(BaseModel):
    code: str
    name: str
    module: str
    action: str
    description: Optional[str] = None

class PermissionResponse(PermissionBase):
    id: int

    class Config:
        from_attributes = True


class RolePermissionAssign(BaseModel):
    permission_id: int
    scope: str = "all"  # own, team, company, all


class RolePermissionResponse(BaseModel):
    permission: PermissionResponse
    scope: str

    class Config:
        from_attributes = True


class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None

class RoleCreate(RoleBase):
    permissions: List[RolePermissionAssign] = []

class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permissions: Optional[List[RolePermissionAssign]] = None

class RoleResponse(RoleBase):
    id: int
    is_system_role: bool
    created_at: datetime
    role_permissions: List[RolePermissionResponse] = []

    class Config:
        from_attributes = True
