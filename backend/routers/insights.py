from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from datetime import date, timedelta
from typing import List

from database import get_db
from models import IntakeCase, Client, Staff
from schemas import InsightItem

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


@router.get("/insights", response_model=List[InsightItem])
def get_insights(db: Session = Depends(get_db)):
    insights = []
    today = date.today()
    three_days_ago = (today - timedelta(days=3)).isoformat()

    # ── 1. Insurance waiting ──────────────────────────────────────────────────
    ins_count = (
        db.query(IntakeCase)
        .filter(
            IntakeCase.status.in_(ACTIVE_STATUSES),
            IntakeCase.insurance_status == "Pending",
        )
        .count()
    )
    if ins_count > 0:
        insights.append(
            InsightItem(
                type="insurance_waiting",
                severity="warning" if ins_count >= 3 else "info",
                title="Insurance Verification Pending",
                message=f"{ins_count} {'client is' if ins_count == 1 else 'clients are'} waiting on insurance verification.",
                count=ins_count,
                link_query="insurance_status=Pending",
            )
        )

    # ── 2. High/Urgent not contacted in 3+ days ───────────────────────────────
    not_contacted = (
        db.query(IntakeCase)
        .join(Client)
        .filter(
            IntakeCase.status.in_(ACTIVE_STATUSES),
            Client.priority_level.in_(["High", "Urgent"]),
            or_(
                IntakeCase.last_contact_date.is_(None),
                IntakeCase.last_contact_date < three_days_ago,
            ),
        )
        .count()
    )
    if not_contacted > 0:
        insights.append(
            InsightItem(
                type="high_priority_not_contacted",
                severity="critical",
                title="High Priority — No Recent Contact",
                message=f"{not_contacted} high-priority {'client has' if not_contacted == 1 else 'clients have'} not been contacted in over 3 days.",
                count=not_contacted,
                link_query="flag=high_priority_not_contacted",
            )
        )

    # ── 3. Staff workload imbalance ───────────────────────────────────────────
    total_active = (
        db.query(IntakeCase)
        .filter(IntakeCase.status.in_(ACTIVE_STATUSES))
        .count()
    )
    if total_active > 0:
        staff_counts = (
            db.query(Staff.id, Staff.name, func.count(IntakeCase.id).label("cnt"))
            .join(IntakeCase, IntakeCase.assigned_to == Staff.id)
            .filter(IntakeCase.status.in_(ACTIVE_STATUSES))
            .group_by(Staff.id)
            .all()
        )
        for staff_id, staff_name, cnt in staff_counts:
            pct = round((cnt / total_active) * 100)
            if pct >= 33:
                insights.append(
                    InsightItem(
                        type="workload_imbalance",
                        severity="warning",
                        title="Staff Workload Imbalance",
                        message=f"{staff_name} has {pct}% of active intake cases.",
                        count=cnt,
                        link_query=f"assigned_to={staff_id}",
                    )
                )

    # ── 4. Ready to schedule ──────────────────────────────────────────────────
    ready = (
        db.query(IntakeCase)
        .filter(IntakeCase.status == "Ready to Schedule")
        .count()
    )
    if ready > 0:
        insights.append(
            InsightItem(
                type="ready_to_schedule",
                severity="info",
                title="Ready to Schedule",
                message=f"{ready} {'case is' if ready == 1 else 'cases are'} ready to schedule.",
                count=ready,
                link_query="status=Ready+to+Schedule",
            )
        )

    # ── 5. Missing documents with no follow-up date ───────────────────────────
    missing_no_followup = (
        db.query(IntakeCase)
        .filter(
            IntakeCase.status.in_(ACTIVE_STATUSES),
            IntakeCase.missing_documents.isnot(None),
            IntakeCase.missing_documents != "[]",
            IntakeCase.missing_documents != "",
            IntakeCase.next_follow_up_date.is_(None),
        )
        .count()
    )
    if missing_no_followup > 0:
        insights.append(
            InsightItem(
                type="missing_docs_no_followup",
                severity="warning",
                title="Missing Documents — No Follow-up Scheduled",
                message=f"{missing_no_followup} {'case has' if missing_no_followup == 1 else 'cases have'} missing documents and no follow-up date set.",
                count=missing_no_followup,
                link_query="flag=missing_docs_no_followup",
            )
        )

    # ── 6. Unassigned active cases ────────────────────────────────────────────
    unassigned = (
        db.query(IntakeCase)
        .filter(
            IntakeCase.status.in_(ACTIVE_STATUSES),
            IntakeCase.assigned_to.is_(None),
        )
        .count()
    )
    if unassigned > 0:
        insights.append(
            InsightItem(
                type="unassigned_cases",
                severity="warning",
                title="Unassigned Cases",
                message=f"{unassigned} active {'case has' if unassigned == 1 else 'cases have'} no assigned staff member.",
                count=unassigned,
                link_query="flag=unassigned",
            )
        )

    # ── 7. Insurance issue found ──────────────────────────────────────────────
    issue_found = (
        db.query(IntakeCase)
        .filter(
            IntakeCase.status.in_(ACTIVE_STATUSES),
            IntakeCase.insurance_status == "Issue Found",
        )
        .count()
    )
    if issue_found > 0:
        insights.append(
            InsightItem(
                type="insurance_issue",
                severity="critical",
                title="Insurance Issue Found",
                message=f"{issue_found} {'case has' if issue_found == 1 else 'cases have'} an insurance issue requiring attention.",
                count=issue_found,
                link_query="insurance_status=Issue+Found",
            )
        )

    return insights
