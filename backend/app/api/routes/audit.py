from typing import Any, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.db.session import get_db
from app.api.deps import get_current_user
from app.models.employee import Employee
from app.models.auditlog import AuditLog
from app.schemas.auditlog import AuditLogResponse

router = APIRouter()

@router.get("", response_model=List[AuditLogResponse], summary="List Audit Logs")
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
    module_filter: Optional[str] = Query(None, alias="module")
) -> Any:
    """Retrieve system audit logs for administrative inspection."""
    query = db.query(AuditLog)
    if module_filter:
        query = query.filter(AuditLog.module == module_filter)

    return query.order_by(AuditLog.timestamp.desc()).limit(200).all()
