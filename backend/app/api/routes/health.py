from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.db.session import get_db

router = APIRouter()

@router.get("/health", summary="Database Connection & API Health Check")
def check_health(db: Session = Depends(get_db)):
    """
    Verifies that the FastAPI server is responsive and checks 
    connectivity to Microsoft SQL Server.
    """
    db_status = "disconnected"
    db_details = None
    
    try:
        # Test query against SQL Server
        result = db.execute(text("SELECT 1 AS alive, GETDATE() AS server_time")).mappings().first()
        if result and result["alive"] == 1:
            db_status = "connected"
            db_details = f"Connected to MS SQL Server successfully. Server time: {result['server_time']}"
    except Exception as e:
        db_status = "error"
        db_details = f"Connection failed: {str(e)}"

    return {
        "status": "online" if db_status == "connected" else "degraded",
        "service": "CRM 360 API Backend",
        "database": {
            "type": "Microsoft SQL Server",
            "status": db_status,
            "details": db_details
        }
    }
