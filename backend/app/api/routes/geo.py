from typing import Any, List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.db.session import get_db
from app.api.deps import get_current_user
from app.models.employee import Employee
from app.models.geotracking import GeoVisit
from app.schemas.geotracking import CheckInRequest, CheckOutRequest, GeoVisitResponse
from app.core.audit import log_audit

router = APIRouter()

@router.post("/checkin", response_model=GeoVisitResponse, status_code=status.HTTP_201_CREATED, summary="Geo Check-In")
def check_in(
    req: CheckInRequest,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """Employee check-in with GPS Lat/Lng coordinates from Browser Geolocation API."""
    visit = GeoVisit(
        employee_id=current_user.id,
        account_id=req.account_id,
        contact_id=req.contact_id,
        check_in_latitude=req.latitude,
        check_in_longitude=req.longitude,
        check_in_address=req.address or f"Lat: {req.latitude:.4f}, Lng: {req.longitude:.4f}",
        purpose=req.purpose or "Customer Visit",
        remarks=req.remarks,
        status="Checked-In",
        check_in_time=datetime.utcnow()
    )
    db.add(visit)
    db.commit()
    db.refresh(visit)

    log_audit(
        db=db,
        action="Geo Check-In",
        module="Geo Tracking",
        user_id=current_user.id,
        user_name=f"{current_user.first_name} {current_user.last_name}",
        record_id=str(visit.id),
        new_value=f"Check-In at Lat: {req.latitude}, Lng: {req.longitude}"
    )

    return visit


@router.post("/checkout", response_model=GeoVisitResponse, summary="Geo Check-Out")
def check_out(
    req: CheckOutRequest,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """Employee check-out with GPS coordinates."""
    visit = db.query(GeoVisit).filter(GeoVisit.id == req.visit_id, GeoVisit.employee_id == current_user.id).first()
    if not visit:
        raise HTTPException(status_code=404, detail="Active check-in record not found.")

    visit.check_out_time = datetime.utcnow()
    visit.check_out_latitude = req.latitude
    visit.check_out_longitude = req.longitude
    visit.check_out_address = req.address or f"Lat: {req.latitude:.4f}, Lng: {req.longitude:.4f}"
    if req.remarks:
        visit.remarks = f"{visit.remarks or ''}\n[Check-out Note]: {req.remarks}".strip()
    visit.status = "Checked-Out"

    db.commit()
    db.refresh(visit)

    log_audit(
        db=db,
        action="Geo Check-Out",
        module="Geo Tracking",
        user_id=current_user.id,
        user_name=f"{current_user.first_name} {current_user.last_name}",
        record_id=str(visit.id),
        new_value=f"Check-Out at Lat: {req.latitude}, Lng: {req.longitude}"
    )

    return visit


@router.get("/visits", response_model=List[GeoVisitResponse], summary="List Visits & Location History")
def get_visits(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
    employee_id: Optional[int] = Query(None)
) -> Any:
    query = db.query(GeoVisit)
    if employee_id:
        query = query.filter(GeoVisit.employee_id == employee_id)
    return query.order_by(GeoVisit.created_at.desc()).all()


@router.get("/live-locations", summary="Get Live Employee Locations for Map Display")
def get_live_locations(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """Retrieve current/latest coordinates of checked-in employees for Leaflet Map visualization."""
    visits = db.query(GeoVisit).order_by(GeoVisit.created_at.desc()).all()
    
    # Map latest location per employee
    latest_emp_map = {}
    for v in visits:
        if v.employee_id not in latest_emp_map:
            emp = db.query(Employee).filter(Employee.id == v.employee_id).first()
            emp_name = f"{emp.first_name} {emp.last_name}" if emp else f"Emp #{v.employee_id}"
            latest_emp_map[v.employee_id] = {
                "id": v.id,
                "employee_id": v.employee_id,
                "employee_name": emp_name,
                "latitude": v.check_out_latitude if v.status == "Checked-Out" else v.check_in_latitude,
                "longitude": v.check_out_longitude if v.status == "Checked-Out" else v.check_in_longitude,
                "status": v.status,
                "address": v.check_out_address if v.status == "Checked-Out" else v.check_in_address,
                "purpose": v.purpose,
                "updated_at": v.check_out_time or v.check_in_time
            }
            
    return list(latest_emp_map.values())
