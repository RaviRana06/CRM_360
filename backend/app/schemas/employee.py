from typing import Optional, List
from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.schemas.role import RoleResponse

class EmployeeBase(BaseModel):
    employee_code: str
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    role_id: int
    is_active: bool = True

class EmployeeCreate(EmployeeBase):
    password: str

class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    role_id: Optional[int] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class EmployeeResponse(EmployeeBase):
    id: int
    created_at: datetime
    role: RoleResponse

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email_or_code: str
    password: str
