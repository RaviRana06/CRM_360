from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.db.session import get_db
from app.api.deps import get_current_user
from app.models.employee import Employee
from app.models.lead import Lead
from app.models.opportunity import Opportunity
from app.models.account import Account
from app.models.task import Task
from app.models.meeting import Meeting
from app.models.geotracking import GeoVisit

router = APIRouter()

@router.get("/summary", summary="Get Full System Reports Summary")
def get_reports_summary(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    # Leads breakdown
    leads_by_status = dict(db.query(Lead.status, func.count(Lead.id)).group_by(Lead.status).all())
    leads_by_source = dict(db.query(Lead.lead_source, func.count(Lead.id)).group_by(Lead.lead_source).all())

    # Opportunities breakdown
    opps_by_stage = dict(db.query(Opportunity.stage, func.count(Opportunity.id)).group_by(Opportunity.stage).all())
    total_expected_revenue = db.query(func.sum(Opportunity.expected_value)).filter(Opportunity.stage != "Lost").scalar() or 0.0
    won_revenue = db.query(func.sum(Opportunity.expected_value)).filter(Opportunity.stage == "Won").scalar() or 0.0

    # Accounts & Tasks breakdown
    total_accounts = db.query(Account).count()
    active_accounts = db.query(Account).filter(Account.status == "Active").count()
    
    tasks_by_status = dict(db.query(Task.status, func.count(Task.id)).group_by(Task.status).all())
    meetings_by_status = dict(db.query(Meeting.status, func.count(Meeting.id)).group_by(Meeting.status).all())

    # Geo visits count
    total_visits = db.query(GeoVisit).count()
    active_checkins = db.query(GeoVisit).filter(GeoVisit.status == "Checked-In").count()

    return {
        "leads": {
            "total": db.query(Lead).count(),
            "by_status": leads_by_status,
            "by_source": leads_by_source
        },
        "opportunities": {
            "total": db.query(Opportunity).count(),
            "by_stage": opps_by_stage,
            "pipeline_revenue": total_expected_revenue,
            "won_revenue": won_revenue
        },
        "accounts": {
            "total": total_accounts,
            "active": active_accounts
        },
        "productivity": {
            "tasks": tasks_by_status,
            "meetings": meetings_by_status
        },
        "geo": {
            "total_visits": total_visits,
            "active_checkins": active_checkins
        }
    }
