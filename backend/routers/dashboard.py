from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime, timedelta

from database import get_db
from models import IntakeCase, Client

router = APIRouter()

ACTIVE_STATUSES = [
    "New Referral",
    "Contact Attempted",
    "Forms Sent",
    "Forms Received",
    "Insurance Pending",
    "Insurance Verified",
    "Ready to Schedule",
]

ALL_STATUSES = ACTIVE_STATUSES + ["Scheduled", "Closed"]


@router.get("/dashboard/metrics")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    seven_days_ago = datetime.utcnow() - timedelta(days=7)

    # Total active intakes
    total_active = (
        db.query(IntakeCase)
        .filter(IntakeCase.status.in_(ACTIVE_STATUSES))
        .count()
    )

    # Ready to schedule
    ready_to_schedule = (
        db.query(IntakeCase)
        .filter(IntakeCase.status == "Ready to Schedule")
        .count()
    )

    # Insurance pending (active cases only)
    insurance_pending = (
        db.query(IntakeCase)
        .filter(
            and_(
                IntakeCase.status.in_(ACTIVE_STATUSES),
                IntakeCase.insurance_status == "Pending",
            )
        )
        .count()
    )

    # Cases with missing documents (active)
    missing_docs_count = (
        db.query(IntakeCase)
        .filter(
            and_(
                IntakeCase.status.in_(ACTIVE_STATUSES),
                IntakeCase.missing_documents.isnot(None),
                IntakeCase.missing_documents != "[]",
                IntakeCase.missing_documents != "",
            )
        )
        .count()
    )

    # High or Urgent priority (active) — joins to Client for priority
    high_urgent = (
        db.query(IntakeCase)
        .join(Client)
        .filter(
            and_(
                IntakeCase.status.in_(ACTIVE_STATUSES),
                Client.priority_level.in_(["High", "Urgent"]),
            )
        )
        .count()
    )

    # Stuck: active cases not touched in over 7 days
    stuck = (
        db.query(IntakeCase)
        .filter(
            and_(
                IntakeCase.status.in_(ACTIVE_STATUSES),
                IntakeCase.updated_at < seven_days_ago,
            )
        )
        .count()
    )

    # Pipeline counts across all statuses
    pipeline = {}
    for status in ALL_STATUSES:
        pipeline[status] = (
            db.query(IntakeCase).filter(IntakeCase.status == status).count()
        )

    return {
        "total_active": total_active,
        "ready_to_schedule": ready_to_schedule,
        "insurance_pending": insurance_pending,
        "missing_documents": missing_docs_count,
        "high_urgent_priority": high_urgent,
        "stuck_over_7_days": stuck,
        "pipeline": pipeline,
    }
