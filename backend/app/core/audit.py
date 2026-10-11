from sqlalchemy.orm import Session
from app.models.auditlog import AuditLog
from typing import Optional

def log_audit(
    db: Session,
    action: str,
    module: str,
    user_id: Optional[int] = None,
    user_name: Optional[str] = "System",
    record_id: Optional[str] = None,
    old_value: Optional[str] = None,
    new_value: Optional[str] = None,
    ip_address: Optional[str] = "127.0.0.1"
):
    try:
        log_entry = AuditLog(
            user_id=user_id,
            user_name=user_name,
            action=action,
            module=module,
            record_id=str(record_id) if record_id else None,
            old_value=old_value,
            new_value=new_value,
            ip_address=ip_address
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        print(f"Audit log warning: {e}")
        db.rollback()
